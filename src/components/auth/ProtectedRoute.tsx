/**
 * St. Mary's English School - IT Club Platform
 * Route Boundary & Role Authorization Guard
 * 
 * Rules:
 * 1. Checks both authentication status and explicit role tier authorization.
 * 2. Checks account status (active vs suspended/inactive).
 * 3. Never trusts localStorage roles or hidden buttons alone.
 * 4. Clearly distinguishes between "not logged in", "account suspended", and "unauthorized role".
 */

import React from 'react';
import { useAuth } from './AuthProvider';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { ShieldAlert, LogIn, Lock, UserX } from 'lucide-react';
import { AuthService } from '../../services/authService';

export interface ProtectedRouteProps {
  requiredTier: 'public' | 'member' | 'admin';
  children: React.ReactNode;
  onOpenLogin?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredTier,
  children,
  onOpenLogin,
}) => {
  const { user, role, isSuspended, isLoading, signOut } = useAuth();

  if (requiredTier === 'public') {
    return <>{children}</>;
  }

  // Loading state while resolving Supabase session
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-4">
        <SkeletonLoader variant="rectangular" className="h-10 w-48" />
        <SkeletonLoader variant="rectangular" className="h-64 w-full" />
      </div>
    );
  }

  // 1. Not Authenticated
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-4">
        <Card className="text-center p-8">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 ring-4 ring-amber-50/50">
            <LogIn className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Authentication Required</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Please log in with your St. Mary&apos;s English School credentials to access the{' '}
            <span className="font-semibold text-slate-800">{requiredTier} portal</span>.
          </p>
          {onOpenLogin && (
            <div className="mt-6">
              <Button onClick={onOpenLogin} className="w-full">
                Sign In to Continue
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // 2. Account Inactive or Suspended
  if (isSuspended) {
    return (
      <div className="max-w-md mx-auto my-12 p-4">
        <Card className="text-center p-8 border-rose-200 bg-rose-50/30">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4 ring-4 ring-rose-50">
            <UserX className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Account Inactive or Suspended</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Your student account is currently flagged as inactive or suspended by school administration.
            You cannot perform member or administrative actions at this time.
          </p>
          <div className="mt-6">
            <Button variant="secondary" onClick={() => signOut()} className="w-full">
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 3. Authenticated but unauthorized role (e.g. member attempting admin portal)
  const hasAccess = AuthService.isAuthorized(role, requiredTier);

  if (!hasAccess) {
    return (
      <div className="max-w-md mx-auto my-12 p-4">
        <Card className="text-center p-8 border-rose-200">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 ring-4 ring-rose-50/50">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Access Restricted</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Your current account role (<span className="font-semibold text-rose-700">{role}</span>) does
            not hold permissions for the {requiredTier} tier.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Server-side authorization enforced via Supabase PostgreSQL RLS.</span>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

