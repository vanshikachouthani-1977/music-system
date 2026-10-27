"use client";

import React from "react";

interface AiDjBannerProps {
  detectedMood?: string;
  energyCurve?: string;
  aiDjIntro?: string;
  trackCount: number;
  onPlaySet: () => void;
}

export const AiDjBanner: React.FC<AiDjBannerProps> = ({
  detectedMood,
  energyCurve,
  aiDjIntro,
  trackCount,
  onPlaySet
}) => {
  if (!detectedMood && !aiDjIntro) return null;

  return (
    <div
      className="glass-panel pulsing-glow"
      style={{
        maxWidth: "860px",
        margin: "15px auto 25px",
        padding: "24px 28px",
        background: "linear-gradient(135deg, rgba(157, 78, 221, 0.15) 0%, rgba(0, 242, 254, 0.1) 100%)",
        border: "1px solid rgba(157, 78, 221, 0.35)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          {/* Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #9d4edd 0%, #f72585 100%)",
                color: "#fff"
              }}
            >
              🎧 AI DJ Groq Engine
            </span>

            {detectedMood && (
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "rgba(0, 242, 254, 0.15)",
                  color: "#00f2fe",
                  border: "1px solid rgba(0, 242, 254, 0.3)"
                }}
              >
                {detectedMood}
              </span>
            )}

            {energyCurve && (
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255, 255, 255, 0.12)"
                }}
              >
                ⚡ {energyCurve}
              </span>
            )}
          </div>

          {/* AI Monologue Quote */}
          {aiDjIntro && (
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: "1.5",
                color: "#f1f5f9",
                fontStyle: "italic",
                fontWeight: "400"
              }}
            >
              &ldquo;{aiDjIntro}&rdquo;
            </p>
          )}
        </div>

        {/* Play Action Button */}
        <div>
          <button
            onClick={onPlaySet}
            className="btn-primary"
            style={{
              padding: "12px 24px",
              fontSize: "0.95rem"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Play Custom Set ({trackCount} Tracks)
          </button>
        </div>
      </div>
    </div>
  );
};
