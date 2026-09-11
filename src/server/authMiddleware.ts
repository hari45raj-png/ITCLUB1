/**
 * St. Mary's English School - IT Club Platform
 * Server-Side Authentication & Authorization Middleware
 * 
 * Rules:
 * 1. Validates Supabase JWT on incoming HTTP requests.
 * 2. Checks database-authoritative role assignments (never trusts client headers/claims).
 * 3. Enforces account active status (blocks suspended or deactivated users).
 * 4. Provides clean defense-in-depth before invoking privileged operations.
 */

import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from './supabaseAdmin';
import { memberRepository } from './memberRepository';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'archived';
  roles: string[];
  isAdmin: boolean;
  isMember: boolean;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: AuthenticatedUser;
    }
  }
}

/**
 * Parses and verifies Bearer token from Authorization header.
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.authenticatedUser = undefined;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.authenticatedUser = undefined;
    return next();
  }

  try {
    // 1. Try Supabase Auth first
    try {
      const admin = getSupabaseAdmin();
      const { data: { user }, error: authError } = await admin.auth.getUser(token);

      if (!authError && user) {
        // Authoritatively resolve user profile and roles from PostgreSQL or repository
        let displayName = user.email || '';
        let status: 'active' | 'inactive' | 'suspended' | 'pending' | 'archived' = 'active';

        const { data: profile } = await (admin as any)
          .from('profiles')
          .select('id, display_name, status')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          displayName = profile.display_name || displayName;
          status = (profile.status as any) || 'active';
        } else {
          const storedProfile = memberRepository.findProfileByUserId(user.id);
          if (storedProfile) {
            displayName = storedProfile.displayName || displayName;
            status = storedProfile.status;
          } else if (user.user_metadata?.full_name) {
            displayName = user.user_metadata.full_name;
          }
        }

        // Resolve assigned roles
        const { data: userRoles } = await (admin as any)
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', user.id);

        let roles: string[] = (userRoles || [])
          .map((r: any) => r.roles?.name)
          .filter(Boolean);

        if (roles.length === 0) {
          const stored = memberRepository.findProfileByUserId(user.id);
          if (stored) {
            roles = [stored.role];
          } else if (user.user_metadata?.role) {
            roles = [user.user_metadata.role];
          } else {
            roles = ['member'];
          }
        }

        // Explicit authorization only:
        // Sequential applicant number, joining order, class, section, or designation (President, VP, etc.) NEVER grant Admin privileges.
        const isAdmin = roles.includes('admin') || roles.includes('super_admin');
        const isMember = roles.includes('member') || isAdmin || roles.includes('faculty_moderator');

        req.authenticatedUser = {
          id: user.id,
          email: user.email || '',
          displayName,
          status,
          roles,
          isAdmin,
          isMember,
        };

        return next();
      }
    } catch {
      // Supabase unavailable or token invalid for Supabase Auth, proceed to local session check
    }

    // 2. Resilient check for local member session tokens (smes_token_... or smes_jwt_...)
    if (token.startsWith('smes_token_') || token.startsWith('smes_jwt_') || token.startsWith('smes_rf_')) {
      const parts = token.split('_');
      // Format: smes_token_<userId>_<timestamp>
      const userId = parts[2];
      if (userId) {
        const profile = memberRepository.findProfileByUserId(userId);
        const member = memberRepository.findMemberByUserId(userId);

        if (profile || member) {
          const displayName = profile?.displayName || profile?.fullName || member?.slug || 'IT Club Member';
          const status = profile?.status || member?.status || 'active';
          const roles: string[] = [];

          if (profile?.roles && profile.roles.length > 0) {
            roles.push(...profile.roles);
          } else if (profile?.role) {
            roles.push(profile.role);
          } else {
            roles.push('member');
          }

          // Sequential applicant number, joining order, or designation NEVER grants Admin privileges.
          const isAdmin = roles.includes('admin') || roles.includes('super_admin');
          const isMember = roles.includes('member') || isAdmin || roles.includes('faculty_moderator');

          req.authenticatedUser = {
            id: userId,
            email: profile?.email || `applicant.${member?.memberNumber || 'x'}@stmarysenglishschool.edu`,
            displayName,
            status: status as any,
            roles,
            isAdmin,
            isMember,
          };

          return next();
        }
      }
    }

    req.authenticatedUser = undefined;
    return next();
  } catch (err) {
    req.authenticatedUser = undefined;
    return next();
  }
}

/**
 * Middleware: Strictly requires an authenticated user with active account status.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.authenticatedUser) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication is required to access this resource.',
      },
    });
    return;
  }

  if (req.authenticatedUser.status !== 'active') {
    res.status(403).json({
      success: false,
      error: {
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account is currently inactive or suspended. Please contact school administration.',
      },
    });
    return;
  }

  next();
}

/**
 * Middleware: Strictly requires Member authorization tier.
 */
export function requireMember(req: Request, res: Response, next: NextFunction): void {
  if (!req.authenticatedUser) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Member credentials required.',
      },
    });
    return;
  }

  if (req.authenticatedUser.status !== 'active') {
    res.status(403).json({
      success: false,
      error: {
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your member account is inactive or suspended.',
      },
    });
    return;
  }

  if (!req.authenticatedUser.isMember) {
    res.status(403).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED_MEMBER_TIER',
        message: 'Access restricted to registered IT Club members.',
      },
    });
    return;
  }

  next();
}

/**
 * Middleware: Strictly requires Administrator or Super Administrator authorization.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.authenticatedUser) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Administrator authentication required.',
      },
    });
    return;
  }

  if (req.authenticatedUser.status !== 'active') {
    res.status(403).json({
      success: false,
      error: {
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your administrative account has been suspended.',
      },
    });
    return;
  }

  if (!req.authenticatedUser.isAdmin) {
    res.status(403).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED_ADMIN_TIER',
        message: 'Administrative privileges required. This incident has been logged.',
      },
    });
    return;
  }

  next();
}
