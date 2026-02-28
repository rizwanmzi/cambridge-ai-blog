import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Basic client for server components (read-only, no auth context)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
