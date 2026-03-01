"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowser();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    window.location.href = "/";
  }

  const inputClass = "w-full px-3 py-2.5 sm:py-3 bg-dark-surface border border-[rgba(255,255,255,0.1)] rounded-md text-sm text-txt-primary placeholder-txt-tertiary focus:outline-none focus:border-[rgba(255,255,255,0.25)]";

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-white mb-2">Sign in</h1>
          <p className="text-[13px] text-txt-tertiary">Cambridge AI Leadership Programme</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[13px] text-txt-secondary mb-1.5">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus placeholder="you@example.com" className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className="block text-[13px] text-txt-secondary mb-1.5">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Your password" className={inputClass} />
          </div>
          {error && <p className="text-sm text-txt-tertiary">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-white text-black py-2.5 sm:py-3 rounded-md text-sm font-medium hover:bg-[rgba(255,255,255,0.9)] transition-colors disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[13px] text-txt-tertiary mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-white hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
