/**
 * St. Mary's English School - IT Club Platform
 * Centralized Error Sanitization & User-Safe Reporting
 * 
 * Rules:
 * 1. Never expose raw database stack traces, SQL strings, or PostgrestError schemas.
 * 2. Never leak API keys, connection strings, or authorization headers in client displays.
 * 3. Categorize errors into clean actionable user messages.
 */

export type ErrorCategory =
  | 'AUTH_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'DATABASE_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError {
  category: ErrorCategory;
  userMessage: string;
  originalMessage?: string;
  statusCode?: number;
}

export const ErrorHandler = {
  /**
   * Sanitizes any caught error into a safe AppError object.
   */
  sanitize(error: unknown): AppError {
    if (!error) {
      return {
        category: 'UNKNOWN_ERROR',
        userMessage: 'An unexpected error occurred. Please try again.',
      };
    }

    const errorObj = error as Record<string, unknown>;
    const rawMsg = typeof errorObj.message === 'string' ? errorObj.message : String(error);
    const code = typeof errorObj.code === 'string' ? errorObj.code : '';
    const status = typeof errorObj.status === 'number' ? errorObj.status : undefined;

    // Check for Auth errors
    if (code.includes('auth') || rawMsg.toLowerCase().includes('invalid login') || rawMsg.toLowerCase().includes('jwt')) {
      return {
        category: 'AUTH_ERROR',
        userMessage: 'Authentication failed. Please verify your credentials.',
        statusCode: 401,
      };
    }

    // Check for RLS / Permission / Forbidden
    if (code === '42501' || rawMsg.toLowerCase().includes('row-level security') || rawMsg.toLowerCase().includes('permission denied')) {
      return {
        category: 'FORBIDDEN',
        userMessage: 'You do not have permission to perform this action. Administrator authorization required.',
        statusCode: 403,
      };
    }

    // Check for Not Found
    if (code === 'PGRST116' || code === 'PGRST205' || status === 404 || rawMsg.toLowerCase().includes('not found')) {
      return {
        category: 'NOT_FOUND',
        userMessage: 'The requested record or resource was not found.',
        statusCode: 404,
      };
    }

    // Check for Network failures
    if (rawMsg.toLowerCase().includes('failed to fetch') || rawMsg.toLowerCase().includes('network') || rawMsg.toLowerCase().includes('offline')) {
      return {
        category: 'NETWORK_ERROR',
        userMessage: 'Unable to connect to the cloud service. Please check your internet connection.',
      };
    }

    // Default Database / Server fallback (Strip any sensitive SQL or internal details)
    return {
      category: 'DATABASE_ERROR',
      userMessage: 'Unable to process your request at this time. Please try again later.',
      statusCode: status,
    };
  },
};
