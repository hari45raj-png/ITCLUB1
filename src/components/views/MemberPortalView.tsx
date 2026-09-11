/**
 * St. Mary's English School - IT Club Platform
 * Student Member Dashboard & Personal Member Area
 * 
 * PROMPT 8: Authoritative Member Authentication, Dashboard & Personal Member Area
 * 
 * Mandates:
 * 1. Strictly Applicant Number + Password authenticated.
 * 2. Authoritative database-driven member data fetching (/api/member/dashboard).
 * 3. Strict IDOR protection: Student can only view their own private data, exam marks, and certificates.
 * 4. Strict Mass Assignment protection: Student can only edit authorized portfolio fields (bio, skills, social links).
 * 5. Password change flow with default credential warning banner.
 * 6. Tabs: Academic Overview, My Projects, My Certificates, Quizzes & Tests, Academic Results, Question Bank, Public Portfolio Preview.
 * 7. Seamless Member -> Admin verification gateway for authorized executive members.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SCHOOL_BRAND } from '../../constants/branding';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { NotificationList, NotificationItem } from '../ui/NotificationList';
import { Modal } from '../ui/Modal';
import { Tabs } from '../ui/Tabs';
import { useAuth } from '../auth/AuthProvider';
import { MemberService } from '../../services/memberService';
import { MemberDashboardData } from '../../types';
import {
  User,
  BookOpen,
  Award,
  FolderCode,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  Edit3,
  Shield,
  FileQuestion,
  HelpCircle,
  Lock,
  AlertTriangle,
  FileText,
  GraduationCap,
  Sparkles,
  Github,
  Linkedin,
  Globe,
  RefreshCw,
  Download,
  Eye,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

interface MemberPortalViewProps {
  onOpenAdminVerify?: () => void;
}

export const MemberPortalView: React.FC<MemberPortalViewProps> = ({
  onOpenAdminVerify,
}) => {
  const { user, profile, refreshProfile, changePassword, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<MemberDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);

  // Edit Profile Form State
  const [bio, setBio] = useState('');
  const [portfolioBio, setPortfolioBio] = useState('');
  const [skills, setSkills] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Change Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Filter for resources
  const [resourceClassFilter, setResourceClassFilter] = useState<string>('all');

  // Fetch Authoritative Dashboard Data
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await MemberService.getMemberDashboard();
      if (res.success && res.data) {
        setDashboardData(res.data);
        // Sync local editable state
        setBio(res.data.member.bio || '');
        setPortfolioBio(res.data.member.portfolioBio || '');
        setSkills(res.data.member.skills?.join(', ') || '');
        setGithubUrl(res.data.member.githubUrl || '');
        setLinkedinUrl(res.data.member.linkedinUrl || '');
        setWebsiteUrl(res.data.member.websiteUrl || '');
      } else {
        setError(res.error?.message || 'Failed to retrieve authoritative member records.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to member services.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Handle Mark Notification Read
  const handleMarkNotificationRead = async (id: string) => {
    if (!dashboardData) return;
    try {
      await MemberService.markNotificationRead(id);
      setDashboardData({
        ...dashboardData,
        notifications: dashboardData.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
      });
    } catch {
      // Optimistic fallback
    }
  };

  // Handle Mark All Notifications Read
  const handleMarkAllNotificationsRead = async () => {
    if (!dashboardData) return;
    try {
      await MemberService.markAllNotificationsRead();
      setDashboardData({
        ...dashboardData,
        notifications: dashboardData.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
      });
    } catch {
      // Optimistic fallback
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await MemberService.updateMemberProfile({
        bio: bio.trim(),
        portfolioBio: portfolioBio.trim(),
        skills: skillsArray,
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        websiteUrl: websiteUrl.trim(),
      });

      if (res.success) {
        setProfileSuccessMsg('Profile updated successfully.');
        if (dashboardData) {
          setDashboardData({
            ...dashboardData,
            member: {
              ...dashboardData.member,
              bio: bio.trim(),
              portfolioBio: portfolioBio.trim(),
              skills: skillsArray,
              githubUrl: githubUrl.trim(),
              linkedinUrl: linkedinUrl.trim(),
              websiteUrl: websiteUrl.trim(),
            },
          });
        }
        await refreshProfile();
        setTimeout(() => {
          setEditProfileOpen(false);
          setProfileSuccessMsg(null);
        }, 1200);
      } else {
        setProfileErrorMsg(res.error?.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.trim().length < 6) {
      setPasswordError('New password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please re-enter.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await changePassword(newPassword.trim());
      if (res.success) {
        setPasswordSuccess('Password successfully updated! Your new credentials are now active.');
        if (dashboardData) {
          setDashboardData({
            ...dashboardData,
            member: {
              ...dashboardData.member,
              mustChangePassword: false,
            },
          });
        }
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setChangePasswordOpen(false);
          setPasswordSuccess(null);
        }, 1500);
      } else {
        setPasswordError(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Password update failed.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const member = dashboardData?.member;
  const notifications: NotificationItem[] = (dashboardData?.notifications || []).map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    createdAt: new Date(n.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    isRead: n.isRead,
    priority: n.notificationType === 'urgent' ? 'urgent' : 'normal',
  }));

  const filteredResources = (dashboardData?.resources || []).filter((r) => {
    if (resourceClassFilter === 'all') return true;
    return r.classGrade === resourceClassFilter;
  });

  if (isLoading && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-pink-600 animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-neutral-800">Connecting to Academic Member Records...</h2>
        <p className="text-xs text-neutral-500">Verifying session token and student profile permissions.</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-neutral-900">Member Portal Error</h3>
        <p className="text-xs text-neutral-600">{error}</p>
        <Button variant="outline" size="sm" onClick={loadDashboard} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Connection
        </Button>
      </div>
    );
  }

  // Only explicitly authorized administrative accounts can verify the admin passcode
  const canVerifyAdmin = Boolean((isAdmin || member?.isAdminEligible) && onOpenAdminVerify);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Default Password Warning Banner */}
      {member?.mustChangePassword && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-amber-900">Initial Academic Password Active</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                You are currently signed in with your initial School Admission Number credential.
                Please set a confidential personal password to secure your academic records.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="warning"
            className="shrink-0 font-semibold"
            onClick={() => setChangePasswordOpen(true)}
            leftIcon={<Lock className="w-3.5 h-3.5" />}
          >
            Update Password
          </Button>
        </div>
      )}

      {/* 2. Member Dashboard Header Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-900 text-white ring-2 ring-neutral-200 flex items-center justify-center text-2xl sm:text-3xl font-bold shrink-0 shadow-xs">
            {member?.fullName?.charAt(0) || 'M'}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                {member?.fullName || 'Student Member'}
              </h1>
              <Badge
                variant={member?.designationLevel === 'leadership' ? 'leadership' : 'primary'}
                size="sm"
              >
                {member?.designation || 'Member'}
              </Badge>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Active Member
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600 font-medium">
              <div>
                Applicant No:{' '}
                <span className="font-mono text-neutral-900 font-bold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                  {member?.applicantNumber || '—'}
                </span>
              </div>
              <div>
                Class & Section:{' '}
                <span className="font-semibold text-neutral-800">
                  Class {member?.classGrade}-{member?.section}
                </span>
              </div>
              <div>
                Member Since:{' '}
                <span className="font-semibold text-neutral-800">
                  {member?.joiningDate || '2026-04-01'}
                </span>
              </div>
            </div>

            {member?.bio && (
              <p className="text-xs text-neutral-600 max-w-2xl line-clamp-2 pt-0.5">
                {member.bio}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditProfileOpen(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit Profile
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setChangePasswordOpen(true)}
            leftIcon={<Lock className="w-3.5 h-3.5" />}
          >
            Change Password
          </Button>

          {canVerifyAdmin && (
            <Button
              variant="dark"
              size="sm"
              onClick={onOpenAdminVerify}
              leftIcon={<Shield className="w-3.5 h-3.5 text-pink-500" />}
            >
              Verify Admin Passcode
            </Button>
          )}
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="enclosed"
        tabs={[
          { id: 'overview', label: 'Academic Overview' },
          { id: 'projects', label: 'My Projects', count: dashboardData?.projects?.length || 0 },
          { id: 'certificates', label: 'My Certificates', count: dashboardData?.certificates?.length || 0 },
          { id: 'quizzes', label: 'Quizzes & Tests', count: dashboardData?.quizzes?.length || 0 },
          { id: 'results', label: 'Academic Results', count: dashboardData?.results?.exams?.length || 0 },
          { id: 'resources', label: 'Question Bank' },
          { id: 'portfolio', label: 'Portfolio Preview' },
        ]}
      />

      {/* 4. TAB 1: ACADEMIC OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Metrics & Academic Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Club Attendance</span>
                <p className="text-2xl font-black text-neutral-900">94%</p>
                <span className="text-[11px] text-emerald-600 font-medium">Eligible for honors</span>
              </div>
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Projects Registered</span>
                <p className="text-2xl font-black text-neutral-900">{dashboardData?.projects?.length || 0}</p>
                <span className="text-[11px] text-neutral-500 font-medium">Published in portfolio</span>
              </div>
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Certificates Earned</span>
                <p className="text-2xl font-black text-purple-600">{dashboardData?.certificates?.length || 0}</p>
                <span className="text-[11px] text-purple-600 font-medium">Digitally verified</span>
              </div>
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 space-y-1 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Quizzes Completed</span>
                <p className="text-2xl font-black text-neutral-900">{dashboardData?.results?.quizzes?.length || 0}</p>
                <span className="text-[11px] text-emerald-600 font-medium">Active participation</span>
              </div>
            </div>

            {/* Upcoming Academic Deadlines & Practical Tasks */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pink-600" />
                  <h3 className="font-bold text-neutral-900 text-sm">Upcoming Club Milestones & Submissions</h3>
                </div>
                <span className="text-xs text-neutral-400">Academic Term 2026-27</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">ICSE Java OOP Practical Submissions</span>
                      <Badge variant="warning" size="xs">Due in 4 days</Badge>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Submit working source code and dry-run traces for Matrix Operations & String Tokenization.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">Upload Code</Button>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">Annual Science & Tech Exhibition Prototype</span>
                      <Badge variant="upcoming" size="xs">Nov 12, 2026</Badge>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Final working prototype demonstration in Senior Computer Lab 1.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">Guidelines</Button>
                </div>
              </div>
            </div>

            {/* Academic Standing & ICSE Computer Applications Guidance */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-2.5">
                <GraduationCap className="w-4 h-4 text-neutral-900" />
                <h3 className="font-bold text-neutral-900 text-sm">Academic Standing & Lab Hours</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-500 font-medium">Computer Lab Access:</span>
                  <p className="font-bold text-neutral-800">Senior Computer Lab 1 (Mon, Wed, Fri 3:30 PM - 5:00 PM)</p>
                </div>
                <div className="space-y-1 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <span className="text-neutral-500 font-medium">Faculty Moderator:</span>
                  <p className="font-bold text-neutral-800">Department of Computer Science, St. Mary’s English School</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Real Notifications List & Code of Conduct */}
          <div className="space-y-6">
            <NotificationList
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationRead}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
            />

            {/* Student Code of Conduct */}
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-4 space-y-2 text-xs text-neutral-600 shadow-2xs">
              <h4 className="font-bold text-neutral-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-pink-600" />
                <span>Student IT Club Code of Conduct</span>
              </h4>
              <p className="leading-relaxed">
                As a credentialed member of {SCHOOL_BRAND.schoolName} IT Club, uphold academic honesty, preserve laboratory equipment, avoid plagiarism in code submissions, and support junior peers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: MY PROJECTS */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="font-bold text-neutral-900 text-lg">My Registered Projects</h3>
              <p className="text-xs text-neutral-500">
                Projects linked to your official student profile and showcased on your public portfolio.
              </p>
            </div>
            <Button size="sm" variant="dark">
              Register New Project
            </Button>
          </div>

          {dashboardData?.projects && dashboardData.projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-400 transition-all space-y-3 flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-neutral-900 text-base">{proj.title}</h4>
                      <Badge variant="published" size="xs">
                        {proj.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200/60"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-pink-600 transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" /> Repository
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-pink-600 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-neutral-400 space-y-3">
              <FolderCode className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-700">No registered projects yet</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Demonstrate your practical programming skills by registering an application, algorithm, or hardware project.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 3: MY CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-6 shadow-2xs">
          <div className="border-b border-neutral-100 pb-4">
            <h3 className="font-bold text-neutral-900 text-lg">My Verified Certificates</h3>
            <p className="text-xs text-neutral-500">
              Official credentials issued by St. Mary's English School IT Club with cryptographic verification IDs.
            </p>
          </div>

          {dashboardData?.certificates && dashboardData.certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 hover:bg-white hover:border-neutral-400 transition-all space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="xs">
                      Official Certificate
                    </Badge>
                    <span className="text-[11px] font-mono text-neutral-500">
                      ID: {cert.certificateNumber}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-900 text-base">{cert.title}</h4>
                    <p className="text-xs text-neutral-500 mt-1">
                      Issued: {cert.issueDate} • Verified by School Administration
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCertificate(cert)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View Certificate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-neutral-400 space-y-3">
              <Award className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-700">No certificates issued yet</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Participate in upcoming workshops, hackathons, and pre-board examinations to earn verified credentials.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 7. TAB 4: QUIZZES & TESTS */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {/* Active Quizzes */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-4 shadow-2xs">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-neutral-900 text-base">Active & Upcoming IT Quizzes</h3>
              <p className="text-xs text-neutral-500">
                Online multiple-choice assessments and algorithmic logic evaluations.
              </p>
            </div>

            {dashboardData?.quizzes && dashboardData.quizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-xl border border-neutral-200/80 bg-white space-y-3 flex flex-col justify-between shadow-2xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          {quiz.topic}
                        </span>
                        <Badge variant="published" size="xs">
                          {quiz.status}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-neutral-900 text-sm">{quiz.title}</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">{quiz.description}</p>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {quiz.timeLimitMinutes} min
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FileQuestion className="w-3.5 h-3.5" /> {quiz.questionsCount} Qs
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs font-semibold">
                        Start Quiz
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-400">No active quizzes scheduled today.</div>
            )}
          </div>

          {/* Past Quiz Results */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-4 shadow-2xs">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-neutral-900 text-base">My Past Quiz Attempts</h3>
              <p className="text-xs text-neutral-500">Your historical performance on IT Club tests.</p>
            </div>

            {dashboardData?.results?.quizzes && dashboardData.results.quizzes.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {dashboardData.results.quizzes.map((qr) => (
                  <div key={qr.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">{qr.quizTitle}</h4>
                      <span className="text-xs text-neutral-400">
                        Completed on {new Date(qr.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-neutral-900">
                        {qr.score} / {qr.totalQuestions}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        {qr.percentage}% Score
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-400">No quiz attempts recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* 8. TAB 5: ACADEMIC EXAM RESULTS (STRICT IDOR PROTECTED) */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-6 shadow-2xs">
          <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-neutral-900 text-lg">Academic Exam Marks & Lab Assessments</h3>
              <p className="text-xs text-neutral-500">
                Official internal examination results recorded by Department of Computer Science.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>Strict Student Confidentiality (IDOR Protected)</span>
            </div>
          </div>

          {dashboardData?.results?.exams && dashboardData.results.exams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Subject / Paper</th>
                    <th className="py-3 px-4">Term</th>
                    <th className="py-3 px-4 text-center">Marks Obtained</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4">Faculty Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                  {dashboardData.results.exams.map((er) => {
                    const percentage = Math.round((er.marksObtained / er.maxMarks) * 100);
                    return (
                      <tr key={er.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-neutral-900">{er.subject}</td>
                        <td className="py-3.5 px-4">{er.term}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          {er.marksObtained} / {er.maxMarks}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">
                          {percentage}%
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-purple-700">
                          {er.grade}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500 italic">{er.remarks || 'Satisfactory'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-neutral-400 space-y-2">
              <FileText className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-700">No exam marks entered for this term</p>
              <p className="text-xs text-neutral-500">Marks are released following each school terminal evaluation.</p>
            </div>
          )}
        </div>
      )}

      {/* 9. TAB 6: QUESTION BANK & RESOURCES */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="font-bold text-neutral-900 text-lg">Question Bank & Academic Resources</h3>
              <p className="text-xs text-neutral-500">
                ICSE / ISC model question papers, Java programming notes, and computer syllabus guides.
              </p>
            </div>

            {/* Class filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">Filter by Class:</span>
              <select
                value={resourceClassFilter}
                onChange={(e) => setResourceClassFilter(e.target.value)}
                className="text-xs bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-neutral-900 transition-colors"
              >
                <option value="all">All Classes</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>
          </div>

          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 hover:bg-white hover:border-neutral-400 transition-all space-y-3 flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                        {res.category}
                      </span>
                      <span className="text-xs font-bold text-pink-600">{res.classGrade}</span>
                    </div>
                    <h4 className="font-bold text-neutral-900 text-sm">{res.title}</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">{res.description}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span>Uploaded: {res.uploadedAt}</span>
                    <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-neutral-400">
              No question papers found for the selected filter.
            </div>
          )}
        </div>
      )}

      {/* 10. TAB 7: PORTFOLIO PREVIEW */}
      {activeTab === 'portfolio' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-6 shadow-2xs">
          <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 text-lg">Public Directory Profile Preview</h3>
              <p className="text-xs text-neutral-500">
                This is how your credentials appear in the public member directory.
              </p>
            </div>
            <Button
              size="sm"
              variant="dark"
              onClick={() => setEditProfileOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Update Bio & Skills
            </Button>
          </div>

          <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white text-2xl font-bold flex items-center justify-center">
                {member?.fullName?.charAt(0) || 'M'}
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-neutral-900">{member?.fullName}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="leadership" size="xs">{member?.designation}</Badge>
                  <span className="text-xs text-neutral-500">Class {member?.classGrade}-{member?.section}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-200/80">
              <h5 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Bio & Academic Focus</h5>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {member?.bio || 'No public bio written yet.'}
              </p>
            </div>

            {member?.portfolioBio && (
              <div className="space-y-1 pt-2">
                <h5 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Detailed Portfolio Statement</h5>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {member.portfolioBio}
                </p>
              </div>
            )}

            <div className="space-y-1.5 pt-2">
              <h5 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Technical Skills</h5>
              <div className="flex flex-wrap gap-1.5">
                {(member?.skills || []).map((s) => (
                  <span key={s} className="text-xs bg-white text-neutral-800 border border-neutral-200 px-2.5 py-0.5 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {(member?.githubUrl || member?.linkedinUrl || member?.websiteUrl) && (
              <div className="flex items-center gap-4 pt-3 border-t border-neutral-200/80 text-xs text-neutral-600">
                {member.githubUrl && (
                  <a href={member.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-pink-600 transition-colors">
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
                {member.linkedinUrl && (
                  <a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-pink-600 transition-colors">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {member.websiteUrl && (
                  <a href={member.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-pink-600 transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT PROFILE (MASS ASSIGNMENT PROTECTED) */}
      <Modal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        title="Edit Personal Member Profile"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>Academic Integrity Notice (Mass Assignment Protected)</span>
            </div>
            <p>
              Authoritative academic details (Full Name, Applicant Number, Class, Section, and Designation) are strictly verified by school administration and cannot be modified by students.
            </p>
          </div>

          {profileSuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" /> {profileSuccessMsg}
            </div>
          )}

          {profileErrorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" /> {profileErrorMsg}
            </div>
          )}

          <Textarea
            label="Short Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            helperText="One or two sentences summarizing your computing interests."
            maxLength={500}
          />

          <Textarea
            label="Detailed Portfolio Bio"
            value={portfolioBio}
            onChange={(e) => setPortfolioBio(e.target.value)}
            rows={3}
            helperText="Detailed description of your projects, achievements, and academic goals."
            maxLength={1000}
          />

          <Input
            label="Technical Skills (Comma Separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. Java, Python, Web Development, Algorithms"
            helperText="Separate skills with commas."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="GitHub URL"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
            />
            <Input
              label="LinkedIn URL"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
            <Input
              label="Personal Website"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditProfileOpen(false)}
              disabled={isSavingProfile}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="dark"
              isLoading={isSavingProfile}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CHANGE PASSWORD */}
      <Modal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        title="Change Member Password"
        maxWidth="sm"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200 leading-relaxed">
            Choose a secure password of at least 6 characters. Once changed, your old academic credential formula (Birth Year + Class + Section) will no longer be valid.
          </div>

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" /> {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" /> {passwordError}
            </div>
          )}

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
            autoComplete="new-password"
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setChangePasswordOpen(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="dark"
              isLoading={isChangingPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: CERTIFICATE DETAIL PREVIEW */}
      {selectedCertificate && (
        <Modal
          isOpen={Boolean(selectedCertificate)}
          onClose={() => setSelectedCertificate(null)}
          title="Verified Certificate of Merit"
          maxWidth="md"
        >
          <div className="p-6 bg-neutral-50 border border-neutral-200/80 rounded-2xl text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-8 h-8 text-pink-500" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-pink-600">
                {SCHOOL_BRAND.schoolName}
              </span>
              <h3 className="text-xl font-black text-neutral-900">{selectedCertificate.title}</h3>
              <p className="text-xs text-neutral-500 font-medium">Department of Computer Applications</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-neutral-200/80 space-y-2 text-xs text-neutral-700">
              <p>This certifies that</p>
              <p className="text-base font-bold text-neutral-900">{member?.fullName}</p>
              <p>
                has successfully fulfilled all requirements and demonstrated exceptional proficiency in computer science.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-500 font-mono pt-2 border-t border-neutral-200">
              <span>ID: {selectedCertificate.certificateNumber}</span>
              <span>Issued: {selectedCertificate.issueDate}</span>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCertificate(null)}
                className="w-full"
              >
                Close Certificate
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
