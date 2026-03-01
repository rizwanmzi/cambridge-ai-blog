"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { createSupabaseBrowser } from "./supabase-browser";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  role: "Admin" | "Attendee" | "Observer";
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let supabase: ReturnType<typeof createSupabaseBrowser>;
    try {
      supabase = createSupabaseBrowser();
    } catch (err) {
      console.error("[AuthProvider] Failed to create Supabase client:", err);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchProfile(userId: string, accessToken: string) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const rows = await res.json();
        if (mounted && rows?.length > 0) {
          setProfile(rows[0]);
        }
      } catch {
        if (mounted) setProfile(null);
      }
    }

    async function handleSession(session: Session | null) {
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser && session?.access_token) {
        await fetchProfile(currentUser.id, session.access_token);
      } else {
        setProfile(null);
      }

      if (mounted) setLoading(false);
    }

    // Read session from cookie storage
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => handleSession(session))
      .catch(() => {
        if (mounted) setLoading(false);
      });

    // Subscribe to auth changes
    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (_event: string, session: Session | null) => {
          if (_event === "INITIAL_SESSION") return;
          await handleSession(session);
        }
      );
      subscription = data.subscription;
    } catch {
      if (mounted) setLoading(false);
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function signOut() {
    try {
      const supabase = createSupabaseBrowser();
      await supabase.auth.signOut();
    } catch {
      // continue to clear state even if sign-out request fails
    }
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
