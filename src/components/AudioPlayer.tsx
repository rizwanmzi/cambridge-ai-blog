"use client";

import { useState, useRef, useEffect } from "react";

const AUDIO_SRC = "/audio/theme.mp3";

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [minimized, setMinimized] = useState(false);

  // Autoplay on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.4;
    audio.loop = true;

    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => setPlaying(true))
        .catch(() => {
          // Autoplay blocked by browser — user needs to click
          setPlaying(false);
        });
    }
  }, []);

  // Track progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} preload="auto" />

      {/* Floating player */}
      <div className={`fixed z-50 transition-all duration-300 ${
        minimized
          ? "bottom-4 right-4"
          : "bottom-4 left-1/2 -translate-x-1/2 w-[320px] max-w-[calc(100vw-2rem)]"
      }`}>
        {minimized ? (
          /* ── Minimized: just a small circle button ── */
          <button
            onClick={() => setMinimized(false)}
            className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 backdrop-blur-xl flex items-center justify-center hover:bg-violet-500/30 transition-all duration-200 shadow-lg shadow-violet-500/10"
          >
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </button>
        ) : (
          /* ── Expanded player ── */
          <div className="bg-[#111111]/95 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-3 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-violet-500/20 border border-violet-500/25 flex items-center justify-center shrink-0 hover:bg-violet-500/30 transition-all duration-200"
              >
                {playing ? (
                  <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-violet-400 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Track info + progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[rgba(255,255,255,0.5)] font-medium truncate">
                    Off The Curb
                  </span>
                  <span className="text-[10px] text-[rgba(255,255,255,0.25)] tabular-nums ml-2 shrink-0">
                    {formatTime(progress)} / {formatTime(duration)}
                  </span>
                </div>
                {/* Progress bar */}
                <div
                  className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] cursor-pointer group"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full rounded-full bg-violet-500/60 group-hover:bg-violet-400/80 transition-colors duration-150 relative"
                    style={{ width: `${progressPct}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              {/* Minimize */}
              <button
                onClick={() => setMinimized(true)}
                className="w-6 h-6 rounded flex items-center justify-center text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.5)] transition-colors shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
