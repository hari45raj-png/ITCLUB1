/**
 * St. Mary's English School - IT Club Platform
 * Base Service & Data Access Abstraction Layer
 * 
 * Rules:
 * 1. Components must NOT execute raw queries or hard-code table names.
 * 2. All operations route through typed service methods.
 * 3. All Supabase errors are captured, sanitized, and wrapped into ApiResponse<T>.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { ErrorHandler } from '../lib/errorHandler';
import { ApiResponse } from '../types';

export class BaseService {
  /**
   * Safe execution wrapper for Supabase database operations.
   */
  protected static async executeQuery<T>(
    operationName: string,
    queryFn: () => Promise<{ data: T | null; error: unknown }>
  ): Promise<ApiResponse<T>> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: {
          code: 'UNCONFIGURED',
          message: 'Supabase client is not configured.',
        },
      };
    }

    try {
      const { data, error } = await queryFn();

      if (error) {
        const sanitized = ErrorHandler.sanitize(error);
        return {
          success: false,
          error: {
            code: sanitized.category,
            message: sanitized.userMessage,
          },
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (err) {
      const sanitized = ErrorHandler.sanitize(err);
      return {
        success: false,
        error: {
          code: sanitized.category,
          message: sanitized.userMessage,
        },
      };
    }
  }
}
