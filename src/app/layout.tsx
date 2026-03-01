import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import NavBar from "@/components/NavBar";

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
      <body className="bg-dark-bg text-txt-primary min-h-screen flex flex-col">
        <AuthProvider>
          <NavBar />

          {/* Main content */}
          <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-dark-border">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-txt-secondary">
              <p>
                &copy; {new Date().getFullYear()} Cambridge AI Leadership
                Programme
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
