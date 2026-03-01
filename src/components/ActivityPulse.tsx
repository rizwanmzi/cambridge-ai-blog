export default function ActivityPulse({ postCount }: { postCount: number }) {
  if (postCount >= 5) {
    return (
      <span className="relative flex h-2.5 w-2.5" title="Hot — 5+ posts">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
    );
  }
  if (postCount >= 1) {
    return (
      <span className="relative flex h-2.5 w-2.5" title="Warm — 1-4 posts">
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
      </span>
    );
  }
  return null;
}
