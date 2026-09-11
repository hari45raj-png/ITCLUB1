/**
 * St. Mary's English School - IT Club Platform
 * Server-Side Supabase Administration Client
 * 
 * CRITICAL SECURITY CONSTITUTION:
 * 1. This file is ONLY meant for execution in Node.js server environments (e.g. server.ts, Express endpoints).
 * 2. It utilizes SUPABASE_SERVICE_ROLE_KEY to perform privileged operations (e.g. automated result calculation, user role sync).
 * 3. It MUST NEVER be imported into React components, Vite client bundles, or public HTML.
 * 4. Any attempt to instantiate this in a browser runtime will throw an immediate security exception.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

let adminClient: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  // Safety guard: Ensure we are not running inside a browser environment
  if (typeof window !== 'undefined') {
    throw new Error('FATAL SECURITY VIOLATION: Attempted to instantiate Supabase Admin Client in browser runtime.');
  }

  if (!adminClient) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new Error('Supabase URL is not configured in server environment.');
    }

    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured in server environment.');
    }

    adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

/**
 * Safe server-side diagnostic that checks if the server secret is available
 * without exposing or logging the secret value.
 */
export function checkServerSecretAvailability(): { available: boolean; keyLength: number } {
  if (typeof window !== 'undefined') {
    return { available: false, keyLength: 0 };
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    available: Boolean(key && key.length > 20),
    keyLength: key ? key.length : 0,
  };
}
