"use client";

import React, { useState, useEffect } from "react";

interface MoodSearchProps {
  onSearch: (prompt: string) => void;
  isLoading: boolean;
}

const QUICK_VIBES = [
  { label: "⚡ Cyberpunk Focus", prompt: "late-night cyberpunk coding focus electronic" },
  { label: "🌧️ Rainy Lo-Fi", prompt: "rainy day chill study coffee soft beats" },
  { label: "🏋️ Gym Adrenaline", prompt: "high energy workout motivation upbeat bass" },
  { label: "🌙 Midnight Study", prompt: "midnight deep focus ambient calm minimal" },
  { label: "🌅 Morning Zen", prompt: "peaceful morning acoustic sunrise meditation" },
  { label: "🚀 Cosmic Ambient", prompt: "space dreamy ambient slow ethereal sleep" }
];

export const MoodSearch: React.FC<MoodSearchProps> = ({ onSearch, isLoading }) => {
  const [prompt, setPrompt] = useState("");
  const [smartSuggestion, setSmartSuggestion] = useState<string>("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) {
      setSmartSuggestion("🌙 It's late night. Try: 'Midnight Deep Focus & Ambient Synth'");
    } else if (hour >= 5 && hour < 12) {
      setSmartSuggestion("🌅 Good morning! Try: 'Peaceful acoustic sunrise & focus'");
    } else if (hour >= 12 && hour < 17) {
      setSmartSuggestion("⚡ Afternoon sprint! Try: 'High productivity Lo-Fi & nu-disco'");
    } else {
      setSmartSuggestion("🌆 Evening unwinding! Try: 'Chill downtempo beats & groove'");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSearch(prompt.trim());
  };

  const handleChipClick = (vibePrompt: string) => {
    setPrompt(vibePrompt);
    onSearch(vibePrompt);
  };

  return (
    <section style={{ maxWidth: "860px", margin: "0 auto", padding: "30px 20px 10px" }}>
      {/* Smart Context Banner */}
      {smartSuggestion && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0, 242, 254, 0.08)",
            border: "1px solid rgba(0, 242, 254, 0.2)",
            borderRadius: "999px",
            padding: "6px 16px",
            fontSize: "0.82rem",
            color: "#00f2fe",
            marginBottom: "16px"
          }}
        >
          <span>{smartSuggestion}</span>
        </div>
      )}

      {/* Main Search Bar Form */}
      <form onSubmit={handleSubmit} style={{ position: "relative", width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(18, 20, 31, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "999px",
            border: "1px solid rgba(0, 242, 254, 0.3)",
            boxShadow: "0 0 35px rgba(0, 242, 254, 0.15)",
            padding: "8px 12px 8px 24px",
            transition: "all 0.3s ease"
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(0, 242, 254, 0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: "12px", flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your mood (e.g. 'late-night coding focus', 'cyberpunk sprint', 'rainy study')..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "1.05rem",
              fontFamily: "var(--font-main)"
            }}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              padding: "10px 24px",
              opacity: isLoading ? 0.7 : 1,
              pointerEvents: isLoading ? "none" : "auto"
            }}
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    border: "2px solid #060913",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }}
                />
                AI Thinking...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Generate Playlist
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Vibe Chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "16px",
          overflowX: "auto",
          paddingBottom: "8px"
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", flexShrink: 0 }}>
          Popular Vibes:
        </span>
        {QUICK_VIBES.map((vibe) => (
          <button
            key={vibe.label}
            onClick={() => handleChipClick(vibe.prompt)}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "999px",
              padding: "6px 14px",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
              fontFamily: "var(--font-main)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0, 242, 254, 0.15)";
              e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.4)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            {vibe.label}
          </button>
        ))}
      </div>
    </section>
  );
};
