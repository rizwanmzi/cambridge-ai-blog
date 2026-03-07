import AskInterface from "./AskInterface";

export const revalidate = 0;

export default function AskPage() {
  return (
    <div className="max-w-[640px] mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <span className="text-violet-400 text-sm">&#10022;</span>
        </div>
        <h1 className="text-lg font-semibold text-white">Ask the Programme</h1>
      </div>
      <p className="text-[13px] text-txt-tertiary mb-6 ml-11">
        Questions answered from participant posts and discussions.
      </p>
      <AskInterface />
    </div>
  );
}
