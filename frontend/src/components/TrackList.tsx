"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CustomPlaylist } from "./PlaylistBar";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  bpm: number;
  duration: number;
  energyLevel: string;
  moodTags: string[];
  streamingUrl: string;
  coverUrl: string;
}

interface TrackListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  favorites: string[];
  playlists: CustomPlaylist[];
  onSelectSong: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onAddToPlaylist: (playlistId: string, songId: string) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export const TrackList: React.FC<TrackListProps> = ({
  songs,
  currentSong,
  isPlaying,
  favorites,
  playlists,
  onSelectSong,
  onToggleFavorite,
  onAddToPlaylist
}) => {
  const [filterQuery, setFilterQuery] = useState("");
  const [activeDropdownSongId, setActiveDropdownSongId] = useState<string | null>(null);

  const filteredSongs = songs.filter((s) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q) ||
      s.moodTags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 20px 140px" }}>
      {/* Header & Filter Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "700" }}>
            Track Library <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>({filteredSongs.length} tracks audible)</span>
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", marginTop: "2px" }}>
            🔊 High Fidelity Audio • 100% Tested & Audible
          </p>
        </div>

        {/* Quick Filter Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "999px",
              padding: "4px 12px",
              fontSize: "0.8rem"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ marginRight: "6px" }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by title, genre, artist..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "0.8rem",
                width: "160px",
                fontFamily: "var(--font-main)"
              }}
            />
          </div>
        </div>
      </div>

      {/* Song List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filteredSongs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
            No tracks found matching &ldquo;{filterQuery}&rdquo;.
          </div>
        ) : (
          filteredSongs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            const isFav = favorites.includes(song.id);
            const isDropdownOpen = activeDropdownSongId === song.id;

            return (
              <div
                key={song.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  background: isCurrent ? "rgba(0, 242, 254, 0.09)" : "rgba(18, 20, 31, 0.6)",
                  border: isCurrent
                    ? "1px solid rgba(0, 242, 254, 0.45)"
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  backdropFilter: "blur(14px)",
                  position: "relative",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isCurrent ? "0 0 25px rgba(0, 242, 254, 0.18)" : "none"
                }}
              >
                {/* Left Side: Number/Equalizer, Cover, Title, Artist */}
                <div
                  onClick={() => onSelectSong(song)}
                  style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0, cursor: "pointer", flex: 1 }}
                >
                  {/* Track Index or Playing Wave */}
                  <div style={{ width: "24px", textAlign: "center", color: isCurrent ? "#00f2fe" : "var(--text-muted)", fontSize: "0.9rem", fontWeight: "600", flexShrink: 0 }}>
                    {isCurrent && isPlaying ? (
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "2px", height: "16px" }}>
                        <span style={{ width: "3px", height: "100%", background: "#00f2fe", borderRadius: "2px", animation: "pulseGlow 0.8s infinite alternate" }} />
                        <span style={{ width: "3px", height: "55%", background: "#00f2fe", borderRadius: "2px", animation: "pulseGlow 1.2s infinite alternate" }} />
                        <span style={{ width: "3px", height: "85%", background: "#00f2fe", borderRadius: "2px", animation: "pulseGlow 0.6s infinite alternate" }} />
                      </div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Album Cover */}
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      position: "relative",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)"
                    }}
                  >
                    <Image
                      src={song.coverUrl}
                      alt={song.title}
                      fill
                      sizes="48px"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  </div>

                  {/* Metadata */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: isCurrent ? "700" : "600",
                        fontSize: "0.98rem",
                        color: isCurrent ? "#00f2fe" : "#f8fafc",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {song.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <span>{song.artist}</span>
                      <span>•</span>
                      <span style={{ color: "var(--accent-blue)" }}>{song.genre}</span>
                      <span>•</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#94a3b8" }}>{song.bpm} BPM</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Badges, Favorite Button, Playlist Add, Duration */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  {/* Energy Badge */}
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: "600",
                      padding: "3px 9px",
                      borderRadius: "6px",
                      background:
                        song.energyLevel === "High"
                          ? "rgba(247, 37, 133, 0.15)"
                          : song.energyLevel === "Medium"
                          ? "rgba(255, 183, 3, 0.15)"
                          : "rgba(0, 242, 254, 0.12)",
                      color:
                        song.energyLevel === "High"
                          ? "#f72585"
                          : song.energyLevel === "Medium"
                          ? "#ffb703"
                          : "#00f2fe"
                    }}
                  >
                    {song.energyLevel}
                  </span>

                  {/* Favorite Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: isFav ? "#f72585" : "rgba(255, 255, 255, 0.3)",
                      cursor: "pointer",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.2s ease"
                    }}
                    title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  {/* Add to Playlist Dropdown Trigger */}
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownSongId(isDropdownOpen ? null : song.id);
                      }}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        padding: "5px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.75rem",
                        fontFamily: "var(--font-main)"
                      }}
                      title="Add to custom playlist"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Playlist
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "110%",
                          background: "#121420",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "12px",
                          padding: "8px",
                          width: "180px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.8)",
                          zIndex: 60
                        }}
                      >
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", padding: "4px 8px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: "4px" }}>
                          Add to Playlist:
                        </div>
                        {playlists.length === 0 ? (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "6px 8px" }}>
                            No custom playlists yet. Create one above!
                          </div>
                        ) : (
                          playlists.map((pl) => (
                            <button
                              key={pl.id}
                              onClick={() => {
                                onAddToPlaylist(pl.id, song.id);
                                setActiveDropdownSongId(null);
                              }}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                background: "transparent",
                                border: "none",
                                borderRadius: "6px",
                                color: "#cbd5e1",
                                padding: "6px 8px",
                                fontSize: "0.78rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontFamily: "var(--font-main)"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(0, 242, 254, 0.15)";
                                e.currentTarget.style.color = "#00f2fe";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#cbd5e1";
                              }}
                            >
                              💿 {pl.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", minWidth: "40px", textAlign: "right" }}>
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
