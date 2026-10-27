import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.S3_BUCKET_NAME;

if (!bucketName || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error("❌ Missing AWS credentials in .env file.");
  console.log("Please copy .env.example to .env and fill in: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME.");
  process.exit(1);
}

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const catalogPath = path.join(__dirname, "../catalog/songs.json");
const audioDir = path.join(__dirname, "../catalog/sample-audio");
const coversDir = path.join(__dirname, "../catalog/sample-covers");

async function checkBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`✅ S3 bucket "${bucketName}" exists and is accessible.`);
  } catch (err) {
    console.error(`❌ Cannot access bucket "${bucketName}". Make sure it is created in AWS S3 and region is correct (${region}).`);
    throw err;
  }
}

async function uploadFile(filePath, s3Key, contentType) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Local file not found: ${filePath}. Run 'npm run download:samples' first!`);
    return false;
  }

  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;

  const uploadParams = {
    Bucket: bucketName,
    Key: s3Key,
    Body: fileStream,
    ContentType: contentType
  };

  await s3.send(new PutObjectCommand(uploadParams));
  console.log(`🚀 Uploaded: ${s3Key} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
  return true;
}

async function runUpload() {
  await checkBucket();

  const songs = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
  console.log(`\n📦 Starting upload of ${songs.length} audio tracks and artwork to s3://${bucketName}/...\n`);

  let count = 0;
  for (const song of songs) {
    const audioLocal = path.join(audioDir, path.basename(song.s3Key));
    const coverLocal = path.join(coversDir, path.basename(song.coverKey));

    console.log(`🎵 [${song.id}] Processing "${song.title}"...`);
    const audioOk = await uploadFile(audioLocal, song.s3Key, "audio/mpeg");
    const coverOk = await uploadFile(coverLocal, song.coverKey, "image/jpeg");

    if (audioOk && coverOk) count++;
  }

  console.log(`\n🎉 Upload completed! Successfully uploaded ${count} full track packages to AWS S3.`);
}

runUpload().catch((err) => {
  console.error("❌ Upload failed:", err.message);
  process.exit(1);
});
