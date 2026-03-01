import SparkleIcon from "./SparkleIcon";

export default function AILoadingState() {
  return (
    <div className="ai-card-loading bg-dark-surface rounded-xl p-8">
      <div className="flex items-center gap-2 mb-6">
        <SparkleIcon className="w-5 h-5 text-txt-secondary animate-pulse" />
        <span className="text-sm font-mono font-medium text-txt-secondary animate-pulse">
          AI is thinking...
        </span>
      </div>
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-dark-hover rounded w-3/4" />
        <div className="h-4 bg-dark-hover rounded w-1/2" />
        <div className="h-4 bg-dark-hover rounded w-5/6" />
        <div className="h-20 bg-dark-hover/60 rounded w-full mt-4" />
        <div className="h-4 bg-dark-hover rounded w-2/3" />
        <div className="h-4 bg-dark-hover rounded w-3/4" />
      </div>
    </div>
  );
}
