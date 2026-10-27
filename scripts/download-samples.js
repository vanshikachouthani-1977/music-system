import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.join(__dirname, "../catalog/songs.json");
const audioDir = path.join(__dirname, "../catalog/sample-audio");
const coversDir = path.join(__dirname, "../catalog/sample-covers");

if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      console.log(`⚡ Already downloaded: ${path.basename(destPath)}`);
      return resolve(destPath);
    }

    const client = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);

    const request = client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (response) => {
      // Follow redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return resolve(downloadFile(response.headers.location, destPath));
      }

      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error(`Failed to download ${url}: status code ${response.statusCode}`));
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close(() => {
          console.log(`✅ Downloaded: ${path.basename(destPath)} (${(fs.statSync(destPath).size / 1024 / 1024).toFixed(2)} MB)`);
          resolve(destPath);
        });
      });
    });

    request.on("error", (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function run() {
  const songs = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
  console.log(`🎧 Downloading ${songs.length} sample tracks and album covers...\n`);

  for (const song of songs) {
    const audioFilename = path.basename(song.s3Key);
    const audioDest = path.join(audioDir, audioFilename);

    const coverFilename = path.basename(song.coverKey);
    const coverDest = path.join(coversDir, coverFilename);

    console.log(`⏳ Processing: "${song.title}" by ${song.artist}...`);
    try {
      if (song.sampleUrl) {
        await downloadFile(song.sampleUrl, audioDest);
      }
      if (song.coverUrl) {
        await downloadFile(song.coverUrl, coverDest);
      }
    } catch (err) {
      console.warn(`⚠️ Warning downloading ${song.title}:`, err.message);
    }
  }

  console.log("\n🎉 All samples downloaded successfully!");
  console.log(`📁 Audio stored in: ${audioDir}`);
  console.log(`📁 Covers stored in: ${coversDir}`);
}

run().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
