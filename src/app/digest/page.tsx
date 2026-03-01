import DigestContent from "./DigestContent";

export const revalidate = 0;

export default function DigestPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">
          Programme Digest
        </h1>
        <p className="text-txt-secondary text-lg">
          AI-powered overview of the entire Cambridge AI Leadership Programme
        </p>
      </div>
      <DigestContent />
    </div>
  );
}
