/**
 * St. Mary's English School - IT Club Platform
 * Public Member Directory & Portfolio Domain Contracts
 * 
 * PROMPT 7: Public / Private Data Separation & Member Profiles
 * 
 * Rules:
 * 1. Strongly typed contracts for public member cards, individual profiles, and portfolios.
 * 2. PublicMemberSummary and PublicMemberProfile strictly exclude sensitive fields:
 *    - No passwords, no auth tokens, no private notifications, no private exam results.
 * 3. Supports database-driven designations with leadership hierarchy.
 */

export interface Designation {
  id: string;
  title: string;
  slug: string;
  level: 'leadership' | 'member' | 'alumnus' | 'honorary';
  hierarchyOrder: number;
  description?: string | null;
  isActive: boolean;
}

export interface PublicMemberSummary {
  id: string;
  slug: string;
  fullName: string;
  avatarUrl?: string | null;
  designation: string;
  designationLevel: 'leadership' | 'member' | 'alumnus' | 'honorary';
  hierarchyOrder: number;
  classGrade?: string | null;
  section?: string | null;
  bio?: string | null;
  skills: string[];
  projectCount: number;
  achievementCount: number;
  isFeatured: boolean;
  status: 'active' | 'inactive' | 'alumnus' | 'suspended' | 'pending';
}

export interface MemberProjectPreview {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl?: string | null;
  roleInProject: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'archived';
  repoUrl?: string | null;
  liveUrl?: string | null;
}

export interface MemberAchievementPreview {
  id: string;
  title: string;
  description: string;
  category: 'Competition' | 'Academic' | 'Hackathon' | 'Leadership' | 'Honor' | 'Other';
  issuer: string;
  achievementDate: string;
  proofUrl?: string | null;
  isFeatured: boolean;
}

export interface MemberCertificatePreview {
  id: string;
  title: string;
  description?: string | null;
  issueDate: string;
  certificateNumber: string;
  verificationCode: string;
  fileUrl?: string | null;
  issuerName: string;
}

export interface MemberPostPreview {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
}

export interface MemberVideoPreview {
  id: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  publishedAt?: string | null;
}

export interface PublicMemberProfile {
  id: string;
  slug: string;
  fullName: string;
  avatarUrl?: string | null;
  designation: string;
  designationLevel: 'leadership' | 'member' | 'alumnus' | 'honorary';
  hierarchyOrder: number;
  classGrade?: string | null;
  section?: string | null;
  bio?: string | null;
  portfolioBio?: string | null;
  joiningDate?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  skills: Array<{
    id: string;
    name: string;
    category?: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }>;
  projects: MemberProjectPreview[];
  achievements: MemberAchievementPreview[];
  certificates: MemberCertificatePreview[];
  posts: MemberPostPreview[];
  videos: MemberVideoPreview[];
}

export interface MemberDirectoryFilters {
  query?: string;
  designationId?: string;
  classGrade?: string;
  section?: string;
  skill?: string;
  leadershipOnly?: boolean;
}

export interface MemberNotificationItem {
  id: string;
  title: string;
  message: string;
  notificationType: 'info' | 'alert' | 'event' | 'certificate' | 'quiz' | 'notice' | 'system';
  readAt?: string | null;
  isRead: boolean;
  createdAt: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
}

export interface MemberQuizItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  category: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  attemptLimit: number;
  status: string;
  publishedAt?: string | null;
}

export interface MemberQuizResultItem {
  id: string;
  quizId: string;
  quizTitle: string;
  totalScore: number;
  maxMarks: number;
  percentage: number;
  passed: boolean;
  date: string;
}

export interface MemberExamResultItem {
  id: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  status: string;
  examDate: string;
  remarks?: string | null;
}

export interface MemberResourceItem {
  id: string;
  title: string;
  slug: string;
  subject: string;
  classGrade: string;
  academicYear: string;
  examType: string;
  documentType: string;
  description?: string | null;
  filePath: string;
  fileSizeBytes: number;
  visibility: string;
  downloadCount: number;
}

export interface MemberIdentityDetails {
  id: string;
  userId: string;
  applicantNumber: string;
  fullName: string;
  displayName: string;
  avatarUrl?: string | null;
  birthYear?: number | null;
  classGrade: string;
  section: string;
  designation: string;
  designationLevel: 'leadership' | 'member' | 'alumnus' | 'honorary';
  hierarchyOrder: number;
  status: 'active' | 'inactive' | 'alumnus' | 'suspended' | 'pending';
  bio?: string | null;
  portfolioBio?: string | null;
  skills: string[];
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  joiningDate: string;
  mustChangePassword?: boolean;
  isAdminEligible: boolean;
}

export interface MemberDashboardData {
  member: MemberIdentityDetails;
  projects: MemberProjectPreview[];
  achievements: MemberAchievementPreview[];
  certificates: MemberCertificatePreview[];
  notifications: MemberNotificationItem[];
  quizzes: MemberQuizItem[];
  results: {
    quizzes: MemberQuizResultItem[];
    exams: MemberExamResultItem[];
  };
  resources: MemberResourceItem[];
}

export interface MemberProfileUpdatePayload {
  bio?: string;
  portfolioBio?: string;
  skills?: string[];
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}
