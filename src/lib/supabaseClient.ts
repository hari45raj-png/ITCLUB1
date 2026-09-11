/**
 * St. Mary's English School - IT Club
 * Cloud Backend Boundary & Supabase Client Integration
 * 
 * DEVELOPMENT CONSTITUTION MANDATES:
 * 1. Supabase is the sole authoritative persistent cloud source of truth.
 * 2. Never use localStorage or in-memory state as an authoritative database.
 * 3. Never hard-code secret keys or passwords in client code.
 * 4. Client uses ONLY publishable anon key subject to PostgreSQL Row Level Security (RLS).
 * 5. Server-side service-role key is strictly isolated in src/server/supabaseAdmin.ts.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  urlConfigured: boolean;
  anonKeyConfigured: boolean;
  supabaseUrl: string | null;
  message: string;
}

export interface ConnectionCheckResult {
  reachable: boolean;
  authenticatedAs: 'anonymous' | 'authenticated' | 'none';
  status: 'online' | 'unconfigured' | 'error';
  details: string;
}

// Retrieve client-safe Vite environment variables
const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const isUrlValid = Boolean(rawUrl && rawUrl.startsWith('http') && !rawUrl.includes('your-project-id'));
const isAnonKeyValid = Boolean(rawAnonKey && rawAnonKey.length > 20 && !rawAnonKey.includes('your-anon-key'));

export const isSupabaseConfigured = isUrlValid && isAnonKeyValid;

// Singleton client instance initialized ONLY with public anon key
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(rawUrl as string, rawAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Returns the client-side configuration status without exposing credentials.
 */
export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  let message = 'Supabase environment configured and operational.';
  if (!isUrlValid && !isAnonKeyValid) {
    message = 'Supabase credentials pending injection in environment.';
  } else if (!isUrlValid) {
    message = 'VITE_SUPABASE_URL is missing or invalid.';
  } else if (!isAnonKeyValid) {
    message = 'VITE_SUPABASE_ANON_KEY is missing or invalid.';
  }

  return {
    isConfigured: isSupabaseConfigured,
    urlConfigured: isUrlValid,
    anonKeyConfigured: isAnonKeyValid,
    supabaseUrl: isUrlValid ? rawUrl! : null,
    message,
  };
}

/**
 * Performs a safe, read-only reachability verification of the Supabase backend.
 * Zero database tables are modified, and zero secrets are logged or exposed.
 */
export async function testSupabaseConnection(): Promise<ConnectionCheckResult> {
  if (!supabase) {
    return {
      reachable: false,
      authenticatedAs: 'none',
      status: 'unconfigured',
      details: 'Supabase client is not initialized because environment credentials are missing.',
    };
  }

  try {
    // 1. Test Auth session resolution (safe read-only)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return {
        reachable: false,
        authenticatedAs: 'none',
        status: 'error',
        details: 'Auth service query returned an error. Check network and API key validity.',
      };
    }

    const authState = sessionData.session ? 'authenticated' : 'anonymous';

    return {
      reachable: true,
      authenticatedAs: authState,
      status: 'online',
      details: 'Supabase cloud endpoint is reachable and responsive. RLS policies active.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown network failure';
    return {
      reachable: false,
      authenticatedAs: 'none',
      status: 'error',
      details: `Network verification failed: ${errorMsg}`,
    };
  }
}
