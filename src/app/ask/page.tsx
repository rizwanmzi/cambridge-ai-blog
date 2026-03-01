import AskInterface from "./AskInterface";

export const revalidate = 0;

export default function AskPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-3">
          Ask the Programme
        </h1>
        <p className="text-navy-500 text-lg">
          Ask questions about anything discussed during the programme
        </p>
      </div>
      <AskInterface />
    </div>
  );
}
