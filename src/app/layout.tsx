import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import NavBar from "@/components/NavBar";
import MobileTabBar from "@/components/MobileTabBar";

export const metadata: Metadata = {
  title: "Cambridge AI Leadership Programme — Cohort 2",
  description:
    "Insights, reflections, and key takeaways from the Cambridge AI Leadership Programme.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-dark-bg text-txt-primary min-h-screen flex flex-col">
        <AuthProvider>
          <NavBar />
          <main className="flex-1 w-full px-4 sm:px-6 py-6 sm:py-10 pb-20 md:pb-10">
            {children}
          </main>
          <MobileTabBar />
        </AuthProvider>
      </body>
    </html>
  );
}
