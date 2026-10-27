# Cloud-Based AI Smart Music Player 🎵🤖

An AI-powered smart music streaming web application built with **Next.js**, **AWS S3**, **AWS Lambda**, and **Groq AI**.

---

## 💡 Proposed Solution & Scope

### 🎯 Core Features
1. **Describe Your Mood**: 
   - Natural language search bar (e.g., *"Late-night coding focus"*, *"Rainy day jazz"*).
   - **Quick Vibe Chips** (`⚡ Cyberpunk Focus`, `🌧️ Rainy Lo-Fi`, `🏋️ High-BPM Workout`).
   - **Smart Context**: Time-of-day awareness automatically suggesting appropriate music vibes.
2. **AI Works Its Magic (Groq + AWS Lambda)**:
   - Groq AI (Llama 3) analyzes user prompts and queries song metadata.
   - **Energy Curve DJ Sequencing**: Builds tracklists that flow naturally (Warm-up ➔ Peak Focus ➔ Cooldown).
   - Generates personalized AI DJ intro narrations.
3. **Instant Cloud Streaming**:
   - Audio tracks streamed directly from AWS S3 using secure presigned URLs.
   - Real-time **Web Audio API visualizer** and reactive waveforms.
   - Fast seek, crossfade, and zero-delay playback.

---

### 🚀 Future Scope
- **Multi-User Synchronized Listening Rooms**: Listen together with friends in real-time.
- **Synchronized LRC Lyrics**: Real-time karaoke-style scrolling lyrics.
- **Automated S3 Audio Ingestion**: S3 event-triggered Lambda extracting ID3 metadata and auto-tagging songs via AI.
- **Live Mood Shift**: A dynamic slider to seamlessly adjust the current playlist's energy level on the fly.

---

## 🏗️ Architecture Overview

```
User (Mood Prompt: "Late night focus")
          │
          ▼
   Next.js Web App (Audio Visualizer & Player)
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
