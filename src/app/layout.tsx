import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { createSupabaseServer } from "@/lib/supabase-server";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata: Metadata = {
  title: "Cambridge AI Leadership Programme — Cohort 2",
  description:
    "Insights, reflections, and key takeaways from the Cambridge AI Leadership Programme.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createSupabaseServer();
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .order("day_number")
    .order("start_time");

  const { data: postCounts } = await supabase
    .from("posts")
    .select("session_id");

  const countMap: Record<number, number> = {};
  if (postCounts) {
    for (const p of postCounts) {
      countMap[p.session_id] = (countMap[p.session_id] || 0) + 1;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionList = (sessions || []).map((s: any) => ({
    ...s,
    post_count: countMap[s.id] || 0,
  }));

  return (
    <html lang="en">
      <body className="bg-dark-bg text-txt-primary min-h-screen">
        <AuthProvider>
          <DashboardLayout sessions={sessionList}>
            {children}
          </DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
