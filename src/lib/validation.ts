/**
 * St. Mary's English School - IT Club Platform
 * Centralized Validation Layer
 * 
 * Rules:
 * 1. Double-guard: Validate on client for UX, validate on server/DB for integrity.
 * 2. Sanitize user input to prevent XSS and malformed payloads.
 * 3. Enforce strict file upload size and MIME-type restrictions.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const Validation = {
  /**
   * Validates standard student/member email addresses.
   */
  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Validates secure password requirements (minimum 8 chars, 1 number, 1 letter).
   */
  isValidPassword(password: string): ValidationResult {
    if (!password || password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one letter and one number.' };
    }
    return { isValid: true };
  },

  /**
   * Validates certificate verification code format (e.g. SMES-IT-2026-9812 or UUID).
   */
  isValidCertificateCode(code: string): boolean {
    if (!code) return false;
    const trimmed = code.trim().toUpperCase();
    // Standard format: SMES-IT-YYYY-XXXX or standard UUID
    const certRegex = /^(SMES-IT-\d{4}-[A-Z0-9]{4,8}|[a-f0-9-]{36})$/i;
    return certRegex.test(trimmed);
  },

  /**
   * Validates text field bounds to prevent buffer bloat.
   */
  isValidText(text: string, minLength = 1, maxLength = 500): ValidationResult {
    if (!text || typeof text !== 'string') {
      return { isValid: false, error: 'Value is required.' };
    }
    const len = text.trim().length;
    if (len < minLength) {
      return { isValid: false, error: `Must be at least ${minLength} characters.` };
    }
    if (len > maxLength) {
      return { isValid: false, error: `Cannot exceed ${maxLength} characters.` };
    }
    return { isValid: true };
  },

  /**
   * Sanitizes text to remove unsafe HTML tags.
   */
  sanitizeText(input: string): string {
    if (!input) return '';
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  },

  /**
   * Validates file uploads before sending to Supabase Storage.
   */
  validateFile(file: File, allowedTypes: string[], maxSizeBytes: number): ValidationResult {
    if (!file) {
      return { isValid: false, error: 'No file selected.' };
    }
    if (file.size > maxSizeBytes) {
      const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
      return { isValid: false, error: `File size exceeds the maximum allowed limit of ${maxMb}MB.` };
    }
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return { isValid: false, error: `Invalid file type (${file.type}). Allowed: ${allowedTypes.join(', ')}` };
    }
    return { isValid: true };
  },
};
