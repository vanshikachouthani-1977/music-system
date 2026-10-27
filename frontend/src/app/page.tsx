"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { MoodSearch } from "@/components/MoodSearch";
import { AiDjBanner } from "@/components/AiDjBanner";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { TrackList, Song } from "@/components/TrackList";
import { PlayerBar } from "@/components/PlayerBar";
import { PlaylistBar, CustomPlaylist } from "@/components/PlaylistBar";

export default function Home() {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [displayedSongs, setDisplayedSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Playlists & Favorites
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string>("all");

  const [aiMeta, setAiMeta] = useState<{
    detectedMood?: string;
    energyCurve?: string;
    aiDjIntro?: string;
  }>({
    detectedMood: "Cyberpunk Focus & Flow",
    energyCurve: "Warmup ➔ Peak Focus ➔ Chill Outro",
    aiDjIntro: "Welcome to AURA Music. 11 high-fidelity tracks loaded and ready to stream. Choose a playlist or ask for a mood!"
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Load initial catalog & local storage
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/catalog");
        if (res.ok) {
          const data: Song[] = await res.json();
          setAllSongs(data);
          setDisplayedSongs(data);
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
      }

      // Load saved playlists & favorites from localStorage
      try {
        const savedPlaylists = localStorage.getItem("aura_custom_playlists");
        if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));

        const savedFavorites = localStorage.getItem("aura_favorites");
        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.warn("Could not load from localStorage:", e);
      }
    }
    init();
  }, []);

  // 2. Filter displayed songs when activePlaylistId or allSongs change
  useEffect(() => {
    if (activePlaylistId === "all") {
      setDisplayedSongs(allSongs);
    } else if (activePlaylistId === "favorites") {
      setDisplayedSongs(allSongs.filter((s) => favorites.includes(s.id)));
    } else {
      const pl = playlists.find((p) => p.id === activePlaylistId);
      if (pl) {
        setDisplayedSongs(allSongs.filter((s) => pl.songIds.includes(s.id)));
      }
    }
  }, [activePlaylistId, allSongs, favorites, playlists]);

  // Playlist Management Handlers
  const handleCreatePlaylist = (name: string) => {
    const newPl: CustomPlaylist = {
      id: `pl-${Date.now()}`,
      name,
      songIds: [],
      createdAt: Date.now()
    };
    const updated = [...playlists, newPl];
    setPlaylists(updated);
    localStorage.setItem("aura_custom_playlists", JSON.stringify(updated));
    setActivePlaylistId(newPl.id);
    showToast(`✨ Created playlist "${name}"!`);
  };

  const handleToggleFavorite = (songId: string) => {
    let updated: string[];
    if (favorites.includes(songId)) {
      updated = favorites.filter((id) => id !== songId);
      showToast("💔 Removed from Favorites");
    } else {
      updated = [...favorites, songId];
      showToast("❤️ Added to Favorites!");
    }
    setFavorites(updated);
    localStorage.setItem("aura_favorites", JSON.stringify(updated));
  };

  const handleAddToPlaylist = (playlistId: string, songId: string) => {
    const updated = playlists.map((pl) => {
      if (pl.id === playlistId) {
        const songIds = pl.songIds.includes(songId) ? pl.songIds : [...pl.songIds, songId];
        return { ...pl, songIds };
      }
      return pl;
    });
    setPlaylists(updated);
    localStorage.setItem("aura_custom_playlists", JSON.stringify(updated));
    const targetPl = playlists.find((p) => p.id === playlistId);
    showToast(`🎵 Added track to "${targetPl?.name}"!`);
  };

  const currentSong = displayedSongs[currentSongIndex] || displayedSongs[0] || allSongs[0] || null;

  // Handle Mood Search
  const handleMoodSearch = async (prompt: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodPrompt: prompt, userTime: new Date().toLocaleTimeString() })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.playlist && data.playlist.length > 0) {
          setDisplayedSongs(data.playlist);
          setActivePlaylistId("all");
          setCurrentSongIndex(0);
          setAiMeta({
            detectedMood: data.detectedMood,
            energyCurve: data.energyCurve,
            aiDjIntro: data.aiDjIntro
          });

          // Auto-play the new curated set
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          }, 300);
          showToast(`🎧 AI DJ curated ${data.playlist.length} tracks for you!`);
        }
      }
    } catch (err) {
      console.error("Error generating mood playlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Audio Playback Controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.log("Play interrupted", e));
    }
  };

  const handleNext = () => {
    if (displayedSongs.length === 0) return;
    const nextIdx = (currentSongIndex + 1) % displayedSongs.length;
    setCurrentSongIndex(nextIdx);
  };

  const handlePrevious = () => {
    if (displayedSongs.length === 0) return;
    const prevIdx = (currentSongIndex - 1 + displayedSongs.length) % displayedSongs.length;
    setCurrentSongIndex(prevIdx);
  };

  const handleSelectSong = (song: Song) => {
    const idx = displayedSongs.findIndex((s) => s.id === song.id);
    if (idx !== -1) {
      setCurrentSongIndex(idx);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 100);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // Sync audio source when currentSongIndex changes
  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.streamingUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentSongIndex, currentSong?.id]);

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            right: "24px",
            background: "rgba(18, 20, 31, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 242, 254, 0.4)",
            borderRadius: "12px",
            padding: "12px 20px",
            color: "#fff",
            fontSize: "0.85rem",
            fontWeight: "600",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 242, 254, 0.2)",
            zIndex: 1000,
            animation: "pulseGlow 2s infinite"
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Top Navigation */}
      <Header />

      {/* Mood Prompt Search Section */}
      <MoodSearch onSearch={handleMoodSearch} isLoading={isLoading} />

      {/* AI DJ Persona & Intro */}
      <AiDjBanner
        detectedMood={aiMeta.detectedMood}
        energyCurve={aiMeta.energyCurve}
        aiDjIntro={aiMeta.aiDjIntro}
        trackCount={displayedSongs.length}
        onPlaySet={() => {
          if (audioRef.current) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }}
      />

      {/* Hero Visualizer Panel */}
      <div style={{ maxWidth: "860px", margin: "0 auto 20px", padding: "0 20px" }}>
        <div
          className="glass-panel"
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Live Audio Frequency Spectrum
            </span>
            <span style={{ fontSize: "0.75rem", color: isPlaying ? "#00f2fe" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: isPlaying ? "#00f2fe" : "#64748b",
                  boxShadow: isPlaying ? "0 0 10px #00f2fe" : "none"
                }}
              />
              {isPlaying ? "Audible & Streaming Active (320 kbps)" : "Playback Ready"}
            </span>
          </div>

          <AudioVisualizer isPlaying={isPlaying} audioRef={audioRef} />
        </div>
      </div>

      {/* Custom Playlist Creator & Filter Bar */}
      <PlaylistBar
        playlists={playlists}
        activePlaylistId={activePlaylistId}
        favorites={favorites}
        onSelectPlaylist={(id) => {
          setActivePlaylistId(id);
          setCurrentSongIndex(0);
        }}
        onCreatePlaylist={handleCreatePlaylist}
      />

      {/* Tracklist Library */}
      <TrackList
        songs={displayedSongs}
        currentSong={currentSong}
        isPlaying={isPlaying}
        favorites={favorites}
        playlists={playlists}
        onSelectSong={handleSelectSong}
        onToggleFavorite={handleToggleFavorite}
        onAddToPlaylist={handleAddToPlaylist}
      />

      {/* Native HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={handleNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.warn("Audio playback error:", e);
        }}
      />

      {/* Floating Bottom Music Player Bar */}
      <PlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onTogglePlay={togglePlay}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
      />
    </main>
  );
}
