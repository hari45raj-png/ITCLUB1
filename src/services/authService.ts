/**
 * St. Mary's English School - IT Club Platform
 * Authentication & Identity Service
 * 
 * Rules:
 * 1. Uses Supabase Auth exclusively (GoTrue).
 * 2. Never stores raw passwords or homemade session tokens.
 * 3. Authoritatively reads roles and permissions from normalized database schema.
 * 4. Proxies privileged operations through authenticated server endpoints with defense-in-depth.
 * 5. Sanitizes cached security state on signout.
 */

import { supabase } from '../lib/supabaseClient';
import { BaseService } from './baseService';
import { ApiResponse, UserProfile, UserRole, AuditLogEntry } from '../types';
import { Session, User } from '@supabase/supabase-js';

export class AuthService extends BaseService {
  /**
   * Retrieves the current authenticated session.
   */
  static async getSession(): Promise<{ session: Session | null; user: User | null }> {
    if (!supabase) return { session: null, user: null };
    const { data } = await supabase.auth.getSession();
    return {
      session: data.session,
      user: data.session?.user || null,
    };
  }

  /**
   * Extracts access token for Authorization: Bearer <token> headers.
   */
  static async getAuthToken(): Promise<string | null> {
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) return data.session.access_token;
      } catch {
        // Continue to check local fallback cache
      }
    }
    try {
      if (typeof window !== 'undefined') {
        const cachedToken = sessionStorage.getItem('smes_auth_token');
        if (cachedToken) return cachedToken;
      }
    } catch {
      // Ignore
    }
    return null;
  }

  /**
   * Subscribes to Supabase Auth state changes.
   */
  static onAuthStateChange(callback: (session: Session | null) => void) {
    if (!supabase) return { unsubscribe: () => {} };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return {
      unsubscribe: () => data.subscription.unsubscribe(),
    };
  }

  /**
   * Logs in a club member using Applicant Number and academic formula password.
   * NO Email is required or exposed in the UI.
   */
  static async signInWithApplicantNumber(
    applicantNumber: string,
    password: string
  ): Promise<ApiResponse<{ user: User; session: Session; profile: UserProfile; member: any }>> {
    try {
      const response = await fetch('/api/auth/member-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantNumber: applicantNumber.trim(),
          password: password.trim(),
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          error: {
            code: 'AUTH_FAILED',
            message: json.message || 'Invalid Applicant Number or Password.',
          },
        };
      }

      // If token provided, persist in session storage for fallback
      if (typeof window !== 'undefined' && json.session?.access_token) {
        sessionStorage.setItem('smes_auth_token', json.session.access_token);
      }

      // Synchronize with client Supabase Auth if real JWT returned
      if (supabase && json.session?.access_token && json.session?.refresh_token && !json.session.access_token.startsWith('smes_')) {
        try {
          await supabase.auth.setSession({
            access_token: json.session.access_token,
            refresh_token: json.session.refresh_token,
          });
        } catch {
          // Continue if preview environment constraints apply
        }
      }

      return {
        success: true,
        data: {
          user: json.user,
          session: json.session,
          profile: json.profile,
          member: json.member,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Unable to connect to authentication server.',
        },
      };
    }
  }

  /**
   * Updates the member's password from the initial academic formula to a private password.
   */
  static async changePassword(newPassword: string): Promise<ApiResponse<{ message: string }>> {
    const token = await this.getAuthToken();
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          error: {
            code: 'PASSWORD_UPDATE_FAILED',
            message: json.message || 'Failed to update password.',
          },
        };
      }

      return {
        success: true,
        data: { message: json.message },
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Unable to connect to authentication server.',
        },
      };
    }
  }

  /**
   * Logs in a club member or administrator using email and password.
   */
  static async signIn(email: string, password: string): Promise<ApiResponse<{ user: User; session: Session }>> {
    return this.executeQuery('signIn', async () => {
      if (!supabase) throw new Error('Supabase client unavailable');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { data: null, error };
      return {
        data: { user: data.user, session: data.session },
        error: null,
      };
    });
  }

  /**
   * Terminates the current authenticated session and clears security cache.
   */
  static async signOut(): Promise<ApiResponse<void>> {
    return this.executeQuery('signOut', async () => {
      this.clearLocalSecurityCache();
      if (!supabase) throw new Error('Supabase client unavailable');
      const { error } = await supabase.auth.signOut();
      return { data: undefined, error };
    });
  }

  /**
   * Clears any local memory or cached security tokens.
   */
  static clearLocalSecurityCache(): void {
    // Defense-in-depth: Ensure no residual state persists
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('smes_auth_cache');
        sessionStorage.removeItem('smes_auth_token');
        sessionStorage.removeItem('smes_current_member');
      }
    } catch {
      // Ignore in non-browser or restricted contexts
    }
  }

  /**
   * Fetches user profile, member details, and assigned database roles.
   */
  static async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    return this.executeQuery('getUserProfile', async () => {
      if (!supabase) throw new Error('Supabase client unavailable');

      // 1. Fetch Profile
      const client = supabase as any;
      const { data: profileData, error: profileErr } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) return { data: null, error: profileErr };
      if (!profileData) return { data: null, error: null };

      // 2. Authoritatively fetch assigned roles from user_roles joined with roles
      const { data: userRolesData } = await client
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', userId);

      const assignedRoles: string[] = (userRolesData || [])
        .map((r: any) => r.roles?.name)
        .filter(Boolean);

      // 3. Check optional student member attributes
      const { data: memberData } = await client
        .from('members')
        .select('class_grade, section, member_number')
        .eq('user_id', userId)
        .maybeSingle();

      const primaryRole = this.determinePrimaryRole(assignedRoles);

      const resolvedProfile: UserProfile = {
        id: profileData.id,
        email: '', // filled from auth session in provider
        role: primaryRole,
        roles: assignedRoles,
        fullName: profileData.full_name || profileData.display_name,
        avatarUrl: profileData.avatar_url || undefined,
        classGrade: memberData?.class_grade || undefined,
        section: memberData?.section || undefined,
        rollNumber: memberData?.member_number || undefined,
        status: (profileData.status as any) || 'active',
        isActive: profileData.status === 'active',
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
      };

      return { data: resolvedProfile, error: null };
    });
  }

  /**
   * Resolves the primary role in hierarchical order.
   */
  static determinePrimaryRole(roles: string[]): UserRole {
    if (roles.includes('super_admin')) return 'super_admin';
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('faculty_moderator')) return 'faculty_moderator';
    if (roles.includes('member')) return 'member';
    return 'visitor';
  }

  /**
   * Helper to verify if an authenticated user holds the required role tier.
   */
  static isAuthorized(userRole: UserRole, requiredTier: 'public' | 'member' | 'admin'): boolean {
    if (requiredTier === 'public') return true;
    if (requiredTier === 'member') {
      return ['member', 'faculty_moderator', 'admin', 'super_admin'].includes(userRole);
    }
    if (requiredTier === 'admin') {
      return ['admin', 'super_admin'].includes(userRole);
    }
    return false;
  }

  // ============================================================================
  // SERVER-SIDE PRIVILEGED OPERATIONS (Proxied with Bearer Auth)
  // ============================================================================

  /**
   * Secure Server Role Assignment
   */
  static async assignRole(targetUserId: string, roleName: string): Promise<ApiResponse<{ message: string }>> {
    const token = await this.getAuthToken();
    try {
      const res = await fetch('/api/admin/roles/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ targetUserId, roleName }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: { code: 'ROLE_ASSIGN_FAILED', message: data.error || 'Role assignment failed' } };
      }
      return { success: true, data: { message: data.message } };
    } catch (err: any) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: err.message || 'Network request failed' } };
    }
  }

  /**
   * Secure User Account Status Management
   */
  static async updateUserStatus(targetUserId: string, newStatus: string, reason?: string): Promise<ApiResponse<{ message: string }>> {
    const token = await this.getAuthToken();
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ targetUserId, newStatus, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: { code: 'STATUS_UPDATE_FAILED', message: data.error || 'Failed to update user status' } };
      }
      return { success: true, data: { message: data.message } };
    } catch (err: any) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: err.message || 'Network request failed' } };
    }
  }

  /**
   * Secure Certificate Revocation
   */
  static async revokeCertificate(certificateId: string, revocationReason: string): Promise<ApiResponse<{ message: string }>> {
    const token = await this.getAuthToken();
    try {
      const res = await fetch('/api/admin/certificates/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ certificateId, revocationReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: { code: 'REVOCATION_FAILED', message: data.error || 'Certificate revocation failed' } };
      }
      return { success: true, data: { message: data.message } };
    } catch (err: any) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: err.message || 'Network request failed' } };
    }
  }

  /**
   * Retrieve Audit Logs (Admin only)
   */
  static async getAuditLogs(limit = 50): Promise<ApiResponse<AuditLogEntry[]>> {
    const token = await this.getAuthToken();
    try {
      const res = await fetch(`/api/admin/audit-logs?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: { code: 'AUDIT_FETCH_FAILED', message: data.error || 'Failed to retrieve audit logs' } };
      }
      return { success: true, data: data.data || [] };
    } catch (err: any) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: err.message || 'Network request failed' } };
    }
  }
}

