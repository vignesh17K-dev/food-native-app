// lib/supabase-verify.ts
import { createClient } from "@supabase/supabase-js";


const supabaseUrl = 'https://nhivnrtnwavstvuxrmbf.supabase.co';
const supabaseKey ="sb_publishable_8QN1TwINCyhyelJ593wTHQ_r3XdKVic";


export const supabaseVerify = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);