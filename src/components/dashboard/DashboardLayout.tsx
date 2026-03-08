"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import DashboardShell from "./DashboardShell";
import type { SessionListItem } from "@/lib/dashboard-types";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function DashboardLayout({
  sessions,
  children,
}: {
  sessions: SessionListItem[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.replace("/login");
    }
  }, [loading, user, isPublicPage, router]);

  if (loading) {
    return <div className="min-h-screen bg-dark-bg" />;
  }

  // Unauthenticated on a public page (login/signup) — render normally
  if (!user) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return <DashboardShell sessions={sessions} />;
}
