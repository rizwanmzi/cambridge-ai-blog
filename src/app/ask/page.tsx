import AskInterface from "./AskInterface";

export const revalidate = 0;

export default function AskPage() {
  return (
    <div className="max-w-[640px] mx-auto">
      <h1 className="text-lg font-semibold text-white mb-1">Ask the Programme</h1>
      <p className="text-[13px] text-txt-tertiary mb-6">
        Questions answered from participant posts and discussions.
      </p>
      <AskInterface />
    </div>
  );
}
