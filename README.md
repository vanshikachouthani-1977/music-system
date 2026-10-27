# Cloud-Based AI Smart Music Player 🎵🤖

An AI-powered smart music streaming web application built with **Next.js**, **AWS S3**, **AWS Lambda**, and **Groq AI**.

---

## 🏗️ Architecture Overview

```
User (Mood Prompt: "Late night focus")
          │
          ▼
   Next.js Web App
          │
          ▼  (POST /api/recommend)
   AWS Lambda Function
     ├── 1. Groq API (High-speed LLM parses mood & selects matching songs)
     ├── 2. Database (Fetches metadata: title, artist, genre, mood tags)
     └── 3. AWS S3 (Generates presigned streaming URLs for audio files)
          │
          ▼
   Audio Player (Streams audio directly from AWS S3)
```

---

## ☁️ Cloud Services & Role Breakdown

| Service | Cloud Provider | Role in Project |
| :--- | :--- | :--- |
| **AWS S3** | Amazon Web Services | **Storage-as-a-Service**: Securely stores heavy MP3 audio tracks and album art covers. |
| **AWS Lambda** | Amazon Web Services | **Serverless Compute**: Securely connects to Groq AI, queries song metadata, and generates time-limited S3 streaming URLs. |
| **Groq API** | Groq Cloud | **AI-as-a-Service**: Ultra-fast LLM (Llama 3) that translates natural language mood prompts into curated playlists. |
| **Next.js** | React Framework | **Frontend Web App**: High-performance music player with glassmorphism UI, audio visualizer, and mood input. |
| **Firestore / DynamoDB** | Google / AWS | **DBaaS**: Stores song catalog metadata, genres, tempo, and mood tags. |

---

## 🚀 Quick Setup & Roadmap

1. **AWS S3 Configuration**: Create a bucket with `/songs` and `/covers` directories with CORS enabled.
2. **Catalog Metadata**: Store song records with mood tags and S3 object keys.
3. **AWS Lambda**: Deploy serverless function connecting Groq API and AWS SDK for presigned URL generation.
4. **Next.js Frontend**: Launch audio streaming player with mood prompt bar and queue controls.
