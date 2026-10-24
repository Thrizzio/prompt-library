import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function validateSupabaseConfig(url?: string, key?: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return {
      isValid: false,
      error: 'VITE_SUPABASE_URL is missing. Please set it in your .env file.',
    };
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        isValid: false,
        error: 'VITE_SUPABASE_URL must use http or https protocol.',
      };
    }
  } catch {
    return {
      isValid: false,
      error: 'VITE_SUPABASE_URL is not a valid URL.',
    };
  }

  if (!key || typeof key !== 'string' || !key.trim()) {
    return {
      isValid: false,
      error: 'VITE_SUPABASE_ANON_KEY is missing. Please set it in your .env file.',
    };
  }

  return { isValid: true };
}

const configStatus = validateSupabaseConfig(supabaseUrl, supabaseAnonKey);

if (!configStatus.isValid) {
  console.warn(
    `[Supabase Config Warning] ${configStatus.error} Falling back to placeholder configuration for testing.`
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
