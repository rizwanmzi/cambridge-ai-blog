"use client";

import { useAuth } from "@/lib/auth-context";
import DashboardShell from "./DashboardShell";
import type { SessionListItem } from "@/lib/dashboard-types";

export default function DashboardLayout({
  sessions,
  children,
}: {
  sessions: SessionListItem[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-dark-bg" />;
  }

  if (!user) {
    return <main className="flex-1 w-full px-4 sm:px-6 py-6 sm:py-10">{children}</main>;
  }

  return <DashboardShell sessions={sessions} />;
}
