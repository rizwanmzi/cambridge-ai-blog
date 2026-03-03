"use client";

import { useEffect, useCallback } from "react";

interface PhotoLightboxProps {
  photos: { url: string; caption?: string; photographer: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: PhotoLightboxProps) {
  const photo = photos[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = photo.url;
    a.download = `photo_${currentIndex + 1}.jpg`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />

      {/* Controls */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white/60 hover:text-white text-2xl transition-colors"
      >
        &times;
      </button>
      <button
        onClick={handleDownload}
        className="absolute top-4 right-14 z-10 text-white/60 hover:text-white transition-colors"
        title="Download"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>

      {/* Nav arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 z-10 text-white/40 hover:text-white text-3xl transition-colors"
          >
            &lsaquo;
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 z-10 text-white/40 hover:text-white text-3xl transition-colors"
          >
            &rsaquo;
          </button>
        </>
      )}

      {/* Image */}
      <div className="relative z-10 max-w-[90vw] max-h-[85vh] flex flex-col items-center modal-enter">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption || "Session photo"}
          className="max-w-full max-h-[75vh] object-contain rounded-lg"
        />
        <div className="mt-3 text-center">
          {photo.caption && (
            <p className="text-sm text-white/80">{photo.caption}</p>
          )}
          <p className="text-[12px] text-white/40 mt-1">
            {photo.photographer} &middot; {currentIndex + 1}/{photos.length}
          </p>
        </div>
      </div>
    </div>
  );
}
