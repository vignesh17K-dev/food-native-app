import { createClient } from "@supabase/supabase-js";
import config from "./utils/config";

export const supabaseVerify = createClient(
    config.supabase.url,
    config.supabase.anonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);