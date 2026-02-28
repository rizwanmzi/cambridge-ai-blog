import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cambridge AI Leadership Programme — Live Learning Blog",
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
      <body className="bg-white text-navy-900 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-navy-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="group">
              <span className="text-lg sm:text-xl font-semibold tracking-tight">
                Cambridge AI
              </span>
              <span className="text-navy-300 text-sm sm:text-base ml-2 font-light hidden sm:inline">
                Leadership Programme
              </span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/"
                className="text-navy-200 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-navy-200 hover:text-white transition-colors"
              >
                About
              </Link>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-navy-100 bg-navy-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-sm text-navy-500">
            <p>&copy; {new Date().getFullYear()} Cambridge AI Leadership Programme</p>
            <Link
              href="/admin"
              className="text-navy-400 hover:text-navy-600 transition-colors"
            >
              Admin
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
