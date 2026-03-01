import AskInterface from "./AskInterface";

export const revalidate = 0;

export default function AskPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-txt-primary mb-3">
          Ask the Programme
        </h1>
        <p className="text-txt-secondary text-lg">
          Ask questions about anything discussed during the programme
        </p>
      </div>
      <AskInterface />
    </div>
  );
}
