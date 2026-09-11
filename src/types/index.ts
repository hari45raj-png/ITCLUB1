/**
 * St. Mary's English School - IT Club Platform
 * Architecture Constitution & Domain Contracts
 * 
 * NOTE: These interfaces define the system-wide types and data contracts
 * established in Prompt 1. All subsequent implementation prompts must adhere
 * to these models.
 */

// ==========================================
// 1. USER & AUTHORIZATION ROLES
// ==========================================
export type UserRole = 'visitor' | 'member' | 'faculty_moderator' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string; // matches auth.users UUID in Supabase
  email: string;
  role: UserRole;
  roles?: string[];
  fullName: string;
  avatarUrl?: string;
  classGrade?: string; // e.g., "Class 10", "Class 12"
  section?: string;    // e.g., "Section A"
  rollNumber?: string;
  admissionNumber?: string;
  applicantNumber?: string;
  memberNumber?: string;
  designation?: string;
  designationLevel?: string;
  bio?: string;
  mustChangePassword?: boolean;
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface SecurityCheckResult {
  category: string;
  name: string;
  description: string;
  enforcedBy: 'PostgreSQL RLS' | 'Server Express API' | 'Supabase Auth' | 'Client Boundary Guard';
  status: 'passed' | 'failed' | 'warning' | 'testing';
  details: string;
}

// ==========================================
// 2. CONTENT LIFECYCLE & VISIBILITY
// ==========================================
export type ContentStatus = 'draft' | 'published' | 'archived';
export type VisibilityScope = 'public' | 'members_only' | 'admin_only';

// ==========================================
// 3. MEMBER PORTFOLIO DOMAIN CONTRACT
// ==========================================
export interface MemberPortfolio {
  id: string;
  profileId: string;
  position: string; // e.g., "President", "Lead Developer", "Competitive Programmer"
  shortBio: string;
  detailedBio?: string;
  skills: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    portfolioUrl?: string;
    email?: string;
  };
  featuredOrder: number;
  visibility: VisibilityScope;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. NOTICE & NOTIFICATION CONTRACTS
// ==========================================
export interface ClubNotice {
  id: string;
  title: string;
  slug: string;
  category: 'general' | 'academic' | 'competition' | 'workshop' | 'urgent';
  content: string;
  attachmentUrls?: string[];
  isPinned: boolean;
  visibility: VisibilityScope;
  status: ContentStatus;
  publishedAt?: string;
  authorId: string;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ==========================================
// 5. PROJECTS & ACHIEVEMENTS
// ==========================================
export interface ClubProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string;
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
  contributors: string[]; // Member IDs
  status: ContentStatus;
  featured: boolean;
  publishedAt?: string;
}

export interface ClubAchievement {
  id: string;
  title: string;
  competitionName: string;
  awardLevel: '1st_place' | '2nd_place' | '3rd_place' | 'finalist' | 'special_mention';
  year: number;
  description: string;
  certificateUrl?: string;
  photoUrl?: string;
  recipientMemberIds: string[];
}

// ==========================================
// 6. ACADEMIC, QUIZZES & EXAM DOCUMENTS
// ==========================================
export interface ExamDocument {
  id: string;
  title: string;
  subject: string;
  targetClass: string;
  academicYear: string;
  documentType: 'question_paper' | 'sample_paper' | 'answer_key' | 'worksheet' | 'study_material';
  fileUrl: string;
  fileSizeBytes: number;
  fileFormat: string;
  status: ContentStatus;
}

export interface QuizAssessment {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  passPercentage: number;
  status: ContentStatus;
  questionCount: number;
}

// ==========================================
// 7. CERTIFICATES & VERIFICATION
// ==========================================
export interface CertificateRecord {
  id: string;
  verificationCode: string; // Unique public lookup code e.g., "SMES-IT-2026-9812"
  recipientName: string;
  recipientEmail?: string;
  eventOrQuizTitle: string;
  issueDate: string;
  issuedBy: string;
  pdfUrl?: string;
  isValid: boolean;
}

// ==========================================
// 8. ASYNC UI STATES & API CONTRACTS
// ==========================================
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export * from './member';
