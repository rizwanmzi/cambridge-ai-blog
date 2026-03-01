import { Suspense } from "react";
import NewPostForm from "./NewPostForm";

export default function NewPostPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16">
          <p className="text-navy-400">Loading...</p>
        </div>
      }
    >
      <NewPostForm />
    </Suspense>
  );
}
