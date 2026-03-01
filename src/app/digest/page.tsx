import DigestContent from "./DigestContent";

export const revalidate = 0;

export default function DigestPage() {
  return (
    <div className="max-w-[720px] mx-auto">
      <h1 className="text-lg font-semibold text-white mb-1">Programme Digest</h1>
      <p className="text-[13px] text-txt-tertiary mb-6">
        AI-powered overview of the Cambridge AI Leadership Programme.
      </p>
      <DigestContent />
    </div>
  );
}
