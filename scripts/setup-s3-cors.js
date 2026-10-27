import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.S3_BUCKET_NAME;

if (!bucketName || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error("❌ Missing AWS credentials in .env file.");
  console.log("Please copy .env.example to .env and fill in your AWS credentials & S3_BUCKET_NAME.");
  process.exit(1);
}

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function configureCors() {
  console.log(`🔧 Applying CORS configuration to S3 bucket: "${bucketName}" (${region})...`);

  const corsRules = {
    Bucket: bucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "HEAD"],
          AllowedOrigins: ["*"],
          ExposeHeaders: ["Content-Range", "Accept-Ranges", "Content-Length"],
          MaxAgeSeconds: 3600
        }
      ]
    }
  };

  try {
    await s3.send(new PutBucketCorsCommand(corsRules));
    console.log("✅ Successfully enabled CORS on your S3 bucket!");
    console.log("   Now web browsers can stream audio and render waveforms without CORS blocks.");
  } catch (error) {
    console.error("❌ Failed to apply CORS policy:", error.message);
    process.exit(1);
  }
}

configureCors();
