import { Groq } from "groq-sdk";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize AWS S3 client if credentials exist
const region = process.env.AWS_REGION || "us-east-1";
const s3Bucket = process.env.S3_BUCKET_NAME;
const hasAwsCreds = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && s3Bucket);

const s3 = hasAwsCreds
  ? new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    })
  : null;

// Initialize Groq AI client
const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

// Load catalog
function loadCatalog() {
  const catalogPath = path.join(__dirname, "../catalog/songs.json");
  if (fs.existsSync(catalogPath)) {
    return JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
  }
  return [];
}

/**
 * Helper to generate S3 Presigned URL for streaming
 */
async function getStreamingUrl(s3Key, fallbackUrl) {
  if (s3 && s3Bucket) {
    try {
      const command = new GetObjectCommand({
        Bucket: s3Bucket,
        Key: s3Key
      });
      // URL expires in 1 hour (3600 seconds)
      return await getSignedUrl(s3, command, { expiresIn: 3600 });
    } catch (err) {
      console.warn(`Could not generate presigned URL for ${s3Key}, using fallback:`, err.message);
    }
  }
  return fallbackUrl;
}

/**
 * AWS Lambda Handler for AI Mood Playlist Generation
 */
export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : event.body || {};
    const moodPrompt = body.moodPrompt || "late-night coding focus";
    const userTime = body.userTime || new Date().toLocaleTimeString();

    const catalog = loadCatalog();
    if (!catalog.length) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Catalog is empty." })
      };
    }

    let aiResult;

    if (groq) {
      // 1. Call Groq AI (Llama 3) to analyze mood and select playlist
      const simplifiedCatalog = catalog.map((c) => ({
        id: c.id,
        title: c.title,
        artist: c.artist,
        genre: c.genre,
        energyLevel: c.energyLevel,
        moodTags: c.moodTags,
        bpm: c.bpm
      }));

      const systemPrompt = `You are an elite AI DJ and music curation engine.
Analyze the user's mood prompt and select the best matching tracks from the given catalog.
Order the tracks using an "Energy Curve" (e.g. smooth intro -> peak energy -> chill outro).
Write a brief, cool, 1-2 sentence DJ intro monologue greeting the listener.

Return ONLY a valid JSON object with this exact structure:
{
  "detectedMood": "Short descriptive mood title (e.g., Cyberpunk Deep Focus)",
  "energyCurve": "Low to High to Cooldown",
  "aiDjIntro": "Your 1-2 sentence DJ greeting and set introduction.",
  "selectedSongIds": ["track-001", "track-003"]
}`;

      const userContent = `User Mood Prompt: "${moodPrompt}". Time of day: ${userTime}.
Catalog: ${JSON.stringify(simplifiedCatalog)}`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" }
      });

      aiResult = JSON.parse(completion.choices[0].message.content);
    } else {
      // Fallback matching when Groq API key is not yet set
      console.log("ℹ️ Running in mock AI mode (Add GROQ_API_KEY in .env for live Llama 3)");
      const lowerPrompt = moodPrompt.toLowerCase();
      const matched = catalog.filter((song) =>
        song.moodTags.some((tag) => lowerPrompt.includes(tag)) ||
        lowerPrompt.includes(song.genre.toLowerCase())
      );
      const chosen = matched.length ? matched : catalog.slice(0, 4);

      aiResult = {
        detectedMood: `Vibe Match: ${moodPrompt}`,
        energyCurve: "Adaptive Curation",
        aiDjIntro: `Welcome! Here is your curated selection for "${moodPrompt}". Enjoy the flow.`,
        selectedSongIds: chosen.map((s) => s.id)
      };
    }

    // 2. Hydrate selected songs with Presigned S3 Streaming URLs
    const playlist = await Promise.all(
      aiResult.selectedSongIds.map(async (id) => {
        const song = catalog.find((s) => s.id === id);
        if (!song) return null;

        const streamingUrl = await getStreamingUrl(song.s3Key, song.sampleUrl);
        const coverStreamingUrl = await getStreamingUrl(song.coverKey, song.coverUrl);

        return {
          ...song,
          streamingUrl,
          coverUrl: coverStreamingUrl || song.coverUrl
        };
      })
    );

    const validPlaylist = playlist.filter(Boolean);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        moodPrompt,
        detectedMood: aiResult.detectedMood,
        energyCurve: aiResult.energyCurve,
        aiDjIntro: aiResult.aiDjIntro,
        trackCount: validPlaylist.length,
        playlist: validPlaylist
      })
    };
  } catch (error) {
    console.error("Lambda execution error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
