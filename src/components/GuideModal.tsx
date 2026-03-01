"use client";

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GuideModal({ open, onClose }: GuideModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="modal-enter relative bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-sm font-medium text-white">How to use this blog</span>
          <button
            onClick={onClose}
            className="text-txt-tertiary hover:text-txt-secondary transition-colors text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto flex-1">
          <ol className="space-y-3 text-sm text-[rgba(255,255,255,0.7)] list-decimal list-inside">
            <li>Tap any session on the Programme Agenda to open it</li>
            <li>Use &ldquo;Write something...&rdquo; to post insights, notes, or reflections during or after each session</li>
            <li>Choose a post type: Live Insight, Formal Notes, Key Takeaway, or Reflection</li>
            <li>Comment on others&rsquo; posts to join the conversation</li>
            <li>Use the AI Summary tab to see AI-generated session highlights</li>
            <li>Use Ask to chat with the AI about programme content</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
