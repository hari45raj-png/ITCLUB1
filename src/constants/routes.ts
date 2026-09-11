/**
 * St. Mary's English School - IT Club Route Groups & Navigation Architecture
 */

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  tier: 'public' | 'member' | 'admin';
  description?: string;
  badge?: string;
}

export const PUBLIC_ROUTES: NavigationItem[] = [
  { id: 'home', label: 'Home', href: '/', tier: 'public' },
  { id: 'about', label: 'About & History', href: '/about', tier: 'public' },
  { id: 'team', label: 'Leadership & Members', href: '/members', tier: 'public' },
  { id: 'projects', label: 'Projects', href: '/projects', tier: 'public' },
  { id: 'events', label: 'Events', href: '/events', tier: 'public' },
  { id: 'achievements', label: 'Achievements', href: '/achievements', tier: 'public' },
  { id: 'notices', label: 'Notices', href: '/notices', tier: 'public' },
  { id: 'resources', label: 'Academic Hub', href: '/resources', tier: 'public' },
  { id: 'gallery', label: 'Gallery', href: '/gallery', tier: 'public' },
  { id: 'verify', label: 'Verify Certificate', href: '/verify', tier: 'public' },
  { id: 'contact', label: 'Contact', href: '/contact', tier: 'public' },
];

export const MEMBER_ROUTES: NavigationItem[] = [
  { id: 'member-dashboard', label: 'Member Dashboard', href: '/member/dashboard', tier: 'member' },
  { id: 'member-profile', label: 'My Portfolio', href: '/member/portfolio', tier: 'member' },
  { id: 'member-quizzes', label: 'Online Quizzes & Tests', href: '/member/quizzes', tier: 'member' },
  { id: 'member-results', label: 'Results & Certificates', href: '/member/results', tier: 'member' },
  { id: 'member-resources', label: 'Study Documents & Papers', href: '/member/resources', tier: 'member' },
  { id: 'member-notifications', label: 'Alerts & Notices', href: '/member/notifications', tier: 'member' },
];

export const ADMIN_ROUTES: NavigationItem[] = [
  { id: 'admin-dashboard', label: 'Control Center', href: '/admin', tier: 'admin' },
  { id: 'admin-members', label: 'Member Directory & Roles', href: '/admin/members', tier: 'admin' },
  { id: 'admin-notices', label: 'Publish Notices', href: '/admin/notices', tier: 'admin' },
  { id: 'admin-projects', label: 'Project Curation', href: '/admin/projects', tier: 'admin' },
  { id: 'admin-events', label: 'Event Scheduling', href: '/admin/events', tier: 'admin' },
  { id: 'admin-exams', label: 'Exam Papers & Documents', href: '/admin/documents', tier: 'admin' },
  { id: 'admin-quizzes', label: 'Quiz & Test Builder', href: '/admin/quizzes', tier: 'admin' },
  { id: 'admin-certificates', label: 'Certificate Registry', href: '/admin/certificates', tier: 'admin' },
  { id: 'admin-gallery', label: 'Media & Gallery Storage', href: '/admin/gallery', tier: 'admin' },
  { id: 'admin-logs', label: 'Audit Logs & Security', href: '/admin/logs', tier: 'admin' },
  { id: 'admin-settings', label: 'System Settings', href: '/admin/settings', tier: 'admin' },
];
