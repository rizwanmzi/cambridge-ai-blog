"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "cambridge-ai-guide-dismissed";

export default function GuideBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm rounded-lg px-4 py-3 mb-6 flex items-start justify-between gap-3">
      <p>
        First time here? Tap <strong>Guide</strong> in the menu to learn how this blog works.
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 text-emerald-400 hover:text-emerald-200 transition-colors text-lg leading-none"
      >
        &times;
      </button>
    </div>
  );
}
