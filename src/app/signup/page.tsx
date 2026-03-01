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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), accessCode: accessCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid access code"); setLoading(false); return; }
      const { role } = data;
      const supabase = createSupabaseBrowser();
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { data: { username: username.trim(), role } },
      });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) { window.location.href = "/login"; return; }
      window.location.href = "/";
    } catch { setError("Something went wrong. Please try again."); setLoading(false); }
  }

  const inputClass = "w-full px-3 py-2.5 sm:py-3 bg-dark-surface border border-[rgba(255,255,255,0.1)] rounded-md text-sm text-txt-primary placeholder-txt-tertiary focus:outline-none focus:border-[rgba(255,255,255,0.25)]";

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-white mb-2">Join the programme</h1>
          <p className="text-[13px] text-txt-tertiary">Cambridge AI Leadership Programme</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[13px] text-txt-secondary mb-1.5">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus placeholder="you@example.com" className={inputClass} />
          </div>
          <div>
            <label htmlFor="username" className="block text-[13px] text-txt-secondary mb-1.5">Username</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Display name" className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className="block text-[13px] text-txt-secondary mb-1.5">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" className={inputClass} />
          </div>
          <div>
            <label htmlFor="accessCode" className="block text-[13px] text-txt-secondary mb-1.5">Access Code</label>
            <input id="accessCode" type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} required placeholder="Enter your access code" className={inputClass} />
          </div>
          {error && <p className="text-sm text-txt-tertiary">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-white text-black py-2.5 sm:py-3 rounded-md text-sm font-medium hover:bg-[rgba(255,255,255,0.9)] transition-colors disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[13px] text-txt-tertiary mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
