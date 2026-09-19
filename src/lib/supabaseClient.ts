import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read safe frontend credentials
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Optional fallback to localStorage for instant browser configuration
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') || '' : '';
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_key') || '' : '';

export const SUPABASE_URL = (envUrl || storedUrl).trim();
export const SUPABASE_KEY = (envKey || storedKey).trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_KEY && 
  SUPABASE_URL.startsWith('http') && 
  SUPABASE_KEY.length > 20
);

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? SUPABASE_KEY : 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export function saveCustomCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('supabase_url', url.trim());
    localStorage.setItem('supabase_key', key.trim());
    window.location.reload();
  }
}

export function clearCustomCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
    window.location.reload();
  }
}
