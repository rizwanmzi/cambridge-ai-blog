import SparkleIcon from "./SparkleIcon";

export default function AILoadingState() {
  return (
    <div className="bg-gradient-to-br from-blue-50/50 to-slate-50 rounded-xl border border-blue-100 p-8">
      <div className="flex items-center gap-2 mb-6">
        <SparkleIcon className="w-5 h-5 text-blue-500 animate-pulse" />
        <span className="text-sm font-medium text-blue-600 animate-pulse">
          AI is thinking...
        </span>
      </div>
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-blue-100/60 rounded w-3/4" />
        <div className="h-4 bg-blue-100/60 rounded w-1/2" />
        <div className="h-4 bg-blue-100/60 rounded w-5/6" />
        <div className="h-20 bg-blue-100/40 rounded w-full mt-4" />
        <div className="h-4 bg-blue-100/60 rounded w-2/3" />
        <div className="h-4 bg-blue-100/60 rounded w-3/4" />
      </div>
    </div>
  );
}
