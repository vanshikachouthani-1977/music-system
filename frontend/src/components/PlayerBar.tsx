"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Song } from "./TrackList";

interface PlayerBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        onSeek(Math.min(currentTime + 5, duration));
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        onSeek(Math.max(currentTime - 5, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTogglePlay, onSeek, currentTime, duration]);

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(prevVolume || 0.8);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "960px",
        background: "rgba(14, 16, 24, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "20px",
        padding: "12px 24px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 242, 254, 0.15)",
        zIndex: 100
      }}
    >
      {/* Top: Progress Slider Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", minWidth: "35px" }}>
          {formatDuration(currentTime)}
        </span>

        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newPercent = clickX / rect.width;
            onSeek(newPercent * duration);
          }}
          style={{
            flex: 1,
            height: "5px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "999px",
            position: "relative",
            cursor: "pointer",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #00f2fe 0%, #9d4edd 100%)",
              borderRadius: "999px"
            }}
          />
        </div>

        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", minWidth: "35px" }}>
          {formatDuration(duration || currentSong.duration)}
        </span>
      </div>

      {/* Bottom Main Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        {/* Left: Vinyl & Track Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0, flex: 1 }}>
          {/* Rotating Vinyl Disc */}
          <div
            className={isPlaying ? "spinning" : "spinning paused-spin"}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
              boxShadow: isPlaying ? "0 0 15px rgba(0, 242, 254, 0.4)" : "none",
              border: "2px solid rgba(255, 255, 255, 0.15)"
            }}
          >
            <Image
              src={currentSong.coverUrl}
              alt={currentSong.title}
              fill
              sizes="48px"
              style={{ objectFit: "cover" }}
              unoptimized
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: "700",
                fontSize: "0.95rem",
                color: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {currentSong.title}
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {currentSong.artist} • <span style={{ color: "#00f2fe" }}>{currentSong.genre}</span>
            </div>
          </div>
        </div>

        {/* Center: Playback Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Previous Button */}
          <button
            onClick={onPrevious}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px"
            }}
            title="Previous Track"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>

          {/* Main Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
              border: "none",
              color: "#060913",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 0 22px rgba(0, 242, 254, 0.5)",
              transition: "transform 0.15s ease"
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={onNext}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px"
            }}
            title="Next Track"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>
        </div>

        {/* Right: Volume Slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, justifyContent: "flex-end" }}>
          <button
            onClick={toggleMute}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "4px"
            }}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setIsMuted(val === 0);
              onVolumeChange(val);
            }}
            style={{
              width: "80px",
              accentColor: "#00f2fe",
              cursor: "pointer"
            }}
          />
        </div>
      </div>
    </div>
  );
};
