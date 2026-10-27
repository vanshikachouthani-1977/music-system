"use client";

import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying, audioRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let bars = 48;
    let waveOffsets = new Array(bars).fill(0).map(() => Math.random() * Math.PI * 2);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / bars) - 3;

      for (let i = 0; i < bars; i++) {
        let barHeight = 8;

        if (isPlaying) {
          // Dynamic organic wave animation
          waveOffsets[i] += 0.08 + (i % 3) * 0.02;
          const sine = Math.sin(waveOffsets[i]) * 0.5 + 0.5;
          const centerBias = 1 - Math.abs(i - bars / 2) / (bars / 2);
          barHeight = 12 + sine * (height * 0.75) * centerBias;
        } else {
          barHeight = 6;
        }

        const x = i * (barWidth + 3);
        const y = height - barHeight;

        // Gradient for bars: Cyan -> Purple -> Pink
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "rgba(0, 242, 254, 0.4)");
        gradient.addColorStop(0.5, "rgba(157, 78, 221, 0.8)");
        gradient.addColorStop(1, "rgba(247, 37, 133, 1)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        // Subtle glow peak on top of bars
        if (isPlaying && barHeight > 25) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x + 1, y, barWidth - 2, 2);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, audioRef]);

  return (
    <div style={{ width: "100%", height: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <canvas
        ref={canvasRef}
        width={720}
        height={90}
        style={{
          width: "100%",
          maxWidth: "720px",
          height: "90px",
          filter: "drop-shadow(0 0 12px rgba(0, 242, 254, 0.35))"
        }}
      />
    </div>
  );
};
