export default function AILoadingState() {
  return (
    <div className="border-l-2 border-ai-indigo pl-4 py-2">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-medium text-txt-tertiary">✦ AI</span>
        <span className="dot-pulse" />
      </div>
      <div className="space-y-2.5">
        <div className="h-3 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="h-3 skeleton rounded w-5/6" />
        <div className="h-3 skeleton rounded w-2/3" />
      </div>
    </div>
  );
}
