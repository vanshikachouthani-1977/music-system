"use client";

import React from "react";

export const Header: React.FC = () => {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 32px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        background: "rgba(8, 9, 14, 0.75)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}
    >
      {/* Brand Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #00f2fe 0%, #9d4edd 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(0, 242, 254, 0.4)"
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "800", letterSpacing: "-0.02em" }}>
              AURA <span className="gradient-text-cyan">MUSIC</span>
            </h1>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: "700",
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: "999px",
                background: "rgba(0, 242, 254, 0.15)",
                color: "#00f2fe",
                border: "1px solid rgba(0, 242, 254, 0.3)"
              }}
            >
              Cloud AI
            </span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Smart Audio Streamer • AWS S3 & Lambda
          </p>
        </div>
      </div>

      {/* Cloud Architecture Status Pills */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "999px",
            background: "rgba(255, 153, 0, 0.12)",
            border: "1px solid rgba(255, 153, 0, 0.3)",
            fontSize: "0.75rem",
            color: "#ffb703"
          }}
          title="Audio and album art stored on AWS S3"
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffb703" }} />
          AWS S3 Storage
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "999px",
            background: "rgba(157, 78, 221, 0.12)",
            border: "1px solid rgba(157, 78, 221, 0.3)",
            fontSize: "0.75rem",
            color: "#c77dff"
          }}
          title="Serverless AI Playlist Orchestrator"
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c77dff" }} />
          AWS Lambda
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "999px",
            background: "rgba(0, 242, 254, 0.12)",
            border: "1px solid rgba(0, 242, 254, 0.3)",
            fontSize: "0.75rem",
            color: "#00f2fe"
          }}
          title="Groq Llama-3 AI Engine"
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00f2fe" }} />
          Groq AI (Llama 3)
        </div>

        {/* GitHub Link */}
        <a
          href="https://github.com/vanshikachouthani-1977/music-system"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ padding: "6px 14px", fontSize: "0.78rem", textDecoration: "none" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          Repo
        </a>
      </div>
    </header>
  );
};
