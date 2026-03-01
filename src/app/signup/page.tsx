"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowser();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          accessCode: accessCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid access code");
        setLoading(false);
        return;
      }

      const { role } = data;

      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim(),
            role,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        window.location.href = "/login";
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputClasses = "w-full px-4 py-3 bg-dark-bg border border-[rgba(255,255,255,0.06)] rounded-lg text-txt-primary placeholder-txt-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-white mb-2">
            Join the programme
          </h1>
          <p className="text-txt-secondary text-sm">
            Cambridge AI Leadership Programme
          </p>
        </div>

        <form onSubmit={handleSignup} className="bg-dark-surface rounded-xl border border-[rgba(255,255,255,0.06)] p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-txt-secondary mb-1.5">
              Email
            </label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus placeholder="you@example.com" className={inputClasses} />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-txt-secondary mb-1.5">
              Username
            </label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Choose a display name" className={inputClasses} />
            <p className="text-txt-secondary/60 text-xs mt-1.5">
              Only your username will be displayed publicly.
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-txt-secondary mb-1.5">
              Password
            </label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" className={inputClasses} />
          </div>

          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-txt-secondary mb-1.5">
              Access Code
            </label>
            <input id="accessCode" type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} required placeholder="Enter your access code" className={inputClasses} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-txt-secondary mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
