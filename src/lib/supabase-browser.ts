import { createBrowserClient } from "@supabase/ssr";

// createBrowserClient has a built-in singleton – calling it multiple times
// with the same URL/key returns the same instance in browser environments.
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
