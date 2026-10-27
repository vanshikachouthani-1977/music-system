import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";
const s3 = new S3Client({ region });
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Event-Driven AWS Lambda Function:
 * Triggered automatically by S3 ObjectCreated events when an MP3 is uploaded.
 */
export const handler = async (event) => {
  console.log("⚡ S3 Ingest Event Triggered:", JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records || []) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

      console.log(`🎵 Processing uploaded audio: s3://${bucket}/${key}`);

      if (!key.endsWith(".mp3") && !key.endsWith(".ogg") && !key.endsWith(".wav")) {
        console.log(`⏩ Skipping non-audio object: ${key}`);
        continue;
      }

      // Infer title and artist from filename (e.g. "songs/artist-title.mp3")
      const filename = key.split("/").pop().replace(/\.[^/.]+$/, "");
      const cleanTitle = filename.replace(/[-_]/g, " ");

      let suggestedTags = ["chill", "ambient", "focus"];

      // If Groq is enabled, ask AI to infer mood tags from title and filename
      if (groq) {
        try {
          const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: "You are an audio cataloging AI. Given a song title/filename, return a JSON array of 5 mood tags (e.g. ['late-night', 'focus', 'chill', 'electronic', 'lofi']). Return ONLY a JSON array."
              },
              {
                role: "user",
                content: `Song title: "${cleanTitle}"`
              }
            ]
          });
          suggestedTags = JSON.parse(completion.choices[0].message.content);
        } catch (err) {
          console.warn("Groq auto-tagging error:", err.message);
        }
      }

      const songRecord = {
        id: `track-${Date.now()}`,
        title: cleanTitle,
        s3Key: key,
        moodTags: suggestedTags,
        createdAt: new Date().toISOString()
      };

      console.log("✅ Successfully auto-tagged and prepared song record:", songRecord);
      // In production, save songRecord to DynamoDB or Firestore here:
      // await dynamoDB.send(new PutItemCommand(...));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "S3 audio ingestion completed successfully." })
    };
  } catch (err) {
    console.error("❌ S3 Ingestion failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
