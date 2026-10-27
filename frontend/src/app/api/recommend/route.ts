import { NextResponse } from "next/server";
import catalog from "@/data/songs.json";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const moodPrompt: string = body.moodPrompt || "late-night coding focus";
    const userTime: string = body.userTime || new Date().toLocaleTimeString();

    // Check if user has an external Lambda endpoint defined
    const lambdaUrl = process.env.LAMBDA_ENDPOINT_URL;
    if (lambdaUrl) {
      try {
        const lambdaRes = await fetch(lambdaUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moodPrompt, userTime })
        });
        if (lambdaRes.ok) {
          const data = await lambdaRes.json();
          return NextResponse.json(data);
        }
      } catch (lambdaErr) {
        console.warn("External Lambda call failed, falling back to local engine:", lambdaErr);
      }
    }

    // Check if GROQ_API_KEY is available directly in Next.js environment
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: `You are an elite AI DJ and music curation engine.
Analyze the user's mood prompt and select the best matching tracks from the given catalog.
Order the tracks using an "Energy Curve" (e.g. smooth intro -> peak energy -> chill outro).
Write a brief, cool, 1-2 sentence DJ intro monologue greeting the listener.

Return ONLY a valid JSON object with this exact structure:
{
  "detectedMood": "Short descriptive mood title (e.g., Cyberpunk Deep Focus)",
  "energyCurve": "Low to High to Cooldown",
  "aiDjIntro": "Your 1-2 sentence DJ greeting and set introduction.",
  "selectedSongIds": ["track-001", "track-003"]
}`
              },
              {
                role: "user",
                content: `User Mood Prompt: "${moodPrompt}". Time: ${userTime}. Catalog: ${JSON.stringify(
                  catalog.map((c) => ({
                    id: c.id,
                    title: c.title,
                    artist: c.artist,
                    genre: c.genre,
                    energyLevel: c.energyLevel,
                    moodTags: c.moodTags
                  }))
                )}`
              }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const parsed = JSON.parse(groqData.choices[0].message.content);

          const playlist = parsed.selectedSongIds
            .map((id: string) => {
              const song = catalog.find((s) => s.id === id);
              if (!song) return null;
              const filename = song.s3Key.split("/").pop();
              const coverFilename = song.coverKey.split("/").pop();
              return {
                ...song,
                streamingUrl: `/songs/${filename}`,
                coverUrl: `/covers/${coverFilename}`
              };
            })
            .filter(Boolean);

          return NextResponse.json({
            success: true,
            source: "Groq Llama 3 via Next.js / AWS Lambda",
            moodPrompt,
            detectedMood: parsed.detectedMood,
            energyCurve: parsed.energyCurve,
            aiDjIntro: parsed.aiDjIntro,
            playlist
          });
        }
      } catch (err) {
        console.warn("Groq API direct call failed, falling back to smart keyword match:", err);
      }
    }

    // Local fallback matching
    const lowerPrompt = moodPrompt.toLowerCase();
    const matched = catalog.filter(
      (song) =>
        song.moodTags.some((tag) => lowerPrompt.includes(tag.toLowerCase())) ||
        lowerPrompt.includes(song.genre.toLowerCase()) ||
        lowerPrompt.includes(song.title.toLowerCase())
    );

    const chosen = matched.length > 0 ? matched : catalog.slice(0, 5);

    const playlist = chosen.map((song) => {
      const filename = song.s3Key.split("/").pop();
      const coverFilename = song.coverKey.split("/").pop();
      return {
        ...song,
        streamingUrl: `/songs/${filename}`,
        coverUrl: `/covers/${coverFilename}`
      };
    });

    return NextResponse.json({
      success: true,
      source: "Smart Catalog Matcher",
      moodPrompt,
      detectedMood: `Vibe Match: ${moodPrompt}`,
      energyCurve: "Smooth Warmup ➔ Peak Focus ➔ Chill Outro",
      aiDjIntro: `Welcome back! Dropping a custom set tailored for "${moodPrompt}". Hit play and lock in.`,
      playlist
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
