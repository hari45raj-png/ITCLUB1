/**
 * St. Mary's English School - IT Club Platform
 * Admin Dashboard Overview Module
 */

import React from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  BookOpen, 
  Award, 
  MessageSquare, 
  Trash2, 
  ShieldCheck, 
  TrendingUp,
  FolderArchive,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  archivedMembers: number;
  upcomingEvents: number;
  publishedNotices: number;
  publishedPosts: number;
  totalProjects: number;
  totalAchievements: number;
  totalResources: number;
  totalQuestionPapers: number;
  totalQuizzes: number;
  totalCertificates: number;
  unreadContactMessages: number;
  totalFiles: number;
  candidateMockItems: number;
}

interface AdminDashboardOverviewProps {
  stats: AdminStats | null;
  isLoading: boolean;
  onNavigateModule: (module: string) => void;
  onRefresh: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  stats,
  isLoading,
  onNavigateModule,
  onRefresh,
}) => {
  const cards = [
    {
      id: 'members',
      title: 'Club Members',
      count: stats?.totalMembers ?? 0,
      subtext: `${stats?.activeMembers ?? 0} active, ${stats?.archivedMembers ?? 0} archived`,
      icon: Users,
      color: 'text-neutral-900 bg-neutral-100 border-neutral-200',
    },
    {
      id: 'notices',
      title: 'Notices & Circulars',
      count: stats?.publishedNotices ?? 0,
      subtext: `${stats?.publishedPosts ?? 0} knowledge posts`,
      icon: FileText,
      color: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      id: 'events',
      title: 'Upcoming Events',
      count: stats?.upcomingEvents ?? 0,
      subtext: 'Scheduled workshops & meets',
      icon: Calendar,
      color: 'text-pink-700 bg-pink-50 border-pink-200',
    },
    {
      id: 'resources',
      title: 'Question Papers & Bank',
      count: stats?.totalQuestionPapers ?? 0,
      subtext: `${stats?.totalResources ?? 0} learning materials`,
      icon: BookOpen,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
    },
    {
      id: 'certificates',
      title: 'Certificates Issued',
      count: stats?.totalCertificates ?? 0,
      subtext: `${stats?.totalAchievements ?? 0} student accolades`,
      icon: Award,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      id: 'messages',
      title: 'Contact Messages',
      count: stats?.unreadContactMessages ?? 0,
      subtext: 'Unread visitor inquiries',
      icon: MessageSquare,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-bold text-neutral-900">IT Club Executive System Active</h2>
          </div>
          <p className="text-xs text-neutral-500">
            Authoritative administration console with cryptographically signed operational logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            isLoading={isLoading}
          >
            Refresh Metrics
          </Button>
          <Button
            size="sm"
            variant="dark"
            onClick={() => onNavigateModule('members')}
          >
            Manage Roster
          </Button>
        </div>
      </div>

      {/* Mock Data Notification Banner (if demo items exist) */}
      {(stats?.candidateMockItems ?? 0) > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold">Demonstration / Placeholder Records Detected: </span>
              <span>{stats?.candidateMockItems} candidate sample items are present in current database collections.</span>
            </div>
          </div>
          <Button
            size="xs"
            variant="outline"
            className="border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0 font-semibold"
            onClick={() => onNavigateModule('cleanup')}
          >
            Open Mock Data Cleanup
          </Button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigateModule(card.id)}
              className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-neutral-500">{card.title}</span>
                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {isLoading ? '...' : card.count}
                  </div>
                  <p className="text-[11px] text-neutral-400">{card.subtext}</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${card.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fast Operational Shortcuts */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Operational Direct Shortcuts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigateModule('members')}
            className="p-3.5 rounded-xl border border-neutral-200/80 hover:border-neutral-900 hover:bg-neutral-50 text-left transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-neutral-900">
              <Users className="w-4 h-4 text-pink-600" />
              <span>Provision Member</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Issue sequential Applicant # with formula password.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateModule('notices')}
            className="p-3.5 rounded-xl border border-neutral-200/80 hover:border-neutral-900 hover:bg-neutral-50 text-left transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-neutral-900">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Publish Circular</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Post official notice with optional member broadcast.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateModule('cleanup')}
            className="p-3.5 rounded-xl border border-neutral-200/80 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-rose-700">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Mock Data Cleanup</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Review and clean candidate sample records.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateModule('audit')}
            className="p-3.5 rounded-xl border border-neutral-200/80 hover:border-neutral-900 hover:bg-neutral-50 text-left transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-neutral-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Audit Log Trails</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Inspect authoritative security audit history.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
