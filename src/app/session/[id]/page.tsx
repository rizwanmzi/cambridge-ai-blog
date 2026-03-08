import { redirect } from "next/navigation";

export default function SessionPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/?session=${params.id}`);
}
