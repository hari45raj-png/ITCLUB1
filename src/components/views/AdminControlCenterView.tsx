/**
 * St. Mary's English School - IT Club Platform
 * Complete Administrative Control Center
 * 
 * PROMPT 9: Complete Admin Authentication, Authorization & Control Center
 * 
 * Access Flow:
 * VISITOR -> MEMBER LOGIN -> AUTHENTICATED MEMBER -> ADMIN AUTHORIZATION CHECK -> ADMIN PASSWORD VERIFICATION -> ADMIN CONTROL CENTER
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SCHOOL_BRAND } from '../../constants/branding';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { AdminVerificationModal } from '../auth/AdminVerificationModal';
import { AuthService } from '../../services/authService';

// Module Components
import { AdminDashboardOverview, AdminStats } from '../admin/AdminDashboardOverview';
import { AdminMembersModule } from '../admin/AdminMembersModule';
import { AdminDesignationsModule } from '../admin/AdminDesignationsModule';
import { AdminNoticesModule } from '../admin/AdminNoticesModule';
import { AdminEventsModule } from '../admin/AdminEventsModule';
import { AdminResourcesModule } from '../admin/AdminResourcesModule';
import { AdminCertificatesModule } from '../admin/AdminCertificatesModule';
import { AdminMockDataCleanupModule } from '../admin/AdminMockDataCleanupModule';
import { AdminAuditLogsModule } from '../admin/AdminAuditLogsModule';
import { AdminSettingsModule } from '../admin/AdminSettingsModule';

import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Calendar,
  BookOpen,
  Award,
  Trash2,
  ShieldCheck,
  Settings,
  Lock,
  LogOut,
  ChevronRight,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

export const AdminControlCenterView: React.FC = () => {
  const { user, profile, isAuthenticated, isAdmin } = useAuth();

  const [activeModule, setActiveModule] = useState<string>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Clearance state (IT402 verification)
  const [isVerifiedClearance, setIsVerifiedClearance] = useState<boolean>(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);

  // Check existing session clearance token
  useEffect(() => {
    const clearanceToken = sessionStorage.getItem('smes_admin_clearance_token');
    if (clearanceToken) {
      setIsVerifiedClearance(true);
    } else if (isAuthenticated && isAdmin) {
      setIsVerificationModalOpen(true);
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/dashboard/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.data);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isVerifiedClearance) {
      fetchStats();
    }
  }, [isVerifiedClearance, fetchStats]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleClearanceSuccess = () => {
    setIsVerifiedClearance(true);
    setIsVerificationModalOpen(false);
    showToast('Executive Admin clearance verified. Control Center unlocked.');
    fetchStats();
  };

  const handleLockAdmin = () => {
    sessionStorage.removeItem('smes_admin_clearance_token');
    setIsVerifiedClearance(false);
    setIsVerificationModalOpen(true);
  };

  const navModules = [
    { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Member Roster & Provision', icon: Users, count: stats?.totalMembers },
    { id: 'designations', label: 'Designations & Hierarchy', icon: Shield },
    { id: 'notices', label: 'Notices & Circulars', icon: FileText, count: stats?.publishedNotices },
    { id: 'events', label: 'Events & Workshops', icon: Calendar, count: stats?.upcomingEvents },
    { id: 'resources', label: 'Question Bank & Papers', icon: BookOpen, count: stats?.totalQuestionPapers },
    { id: 'certificates', label: 'Certificates Registry', icon: Award, count: stats?.totalCertificates },
    { id: 'cleanup', label: 'Mock Data Cleanup', icon: Trash2, count: stats?.candidateMockItems, alert: (stats?.candidateMockItems ?? 0) > 0 },
    { id: 'audit', label: 'Security Audit Logs', icon: ShieldCheck },
    { id: 'settings', label: 'School Institutional Config', icon: Settings },
  ];

  // 1. Unauthenticated or not member
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200/80 p-8 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-100">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-900">Administrative Access Restricted</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            The Admin Control Center is restricted to authorized St. Mary's English School IT Club leadership. Please login as a member with administrative clearance to continue.
          </p>
          <div className="pt-2">
            <Button
              variant="dark"
              className="w-full"
              onClick={() => {
                window.location.hash = '#member-portal';
              }}
            >
              Go to Member Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated but lacks admin authorization
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200/80 p-8 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-100">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-900">Unauthorized Role</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Your current account (<strong>{profile?.fullName || user?.email}</strong>, Designation: {profile?.designation || 'Member'}) is not authorized for executive administrative clearance.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.hash = '#member-portal';
              }}
            >
              Return to Member Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Admin authorized but not yet verified with password IT402 in this session
  if (!isVerifiedClearance) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200/80 p-8 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto border border-neutral-200">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-neutral-900">Security Verification Required</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Welcome, <strong>{profile?.fullName || 'Administrator'}</strong>. To access the control center and manage institutional databases, please enter the executive security password.
          </p>
          <div className="pt-2">
            <Button
              variant="dark"
              className="w-full"
              onClick={() => setIsVerificationModalOpen(true)}
              leftIcon={<Lock className="w-4 h-4 text-pink-400" />}
            >
              Enter Executive Password
            </Button>
          </div>

          <AdminVerificationModal
            isOpen={isVerificationModalOpen}
            onClose={() => setIsVerificationModalOpen(false)}
            onSuccess={handleClearanceSuccess}
          />
        </div>
      </div>
    );
  }

  // 4. Fully Authorized & Verified Admin Control Center
  return (
    <div className="min-h-[calc(100vh-140px)] bg-neutral-50">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 animate-fade-in max-w-md">
          <Alert variant="success" onClose={() => setToastMessage(null)}>
            {toastMessage}
          </Alert>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Admin Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div className="space-y-1">
            <Breadcrumbs
              items={[
                { label: 'Admin Center' },
                {
                  label: navModules.find((m) => m.id === activeModule)?.label || 'Module',
                  active: true,
                },
              ]}
            />
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                Administrative Control Center
              </h1>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Clearance Verified
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Institutional executive portal for {SCHOOL_BRAND.schoolName} IT Club. Signed in as {profile?.fullName || 'Council Admin'} ({profile?.designation || 'Administrator'}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleLockAdmin}
              leftIcon={<Lock className="w-3.5 h-3.5" />}
              className="text-neutral-600 hover:text-neutral-900"
            >
              Lock Console
            </Button>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Modules Navigation & Active Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Admin Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-2 shadow-2xs space-y-1">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Management Consoles
              </div>

              {navModules.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setActiveModule(mod.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-pink-400' : mod.alert ? 'text-amber-500' : 'text-neutral-400'}`} />
                      <span className="truncate">{mod.label}</span>
                    </div>

                    {mod.count !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : mod.alert
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {mod.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Session Guard Box */}
            <div className="p-3.5 bg-neutral-100/70 rounded-2xl border border-neutral-200/80 text-xs space-y-1 text-neutral-600">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Executive Guard Active</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug">
                All changes are committed with cryptographic actor stamping to the school audit ledger.
              </p>
            </div>
          </div>

          {/* Active Module Panel */}
          <div className="lg:col-span-3">
            {activeModule === 'overview' && (
              <AdminDashboardOverview
                stats={stats}
                isLoading={isStatsLoading}
                onNavigateModule={(mod) => setActiveModule(mod)}
                onRefresh={fetchStats}
              />
            )}

            {activeModule === 'members' && (
              <AdminMembersModule
                onNotify={showToast}
              />
            )}

            {activeModule === 'designations' && (
              <AdminDesignationsModule
                onNotify={showToast}
              />
            )}

            {activeModule === 'notices' && (
              <AdminNoticesModule
                onNotify={showToast}
              />
            )}

            {activeModule === 'events' && (
              <AdminEventsModule
                onNotify={showToast}
              />
            )}

            {activeModule === 'resources' && (
              <AdminResourcesModule
                onNotify={showToast}
              />
            )}

            {activeModule === 'certificates' && (
              <AdminCertificatesModule
                onNotify={showToast}
              />
            )}

            {activeModule === 'cleanup' && (
              <AdminMockDataCleanupModule
                onNotify={showToast}
                onRefreshParentStats={fetchStats}
              />
            )}

            {activeModule === 'audit' && (
              <AdminAuditLogsModule
                onNotify={showToast}
              />
            )}

            {activeModule === 'settings' && (
              <AdminSettingsModule
                onNotify={showToast}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
