"use client";

import AskInterface from "@/app/ask/AskInterface";

interface AskDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function AskDrawer({ open, onClose }: AskDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 drawer-backdrop"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-[380px] max-w-full bg-[#111111] border-l border-[rgba(255,255,255,0.06)] drawer-panel flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-copper-500/10 border border-copper-500/20 flex items-center justify-center">
              <span className="text-copper-400 text-xs ai-pulse">&#10022;</span>
            </div>
            <h2 className="text-sm font-semibold text-white">Ask the Programme</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-txt-tertiary hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <AskInterface />
        </div>
      </div>
    </>
  );
}
