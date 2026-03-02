"use client";

import { useState, useEffect } from "react";

export default function ComposerFAB() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const composer = document.getElementById("post-composer");
    if (!composer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(composer);
    return () => observer.disconnect();
  }, []);

  function scrollToComposer() {
    const composer = document.getElementById("post-composer");
    if (composer) {
      composer.scrollIntoView({ behavior: "smooth", block: "center" });
      // Focus the button/textarea after scroll
      setTimeout(() => {
        const btn = composer.querySelector("button");
        if (btn) btn.click();
      }, 400);
    }
  }

  return (
    <button
      onClick={scrollToComposer}
      className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center transition-all duration-300 md:hidden ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Write a post"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
  );
}
