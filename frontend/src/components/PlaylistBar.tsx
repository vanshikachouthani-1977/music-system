"use client";

import React, { useState } from "react";
import { Song } from "./TrackList";

export interface CustomPlaylist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: number;
}

interface PlaylistBarProps {
  playlists: CustomPlaylist[];
  activePlaylistId: string;
  favorites: string[];
  onSelectPlaylist: (id: string) => void;
  onCreatePlaylist: (name: string) => void;
}

export const PlaylistBar: React.FC<PlaylistBarProps> = ({
  playlists,
  activePlaylistId,
  favorites,
  onSelectPlaylist,
  onCreatePlaylist
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim());
    setNewPlaylistName("");
    setIsCreating(false);
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto 16px", padding: "0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent-cyan)" }}>
            📑 Playlists
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            (Saved locally in browser)
          </span>
        </div>

        {/* Create Playlist Button */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-secondary"
            style={{ padding: "6px 14px", fontSize: "0.8rem", borderRadius: "999px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Custom Playlist
          </button>
        ) : (
          <form onSubmit={handleCreateSubmit} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="text"
              autoFocus
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name (e.g. My Late Night Set)..."
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(0, 242, 254, 0.4)",
                borderRadius: "999px",
                padding: "6px 14px",
                color: "#fff",
                fontSize: "0.8rem",
                outline: "none",
                fontFamily: "var(--font-main)"
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: "6px 14px", fontSize: "0.78rem" }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="btn-secondary"
              style={{ padding: "6px 10px", fontSize: "0.78rem" }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Playlist Chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "6px"
        }}
      >
        {/* All Songs Pill */}
        <button
          onClick={() => onSelectPlaylist("all")}
          style={{
            background: activePlaylistId === "all" ? "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)" : "rgba(255, 255, 255, 0.05)",
            color: activePlaylistId === "all" ? "#060913" : "var(--text-secondary)",
            fontWeight: activePlaylistId === "all" ? "700" : "500",
            border: activePlaylistId === "all" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "999px",
            padding: "6px 14px",
            fontSize: "0.82rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: activePlaylistId === "all" ? "0 0 15px rgba(0, 242, 254, 0.4)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          🎵 All Library (11 Tracks)
        </button>

        {/* Favorites Pill */}
        <button
          onClick={() => onSelectPlaylist("favorites")}
          style={{
            background: activePlaylistId === "favorites" ? "linear-gradient(135deg, #f72585 0%, #9d4edd 100%)" : "rgba(255, 255, 255, 0.05)",
            color: activePlaylistId === "favorites" ? "#fff" : "var(--text-secondary)",
            fontWeight: activePlaylistId === "favorites" ? "700" : "500",
            border: activePlaylistId === "favorites" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "999px",
            padding: "6px 14px",
            fontSize: "0.82rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: activePlaylistId === "favorites" ? "0 0 15px rgba(247, 37, 133, 0.4)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          ❤️ Favorites ({favorites.length})
        </button>

        {/* Custom User Playlists */}
        {playlists.map((pl) => {
          const isActive = activePlaylistId === pl.id;
          return (
            <button
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              style={{
                background: isActive ? "linear-gradient(135deg, #9d4edd 0%, #7209b7 100%)" : "rgba(255, 255, 255, 0.05)",
                color: isActive ? "#fff" : "var(--text-secondary)",
                fontWeight: isActive ? "700" : "500",
                border: isActive ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "999px",
                padding: "6px 14px",
                fontSize: "0.82rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: isActive ? "0 0 15px rgba(157, 78, 221, 0.4)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              💿 {pl.name} ({pl.songIds.length})
            </button>
          );
        })}
      </div>
    </div>
  );
};
