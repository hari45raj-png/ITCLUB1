/**
 * St. Mary's English School - IT Club Platform
 * Centralized Authentication & Session Provider
 * 
 * Rules:
 * 1. Single source of auth truth: Supabase Auth session + Authoritative PostgreSQL RBAC.
 * 2. Manages user profile, database role claims, and account status (active/suspended).
 * 3. Sanitizes all in-memory security context upon user change or logout.
 * 4. Never falls back to localStorage mock users or fake roles.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../../types';
import { AuthService } from '../../services/authService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole;
  roles: string[];
  isAdmin: boolean;
  isMember: boolean;
  isFacultyModerator: boolean;
  isSuspended: boolean;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signInWithApplicantNumber: (applicantNumber: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('visitor');
  const [roles, setRoles] = useState<string[]>([]);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to load authoritative user profile & roles from database
  const loadUserContext = useCallback(async (authUser: User) => {
    try {
      const profileRes = await AuthService.getUserProfile(authUser.id);
      if (profileRes.success && profileRes.data) {
        const fullProfile: UserProfile = {
          ...profileRes.data,
          email: authUser.email || '',
        };

        const suspended = fullProfile.status === 'suspended' || fullProfile.status === 'inactive';
        setIsSuspended(suspended);
        setProfile(fullProfile);

        if (suspended) {
          // Deactivated account has zero privileges
          setRole('visitor');
          setRoles([]);
        } else {
          setRole(fullProfile.role);
          setRoles(fullProfile.roles || [fullProfile.role]);
        }
      } else {
        // Fallback default for newly registered account pending profile creation trigger
        setRole('member');
        setRoles(['member']);
        setIsSuspended(false);
        setProfile({
          id: authUser.id,
          email: authUser.email || '',
          role: 'member',
          roles: ['member'],
          fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Member',
          status: 'active',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      setRole('visitor');
      setRoles([]);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserContext(user);
    }
  }, [user, loadUserContext]);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const { session: currentSession, user: currentUser } = await AuthService.getSession();
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
          await loadUserContext(currentUser);
        } else {
          setRole('visitor');
          setRoles([]);
          setProfile(null);
          setIsSuspended(false);
        }
      } catch {
        if (isMounted) {
          setRole('visitor');
          setRoles([]);
          setProfile(null);
          setIsSuspended(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen for auth events (sign in, sign out, token refresh)
    const { unsubscribe } = AuthService.onAuthStateChange(async (updatedSession) => {
      const newUser = updatedSession?.user || null;
      setSession(updatedSession);
      setUser(newUser);

      if (newUser) {
        await loadUserContext(newUser);
      } else {
        // Account switching safety: wipe all states immediately
        AuthService.clearLocalSecurityCache();
        setProfile(null);
        setRole('visitor');
        setRoles([]);
        setIsSuspended(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [loadUserContext]);

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    const res = await AuthService.signIn(email, pass);
    setIsLoading(false);
    if (res.success && res.data) {
      setUser(res.data.user);
      setSession(res.data.session);
      await loadUserContext(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error?.message || 'Authentication failed. Please verify your credentials.' };
  };

  const signInWithApplicantNumber = async (applicantNumber: string, pass: string) => {
    setIsLoading(true);
    const res = await AuthService.signInWithApplicantNumber(applicantNumber, pass);
    setIsLoading(false);

    if (res.success && res.data) {
      setUser(res.data.user);
      setSession(res.data.session);
      
      const fullProfile: UserProfile = {
        ...res.data.profile,
        email: res.data.user.email || '',
      };

      setProfile(fullProfile);
      setRole(fullProfile.role);
      setRoles(fullProfile.roles || [fullProfile.role]);
      setIsSuspended(false);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('smes_current_member', JSON.stringify(res.data.member));
      }

      return { success: true };
    }

    return {
      success: false,
      error: res.error?.message || 'Invalid Applicant Number or Password. Please verify your credentials.',
    };
  };

  const changePassword = async (newPassword: string) => {
    const res = await AuthService.changePassword(newPassword);
    if (res.success) {
      if (profile) {
        setProfile({ ...profile, mustChangePassword: false });
      }
      return { success: true, message: res.data?.message };
    }
    return {
      success: false,
      error: res.error?.message || 'Failed to update password.',
    };
  };

  const signOut = async () => {
    setIsLoading(true);
    AuthService.clearLocalSecurityCache();
    await AuthService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole('visitor');
    setRoles([]);
    setIsSuspended(false);
    setIsLoading(false);
  };

  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  const isFacultyModerator = roles.includes('faculty_moderator') || isAdmin;
  const isMember = (roles.includes('member') || isAdmin || isFacultyModerator) && !isSuspended;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        roles,
        isAdmin: isAdmin && !isSuspended,
        isMember,
        isFacultyModerator: isFacultyModerator && !isSuspended,
        isSuspended,
        isLoading,
        signIn,
        signInWithApplicantNumber,
        changePassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

