"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface KeyboardShortcutsProps {
  onOpenCatchMeUp: () => void;
}

export default function KeyboardShortcuts({ onOpenCatchMeUp }: KeyboardShortcutsProps) {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (e.key === "Escape") {
        setShowHelp(false);
        return;
      }

      if (isInput) return;

      switch (e.key) {
        case "c":
          router.push("/new-post");
          break;
        case "/":
          e.preventDefault();
          router.push("/ask");
          break;
        case "?":
          setShowHelp((prev) => !prev);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, onOpenCatchMeUp]);

  return (
    <>
      {/* Help trigger — desktop only */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="hidden md:flex fixed bottom-4 left-4 z-30 w-7 h-7 items-center justify-center rounded-md text-[rgba(255,255,255,0.2)] hover:text-[rgba(255,255,255,0.5)] text-xs font-mono border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-colors"
        title="Keyboard shortcuts"
      >
        ?
      </button>

      {showHelp && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowHelp(false)} />
          <div className="fixed bottom-12 left-4 z-50 bg-dark-surface border border-dark-border rounded-lg p-4 text-[13px] space-y-2 shadow-lg modal-enter hidden md:block">
            <p className="text-[rgba(255,255,255,0.5)] font-medium mb-3 text-[12px] uppercase tracking-wider">Keyboard shortcuts</p>
            {[
              ["C", "New post"],
              ["/", "Ask AI"],
              ["?", "Toggle this help"],
              ["Esc", "Close modal"],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center gap-3">
                <kbd className="text-[11px] font-mono bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.5)] px-1.5 py-0.5 rounded min-w-[24px] text-center">{key}</kbd>
                <span className="text-[rgba(255,255,255,0.4)]">{desc}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
