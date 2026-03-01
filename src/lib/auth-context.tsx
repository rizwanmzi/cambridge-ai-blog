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
    const supabase = createSupabaseBrowser();
    let mounted = true;

    // Debug: log all cookie names that look like Supabase auth cookies
    const sbCookies = document.cookie
      .split(";")
      .map((c) => c.trim())
      .filter((c) => c.startsWith("sb-"));
    console.log(
      "[AuthProvider] mount – sb-* cookies found:",
      sbCookies.length,
      sbCookies.map((c) => c.substring(0, 60))
    );

    async function fetchProfile(userId: string) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        console.log("[AuthProvider] fetchProfile:", { data: !!data, error: error?.message });
        if (mounted) setProfile(data);
      } catch (err) {
        console.warn("[AuthProvider] fetchProfile exception:", err);
        if (mounted) setProfile(null);
      }
    }

    async function handleSession(session: Session | null, source: string) {
      console.log(`[AuthProvider] handleSession (${source}):`, {
        hasSession: !!session,
        userId: session?.user?.id?.substring(0, 8),
      });

      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }

      if (mounted) setLoading(false);
    }

    // 1) Explicitly read the session from cookie storage
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("[AuthProvider] getSession:", {
        hasSession: !!session,
        error: error?.message,
      });
      handleSession(session, "getSession");
    });

    // 2) Subscribe to auth changes (also fires INITIAL_SESSION)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        console.log("[AuthProvider] onAuthStateChange:", _event, "session:", !!session);
        // Skip INITIAL_SESSION since getSession above handles initial state.
        // Process all other events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
        if (_event === "INITIAL_SESSION") return;
        await handleSession(session, `onAuthStateChange:${_event}`);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
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
