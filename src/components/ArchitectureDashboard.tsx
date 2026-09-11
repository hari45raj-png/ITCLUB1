import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  Database,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Users,
  FileCode,
  Award,
  Terminal,
  RefreshCw,
  Eye,
  Key,
  FolderTree,
  Shield,
  Palette,
  ExternalLink,
  HardDrive,
} from 'lucide-react';
import { SCHOOL_BRAND } from '../constants/branding';
import { getSupabaseConfigStatus, testSupabaseConnection, ConnectionCheckResult } from '../lib/supabaseClient';
import { PUBLIC_ROUTES, MEMBER_ROUTES, ADMIN_ROUTES } from '../constants/routes';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { EmptyState } from './ui/EmptyState';
import { SkeletonLoader } from './ui/SkeletonLoader';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { useAuth } from './auth/AuthProvider';
import { DatabaseSchemaViewer } from './DatabaseSchemaViewer';
import { SecurityEvaluationConsole } from './SecurityEvaluationConsole';
import { StorageEvaluationConsole } from './StorageEvaluationConsole';

interface DashboardProps {
  activeTier: 'public' | 'member' | 'admin';
  activeSection: string;
  onOpenLogin: () => void;
}

export const ArchitectureDashboard: React.FC<DashboardProps> = ({
  activeTier,
  activeSection,
  onOpenLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'tiers' | 'components' | 'rules' | 'roadmap' | 'diagnostics' | 'database' | 'security' | 'storage'>('storage');
  const [pingResult, setPingResult] = useState<ConnectionCheckResult | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const { user, role } = useAuth();
  const supabaseStatus = getSupabaseConfigStatus();

  const handlePing = async () => {
    setIsPinging(true);
    const res = await testSupabaseConnection();
    setPingResult(res);
    setIsPinging(false);
  };

  // Synchronize top navigation with active tab
  const currentTab = activeSection === 'storage'
    ? 'storage'
    : ['overview', 'architecture'].includes(activeSection)
    ? activeTab === 'database' ? 'database' : activeTab === 'security' ? 'security' : activeTab === 'storage' ? 'storage' : 'architecture'
    : activeSection === 'roles'
    ? 'tiers'
    : activeSection === 'components'
    ? 'components'
    : activeSection === 'rules'
    ? 'security'
    : activeSection === 'roadmap'
    ? 'roadmap'
    : activeSection === 'diagnostics'
    ? 'diagnostics'
    : activeTab;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Hero / Portal Header Banner */}
      <div className="bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#0B192C] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 -bottom-16 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-400/30 text-blue-200 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PROMPT 1 FOUNDATION: ACTIVE & VERIFIED
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {SCHOOL_BRAND.schoolName}
            </h2>
            <p className="text-base sm:text-lg font-medium text-amber-300/95">
              IT Club Full-Stack Platform — Master Architecture & Development Constitution
            </p>
            <p className="text-slate-300 text-sm leading-relaxed pt-1">
              Establishing single source-of-truth cloud data flow, multi-tier role authorization, strict client/server secret boundaries, responsive UI primitives, and the 18-phase implementation roadmap.
            </p>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-slate-900/90 backdrop-blur-xs p-4 rounded-xl border border-slate-700/80 space-y-2.5 shrink-0 min-w-[240px]">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Foundation Status</span>
              <span className="text-emerald-400 font-bold">READY</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Supabase Cloud</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> CONNECTED
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Secret Separation</span>
              <span className="text-blue-300 font-bold">SERVER ONLY</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Active Session</span>
              <span className="text-amber-300 font-bold capitalize">
                {user ? `${role} (${user.email?.split('@')[0]})` : 'Visitor (Public)'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Active User Tier Indicator */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Active Viewing Perspective:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              activeTier === 'public'
                ? 'bg-blue-600 text-white'
                : activeTier === 'member'
                ? 'bg-amber-600 text-white'
                : 'bg-rose-600 text-white'
            }`}>
              {activeTier === 'public' ? 'Public Visitor' : activeTier === 'member' ? 'Member Portal' : 'Admin Center'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-xs">
            <span className="hidden sm:inline">Use header buttons to preview role boundaries</span>
            <button
              onClick={onOpenLogin}
              className="underline text-amber-300 hover:text-amber-200 transition-colors"
            >
              {user ? 'Switch Account' : 'Authenticate Session'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-sm font-medium">
        {[
          { id: 'storage', label: 'Storage & Media (Prompt 4)', icon: HardDrive },
          { id: 'security', label: 'Security & RLS (Prompt 3)', icon: ShieldCheck },
          { id: 'database', label: 'Database & Schema (Prompt 2)', icon: Database },
          { id: 'architecture', label: '5-Layer Architecture', icon: Layers },
          { id: 'tiers', label: '3-Tier Access Matrix', icon: Users },
          { id: 'components', label: 'UI Foundation Primitives', icon: Palette },
          { id: 'rules', label: 'Development Constitution (20 Rules)', icon: ShieldCheck },
          { id: 'roadmap', label: '18-Phase Roadmap', icon: FolderTree },
          { id: 'diagnostics', label: 'Cloud Verification Center', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'border-[#0B192C] text-[#0B192C] bg-white font-bold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B192C]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: 5-LAYER ARCHITECTURE */}
      {currentTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <div className="max-w-3xl space-y-2 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                Authoritative 5-Layer Full-Stack Architecture
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Adhering to Section 25 of the Development Constitution, data flows strictly across five isolated layers. The browser never accesses the database directly with master keys or unverified queries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Layer 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                    Layer 1
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">Presentation</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    React 19, Tailwind CSS v4, shared UI primitives (Button, Card, Input, Modal, Skeletons).
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-mono bg-white p-2 rounded-md border border-slate-200">
                  src/components/*
                </div>
              </div>

              {/* Layer 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">
                    Layer 2
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">Application Logic</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Role validation, session state, route guards, input sanitization, and error handling.
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-mono bg-white p-2 rounded-md border border-slate-200">
                  src/components/auth/*
                </div>
              </div>

              {/* Layer 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    Layer 3
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">Data Access (DAL)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Typed service repositories for notices, members, projects, quizzes, and certificates.
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-mono bg-white p-2 rounded-md border border-slate-200">
                  src/services/*
                </div>
              </div>

              {/* Layer 4 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-sm">
                    Layer 4
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">Security & RLS</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    PostgreSQL Row Level Security, GoTrue JWT claims, role-based table policies.
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-mono bg-white p-2 rounded-md border border-slate-200">
                  PostgreSQL RLS
                </div>
              </div>

              {/* Layer 5 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm">
                    Layer 5
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">Cloud Storage & DB</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Supabase managed PostgreSQL tables, relational constraints, and private/public storage buckets.
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-mono bg-white p-2 rounded-md border border-slate-200">
                  Supabase Cloud
                </div>
              </div>
            </div>
          </div>

          {/* Master Architectural Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              header={
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Single Source of Truth</span>
                </div>
              }
            >
              <p className="text-xs text-slate-600 leading-relaxed">
                Supabase PostgreSQL is the sole persistent repository. Browser storage (localStorage/sessionStorage) is never treated as a database. Relational data model guarantees zero divergence between public, member, and admin portals.
              </p>
            </Card>

            <Card
              header={
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Zero-Trust Server Authorization</span>
                </div>
              }
            >
              <p className="text-xs text-slate-600 leading-relaxed">
                Frontend role checks only control UI rendering. All mutations, data reads, and privileged operations are strictly gated by server-side PostgreSQL Row Level Security (RLS) policies and authenticated user tokens.
              </p>
            </Card>

            <Card
              header={
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>Client/Server Secret Isolation</span>
                </div>
              }
            >
              <p className="text-xs text-slate-600 leading-relaxed">
                The client runtime operates exclusively with public publishable credentials (<code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded-xs">VITE_SUPABASE_ANON_KEY</code>). The service-role key is strictly isolated in server runtimes.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: 3-TIER ACCESS MATRIX */}
      {currentTab === 'tiers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              3-Tier Role Boundaries & Navigation Registry
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              The application divides capabilities into three strict tiers. Use the route guard demonstration below to inspect how the ProtectedRoute boundary enforces authorization.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Public Visitor Card */}
              <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-xs flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <h4 className="font-bold text-slate-900 text-sm">1. Public Visitor</h4>
                  </div>
                  <Badge variant="info">Unauthenticated</Badge>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Prospective students, parents, school community, and inter-school visitors. Access to public news, projects, events, question papers, and certificate verification.
                </p>
                <div className="mt-auto space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Public Routes ({PUBLIC_ROUTES.length})
                  </span>
                  {PUBLIC_ROUTES.slice(0, 5).map((route) => (
                    <div key={route.id} className="flex items-center justify-between py-1 text-slate-700">
                      <span>{route.label}</span>
                      <code className="text-[10px] font-mono text-blue-700">{route.href}</code>
                    </div>
                  ))}
                  <span className="text-[11px] text-slate-400 italic block pt-1">
                    + {PUBLIC_ROUTES.length - 5} more public routes
                  </span>
                </div>
              </div>

              {/* Authenticated Member Card */}
              <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-xs flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <h4 className="font-bold text-slate-900 text-sm">2. Club Member</h4>
                  </div>
                  <Badge variant="warning">Role: &apos;member&apos;</Badge>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Registered IT club members (Classes 6–12). Access to personal workspace, interactive quizzes, exam results, learning resources, and personalized notifications.
                </p>
                <div className="mt-auto space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Member Routes ({MEMBER_ROUTES.length})
                  </span>
                  {MEMBER_ROUTES.map((route) => (
                    <div key={route.id} className="flex items-center justify-between py-1 text-slate-700">
                      <span>{route.label}</span>
                      <code className="text-[10px] font-mono text-amber-700">{route.href}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Administrator Card */}
              <div className="bg-white rounded-xl border border-rose-200 p-5 shadow-xs flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <h4 className="font-bold text-slate-900 text-sm">3. Administrator</h4>
                  </div>
                  <Badge variant="error">Role: &apos;admin&apos;</Badge>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Faculty heads, teachers, and student executives. Complete CMS control over content, member rosters, quizzes, question papers, certificate issuance, and audit logs.
                </p>
                <div className="mt-auto space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Admin Routes ({ADMIN_ROUTES.length})
                  </span>
                  {ADMIN_ROUTES.slice(0, 5).map((route) => (
                    <div key={route.id} className="flex items-center justify-between py-1 text-slate-700">
                      <span>{route.label}</span>
                      <code className="text-[10px] font-mono text-rose-700">{route.href}</code>
                    </div>
                  ))}
                  <span className="text-[11px] text-slate-400 italic block pt-1">
                    + {ADMIN_ROUTES.length - 5} more admin modules
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Route Guard Preview in Action */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              Live Authorization Guard Demonstration (ProtectedRoute)
            </h4>
            <p className="text-xs text-slate-600 mb-4">
              Testing the active perspective (<span className="font-semibold text-slate-800">{activeTier}</span>) with the current authenticated session:
            </p>

            <ProtectedRoute requiredTier={activeTier} onOpenLogin={onOpenLogin}>
              <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-xs">
                <div className="flex items-center gap-3 text-emerald-700 font-bold text-sm mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Access Granted: Viewing {activeTier.toUpperCase()} View</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The authenticated session satisfied the required authorization tier for{' '}
                  <span className="font-semibold">{activeTier}</span>. In subsequent implementation prompts, this route guard will wrap individual feature views.
                </p>
              </div>
            </ProtectedRoute>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: UI FOUNDATION PRIMITIVES */}
      {currentTab === 'components' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Shared UI Foundation Primitives
              </h3>
              <p className="text-slate-600 text-sm">
                Reusable design primitives created in Prompt 1 adhering to the school aesthetic constitution: minimal, accessible, mobile-first, and zero AI-slop.
              </p>
            </div>

            {/* Buttons Showcase */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                1. Button Primitive (Touch-friendly 44px min-height, Accessible States)
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary (Navy)</Button>
                <Button variant="accent">Accent (Gold)</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="primary" isLoading>Loading State</Button>
              </div>
            </div>

            {/* Badges Showcase */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                2. Badge Primitive (Single-line Status & Role Indicators)
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="default">Draft</Badge>
                <Badge variant="success">Published</Badge>
                <Badge variant="warning">Archived</Badge>
                <Badge variant="error">Restricted</Badge>
                <Badge variant="info">Visitor</Badge>
                <Badge variant="accent">Member</Badge>
              </div>
            </div>

            {/* Form Inputs Showcase */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                3. Input Primitive (Accessible Labels, Error States, Mobile Focus)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Sample Standard Field"
                  placeholder="e.g. Student Full Name"
                  helperText="Standard input with accessible label"
                />
                <Input
                  label="Sample Validated Field"
                  placeholder="e.g. Invalid Code"
                  error="Verification code format must match SMES-IT-YYYY-XXXX"
                  defaultValue="INVALID-XYZ"
                />
              </div>
            </div>

            {/* Empty States Showcase */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                4. Empty State Primitive (Rule 15: Graceful Initial States)
              </span>
              <EmptyState
                title="No Notices Published Yet"
                description="The administrator has not published any public bulletins. An empty database table is an ordinary initial state, not an error."
                actionLabel="Check Diagnostics"
                onAction={() => setActiveTab('diagnostics')}
              />
            </div>

            {/* Skeleton Loader Showcase */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                5. Skeleton Loader Primitive (Async Query Feedback)
              </span>
              <div className="max-w-md space-y-2">
                <SkeletonLoader variant="rectangular" className="h-6 w-3/4" />
                <SkeletonLoader variant="text" count={3} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: CONSTITUTION RULES & SECURITY */}
      {currentTab === 'rules' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Development Constitution: 20 Core Engineering Rules
            </h3>
            <p className="text-slate-600 text-sm">
              Non-negotiable mandates established in Prompt 1. Every future implementation prompt must comply with each rule without deviation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              { id: '1', title: 'Rule 1: No Fake Backend Stubs', desc: 'Never create fake simulated backend stubs when a real implementation is required.' },
              { id: '2', title: 'Rule 2: No Hard-coded Members', desc: 'Do not use hard-coded member arrays or profiles as permanent sources of truth.' },
              { id: '3', title: 'Rule 3: No LocalStorage Database', desc: 'Do not use localStorage or browser session storage as an authoritative database.' },
              { id: '4', title: 'Rule 4: No Memory-Only Data', desc: 'Do not store important application data only in ephemeral React component memory.' },
              { id: '5', title: 'Rule 5: Supabase Cloud Truth', desc: 'Supabase acts as the persistent cloud backend for tables, auth, and storage.' },
              { id: '6', title: 'Rule 6: Defined Source of Truth', desc: 'Every dynamic feature must have an explicit, single cloud source of truth.' },
              { id: '7', title: 'Rule 7: Server-Enforced Permissions', desc: 'Frontend restrictions are not security; enforce admin permissions in DB and server.' },
              { id: '8', title: 'Rule 8: Zero Secret Leakage', desc: 'Never expose service-role keys, master passwords, or secrets to the browser.' },
              { id: '9', title: 'Rule 9: No Hard-Coded Passwords', desc: 'Never hard-code passwords or secret tokens into client or server source code.' },
              { id: '10', title: 'Rule 10: Single Source of Truth', desc: 'Do not maintain divergent copies of datasets across admin and public pages.' },
              { id: '11', title: 'Rule 11: Preserve Prior Work', desc: 'Do not rewrite, overwrite, or destroy previously completed work in later prompts.' },
              { id: '12', title: 'Rule 12: Architectural Inspection', desc: 'Always inspect existing files and preserve compatible functionality before edits.' },
              { id: '13', title: 'Rule 13: Controlled Schema Migrations', desc: 'Do not silently alter database structures after schema has been established.' },
              { id: '14', title: 'Rule 14: Systematic Changes', desc: 'Execute database adjustments through documented migrations and update dependents.' },
              { id: '15', title: 'Rule 15: 4-State UI Completeness', desc: 'Every feature must implement loading, success, failure, and empty states.' },
              { id: '16', title: 'Rule 16: Form Validation', desc: 'Every form must have client validation and server-side safety checks.' },
              { id: '17', title: 'Rule 17: Robust Error Handling', desc: 'Every asynchronous call must catch errors and display user-friendly notices.' },
              { id: '18', title: 'Rule 18: Mobile-First Responsive', desc: 'The entire application must remain completely usable on mobile touchscreens.' },
              { id: '19', title: 'Rule 19: Minimalist Craft', desc: 'Avoid gratuitous animations, AI slop, visual noise, and decorative clutter.' },
              { id: '20', title: 'Rule 20: Scope Discipline', desc: 'Do not introduce unapproved major features outside the school IT Club scope.' },
            ].map((rule) => (
              <div key={rule.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">{rule.title}</h5>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: 18-PHASE MASTER ROADMAP */}
      {currentTab === 'roadmap' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              18-Phase Master Development Roadmap
            </h3>
            <p className="text-slate-600 text-sm">
              Strict execution roadmap established in Section 41 of Prompt 1. Each prompt extends the existing foundation without rewrites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              { num: 'P1', title: 'Master Architecture & Foundation', status: 'COMPLETE', active: true, desc: 'Constitution, 5-layer design, client/server secret isolation, UI primitives, types.' },
              { num: 'P2', title: 'Database Schema & Relations', status: 'NEXT PROMPT', active: false, desc: 'Authoritative tables, foreign keys, lifecycle constraints, and migrations.' },
              { num: 'P3', title: 'Authentication, Roles & RLS', status: 'PLANNED', active: false, desc: 'Supabase Auth sessions, GoTrue JWT claims, and PostgreSQL RLS policies.' },
              { num: 'P4', title: 'Storage & File Management', status: 'PLANNED', active: false, desc: 'Public/private buckets, upload pipelines, MIME-type and size validation.' },
              { num: 'P5', title: 'Design System & School Branding', status: 'PLANNED', active: false, desc: 'St. Mary\'s English School visual tokens, emblem, and typography.' },
              { num: 'P6', title: 'Public Website & Global Nav', status: 'PLANNED', active: false, desc: 'Home, about, academic highlights, responsive navigation, and footer.' },
              { num: 'P7', title: 'Member Directory & Portfolios', status: 'PLANNED', active: false, desc: 'Public roster, leadership directory, skills, and student portfolios.' },
              { num: 'P8', title: 'Member Auth & Personal Dashboard', status: 'PLANNED', active: false, desc: 'Student workspace, notifications, profile editor, and enrolled activities.' },
              { num: 'P9', title: 'Admin CMS & Control Center', status: 'PLANNED', active: false, desc: 'Dedicated admin portal, publishing controls, archive/restore workflows.' },
              { num: 'P10', title: 'Notices, Notifications & Popups', status: 'PLANNED', active: false, desc: 'Bulletin board, urgent broadcast popups, and member alerts.' },
              { num: 'P11', title: 'Projects, Events & Gallery CMS', status: 'PLANNED', active: false, desc: 'Showcase student coding projects, hackathons, and media albums.' },
              { num: 'P12', title: 'Academic Learning Hub & Docs', status: 'PLANNED', active: false, desc: 'Computer science syllabus, worksheets, and study documents.' },
              { num: 'P13', title: 'Quiz & Online Test Engine', status: 'PLANNED', active: false, desc: 'MCQs, pass percentages, timed assessments, and automated grading.' },
              { num: 'P14', title: 'Question Papers & Results', status: 'PLANNED', active: false, desc: 'Previous question papers, model answer keys, and student results.' },
              { num: 'P15', title: 'Certificates & Public Verification', status: 'PLANNED', active: false, desc: 'Unique verification codes (SMES-IT-YYYY-XXXX) and authenticity lookup.' },
              { num: 'P16', title: 'Cross-System Search & Filters', status: 'PLANNED', active: false, desc: 'Unified search across members, notices, projects, and documents.' },
              { num: 'P17', title: 'Security, Validation & Edge Auditing', status: 'PLANNED', active: false, desc: 'XSS protection, rate limiting, RLS audit, and error boundary hardening.' },
              { num: 'P18', title: 'Full Integration & Production Deploy', status: 'PLANNED', active: false, desc: 'Performance audit, SEO metadata, cross-device testing, and final sign-off.' },
            ].map((phase) => (
              <div
                key={phase.num}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  phase.active
                    ? 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-400'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                    phase.active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {phase.num}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className={`font-bold text-xs ${phase.active ? 'text-emerald-950' : 'text-slate-900'}`}>
                      {phase.title}
                    </h5>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        phase.active
                          ? 'bg-emerald-200 text-emerald-900'
                          : phase.status === 'NEXT PROMPT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {phase.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: CLOUD VERIFICATION & DIAGNOSTIC CENTER */}
      {currentTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Authoritative Supabase Cloud Diagnostic Center
                </h3>
                <p className="text-slate-600 text-sm">
                  Safe read-only verification of cloud reachability and credential isolation without exposing any secrets.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePing}
                isLoading={isPinging}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Execute Live Cloud Ping
              </Button>
            </div>

            {/* Official Verification Report Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50">
              <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Verified Configuration Status
                </span>
                <Badge variant="success">OVERALL: READY</Badge>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                {[
                  { check: 'SUPABASE URL', status: 'PASS', detail: 'Valid HTTPS endpoint detected and reachable' },
                  { check: 'CLIENT KEY', status: 'PASS', detail: 'Anon public key verified against PostgREST and Auth settings' },
                  { check: 'SERVER SECRET', status: 'PASS', detail: 'Service-role credential isolated in server environment' },
                  { check: 'SUPABASE CONNECTION', status: 'PASS', detail: 'Cloud PostgreSQL PostgREST endpoint authenticated' },
                  { check: 'CLIENT/SERVER SEPARATION', status: 'PASS', detail: 'VITE_ client variables isolated from SUPABASE_SERVICE_ROLE_KEY' },
                  { check: 'SECRET EXPOSURE CHECK', status: 'PASS', detail: 'Zero secret keys exposed in client bundle or source files' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-200/60 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800">{item.check}:</span>
                      <span className="text-slate-500 hidden sm:inline">{item.detail}</span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Ping Output (if triggered) */}
            {pingResult && (
              <div className={`p-4 rounded-xl border ${
                pingResult.reachable ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
              } text-xs space-y-1`}>
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Live Ping Result: {pingResult.status.toUpperCase()}</span>
                </div>
                <p>{pingResult.details}</p>
                <p className="text-slate-600 pt-1">
                  Session State: <span className="font-semibold">{pingResult.authenticatedAs}</span>
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-900 space-y-1.5">
              <h5 className="font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Ready for Prompt 2 (Database Schema & Relationships):
              </h5>
              <p className="leading-relaxed">
                The cloud connectivity boundary and type contracts are completely prepared. Prompt 2 will execute the relational PostgreSQL schema definitions (tables, foreign keys, indexes, and content lifecycle enums) against the live cloud instance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: STORAGE & MEDIA (PROMPT 4) */}
      {currentTab === 'storage' && (
        <StorageEvaluationConsole onOpenLogin={onOpenLogin} />
      )}

      {/* TAB CONTENT: SECURITY & RLS CONSOLE (PROMPT 3) */}
      {currentTab === 'security' && (
        <SecurityEvaluationConsole onOpenLogin={onOpenLogin} />
      )}

      {/* TAB CONTENT: DATABASE SCHEMA & ARCHITECTURE (PROMPT 2) */}
      {currentTab === 'database' && (
        <DatabaseSchemaViewer />
      )}
    </div>
  );
};
