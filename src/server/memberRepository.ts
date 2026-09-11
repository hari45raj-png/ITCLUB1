/**
 * St. Mary's English School - IT Club Platform
 * Authoritative Member Data Repository & Business Logic
 * 
 * PROMPT 8: Member Authentication, Sequential Applicant ID, Dashboard & IDOR Defense
 * 
 * Compliance Rules:
 * 1. Sequential Applicant Number Generation (1, 2, 3...) - prevents duplicates.
 * 2. Password Formula: Birth Year + Class + Section (no spaces, uppercase).
 * 3. Never expose password hashes or authentication secrets in client responses.
 * 4. Strict IDOR Defense: Member can only access own private notifications, exam results, and profile.
 * 5. Strict Mass Assignment Defense: Discards any unapproved role/status input.
 * 6. Dual-mode resilience: Interacts with Supabase Auth & PostgreSQL, with synchronized server store.
 */

import { getSupabaseAdmin } from './supabaseAdmin';

export interface StoredProfile {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  roles?: string[];
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface StoredMember {
  id: string;
  userId: string;
  memberNumber: string; // Sequential Applicant Number: "IT@1", "IT@2", "IT@25"
  admissionNumber: string; // Official School Admission Number: e.g. "6551", "6756"
  customPasswordHash?: string; // Custom password set by member
  slug: string;
  birthYear: number;
  classGrade: string; // e.g. "10", "X", "9", "6"
  section: string;    // e.g. "C", "A", "B"
  designation: string;
  designationLevel: 'leadership' | 'member' | 'alumnus' | 'honorary' | 'faculty';
  hierarchyOrder: number;
  status: 'active' | 'inactive' | 'alumnus' | 'suspended' | 'pending' | 'archived';
  publicVisibility: boolean;
  portfolioVisibility: boolean;
  isFeatured: boolean;
  bio?: string;
  portfolioBio?: string;
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  joiningDate: string;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoredNotification {
  id: string;
  recipientId: string; // profiles.id
  title: string;
  message: string;
  notificationType: 'info' | 'alert' | 'event' | 'certificate' | 'quiz' | 'notice' | 'system';
  readAt?: string | null;
  createdAt: string;
}

export interface StoredProject {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl?: string;
  roleInProject: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'archived';
  repoUrl?: string;
  liveUrl?: string;
  memberId: string;
}

export interface StoredAchievement {
  id: string;
  memberId: string;
  title: string;
  description: string;
  category: 'Competition' | 'Academic' | 'Hackathon' | 'Leadership' | 'Honor' | 'Other';
  issuer: string;
  achievementDate: string;
  proofUrl?: string;
  isFeatured: boolean;
}

export interface StoredCertificate {
  id: string;
  recipientId: string; // members.id
  title: string;
  description?: string;
  issueDate: string;
  certificateNumber: string;
  verificationCode: string;
  status: 'valid' | 'revoked' | 'expired';
  fileUrl?: string;
  issuerName: string;
}

export interface StoredQuiz {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  attemptLimit: number;
  status: string;
  publishedAt: string;
}

export interface StoredQuizResult {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  totalScore: number;
  maxMarks: number;
  percentage: number;
  passed: boolean;
  date: string;
}

export interface StoredExamResult {
  id: string;
  studentId: string; // members.id
  subject: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  status: string;
  examDate: string;
  remarks?: string;
}

export interface StoredResource {
  id: string;
  title: string;
  slug: string;
  subject: string;
  classGrade: string;
  academicYear: string;
  examType: string;
  documentType: string;
  description?: string;
  filePath: string;
  fileSizeBytes: number;
  visibility: string;
  downloadCount: number;
  isDemo?: boolean;
}

export interface StoredDesignation {
  id: string;
  title: string;
  level: 'leadership' | 'member' | 'alumnus' | 'faculty';
  hierarchyOrder: number;
  description: string;
  isSystem?: boolean;
}

export interface StoredPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  authorName: string;
  authorId: string;
  status: 'published' | 'draft' | 'archived';
  publishedAt?: string;
  imageUrl?: string;
  priority: 'general' | 'featured' | 'announcement';
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface StoredNotice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'urgent' | 'general' | 'academic';
  publishedDate: string;
  status: 'published' | 'draft' | 'archived';
  author: string;
  attachmentUrl?: string;
  isPublic: boolean;
  createdAt: string;
  isDemo?: boolean;
}

export interface StoredEvent {
  id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  status: 'upcoming' | 'completed' | 'draft' | 'archived';
  imageUrl?: string;
  isPublic: boolean;
  createdAt: string;
  isDemo?: boolean;
}

export interface StoredGalleryItem {
  id: string;
  albumTitle: string;
  title: string;
  imageUrl: string;
  category: string;
  date: string;
  status: 'published' | 'archived';
  createdAt: string;
  isDemo?: boolean;
}

export interface StoredQuestionPaper {
  id: string;
  title: string;
  slug: string;
  classGrade: string;
  subject: string;
  academicYear: string;
  examType: string;
  description: string;
  filePath: string;
  fileSizeBytes: number;
  status: 'published' | 'draft' | 'archived';
  downloadCount: number;
  createdAt: string;
  isDemo?: boolean;
}

export interface StoredContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  isDemo?: boolean;
}

export interface StoredFileRecord {
  id: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  entityType: 'gallery' | 'resources' | 'question_papers' | 'certificates' | 'avatars';
  storagePath: string;
  status: 'active' | 'orphaned' | 'archived';
  uploadedAt: string;
}

export interface StoredSiteSettings {
  schoolName: string;
  establishedYear: number;
  schoolAddress: string;
  cbseAffiliationNo: string;
  schoolCode: string;
  udiseCode: string;
  clubName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  academicSession: string;
  maintenanceMode: boolean;
}

export interface StoredAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
  timestamp: string;
}

class MemberRepositoryStore {
  public profiles: Map<string, StoredProfile> = new Map();
  public members: Map<string, StoredMember> = new Map();
  public designations: StoredDesignation[] = [];
  public posts: StoredPost[] = [];
  public notices: StoredNotice[] = [];
  public events: StoredEvent[] = [];
  public gallery: StoredGalleryItem[] = [];
  public notifications: StoredNotification[] = [];
  public projects: StoredProject[] = [];
  public achievements: StoredAchievement[] = [];
  public certificates: StoredCertificate[] = [];
  public quizzes: StoredQuiz[] = [];
  public quizResults: StoredQuizResult[] = [];
  public examResults: StoredExamResult[] = [];
  public resources: StoredResource[] = [];
  public questionPapers: StoredQuestionPaper[] = [];
  public contactMessages: StoredContactMessage[] = [];
  public files: StoredFileRecord[] = [];
  public auditLogs: StoredAuditLog[] = [];
  public settings: StoredSiteSettings = {
    schoolName: "ST. MARY'S ENGLISH SCHOOL",
    establishedYear: 2002,
    schoolAddress: "Sheikhpura Road, Barbigha (Sheikhpura) Bihar - 811101",
    cbseAffiliationNo: "330509",
    schoolCode: "65518",
    udiseCode: "10262909101",
    clubName: "St. Mary's English School IT Club",
    tagline: "Excellence in Computing & Digital Innovation",
    contactEmail: "itclub@stmarysenglishschool.edu",
    contactPhone: "+91 6341 223344",
    academicSession: "2026-2027",
    maintenanceMode: false,
  };

  // Sequential generator begins at 1 (IT@1). IT@0 is permanently reserved for Root Administrator.
  private nextSeq: number = 1;

  constructor() {
    this.seedInitialData();
  }

  /**
   * Generates next sequential applicant number formatted as IT@N (e.g., IT@1, IT@2, IT@25)
   * IT@0 is strictly reserved exclusively for the Root Administrator and CANNOT be assigned to any member.
   */
  public getNextApplicantNumber(): string {
    const existingNumbers = Array.from(this.members.values())
      .filter(m => m.status === 'active' || m.status === 'inactive')
      .map(m => {
        const match = m.memberNumber.match(/^IT@(\d+)$/i) || m.memberNumber.match(/^(\d+)$/);
        return match ? parseInt(match[1], 10) : NaN;
      })
      .filter(n => !isNaN(n) && n > 0); // Exclude 0 because IT@0 is permanently reserved!
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const next = Math.max(maxNumber + 1, this.nextSeq, 1);
    this.nextSeq = next + 1;
    return `IT@${next}`;
  }

  private seedInitialData() {
    // Reserved Root Administrator (Applicant Number: IT@0)
    // IT@0 is the ONLY authorized Admin Member account.
    const rootUserId = '00000000-0000-4000-8000-000000000000';
    const rootMemberId = 'm0000000-0000-4000-8000-000000000000';
    
    this.profiles.set(rootUserId, {
      id: rootUserId,
      email: 'applicant.it0@stmarysenglishschool.edu',
      fullName: 'Root Administrator',
      displayName: 'Club Administrator',
      avatarUrl: undefined,
      role: 'admin',
      roles: ['member', 'admin', 'super_admin'],
      status: 'active',
      createdAt: '2026-09-11T00:00:00Z',
      updatedAt: '2026-09-11T00:00:00Z',
    });

    this.members.set(rootMemberId, {
      id: rootMemberId,
      userId: rootUserId,
      memberNumber: 'IT@0',
      admissionNumber: '', // NEVER store initial credential "0000" in plaintext in member profile table!
      slug: 'root-admin',
      birthYear: 2000,
      classGrade: 'Staff',
      section: 'Admin',
      designation: 'Root Administrator',
      designationLevel: 'leadership',
      hierarchyOrder: 1,
      status: 'active',
      publicVisibility: false, // Root Admin is internal administrative account; does not appear as a student in public member directory
      portfolioVisibility: false,
      isFeatured: false,
      bio: 'Executive IT Club System & Root Administrator.',
      portfolioBio: 'Official administrative identity for St. Mary’s English School IT Club infrastructure.',
      skills: ['System Administration', 'Security Operations', 'Database Management'],
      joiningDate: '2026-09-11',
      mustChangePassword: true,
      createdAt: '2026-09-11T00:00:00Z',
      updatedAt: '2026-09-11T00:00:00Z',
    });

    // Root Admin Notification
    this.notifications.push({
      id: 'notif-root-1',
      recipientId: rootUserId,
      title: 'Root Administrative System Active',
      message: 'Root Administrative Member (Applicant IT@0) is active. Please complete initial password reset.',
      notificationType: 'info',
      readAt: null,
      createdAt: new Date().toISOString(),
    });


    // Available Active Quizzes
    this.quizzes.push(
      {
        id: 'quiz-1',
        title: 'Class 10 Computer Applications: Java OOP & String Handling',
        slug: 'class-10-comp-apps-java-oop',
        description: 'Comprehensive 20-question evaluation covering Java classes, objects, String methods, and array algorithms.',
        category: 'Class 10 ICSE/CBSE',
        durationMinutes: 30,
        totalMarks: 50,
        passingMarks: 20,
        attemptLimit: 2,
        status: 'published',
        publishedAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'quiz-2',
        title: 'IT Club Fundamentals: Cyber Security & Internet Ethics',
        slug: 'it-club-cyber-security-ethics',
        description: 'Baseline digital safety, strong authentication standards, and network protocols assessment.',
        category: 'General IT',
        durationMinutes: 20,
        totalMarks: 30,
        passingMarks: 15,
        attemptLimit: 3,
        status: 'published',
        publishedAt: '2026-08-15T10:00:00Z',
      }
    );

    // Available Academic Question Papers & Resources
    this.resources.push(
      {
        id: 'res-1',
        title: 'Class 10 Computer Applications — Pre-Board Model Paper 2026',
        slug: 'class-10-pre-board-model-paper-2026',
        subject: 'Computer Applications',
        classGrade: '10',
        academicYear: '2026-2027',
        examType: 'Pre-Board',
        documentType: 'question_paper',
        description: 'Official model question paper structured according to the latest syllabus with section A and B programming problems.',
        filePath: 'exams/class10/preboard-model-2026.pdf',
        fileSizeBytes: 1450000,
        visibility: 'members_only',
        downloadCount: 42,
      },
      {
        id: 'res-2',
        title: 'Java String & Array Algorithm Practice Worksheet',
        slug: 'java-string-array-worksheet',
        subject: 'Computer Applications',
        classGrade: '10',
        academicYear: '2026-2027',
        examType: 'Unit Test',
        documentType: 'worksheet',
        description: 'Hand-curated problem set containing 25 pattern printing, palindromic word, and bubble sort trace exercises.',
        filePath: 'resources/worksheets/java-practice-set-1.pdf',
        fileSizeBytes: 820000,
        visibility: 'members_only',
        downloadCount: 88,
      },
      {
        id: 'res-3',
        title: 'Junior Coding Club: Python Basics & Turtle Graphics Guide',
        slug: 'python-turtle-graphics-guide',
        subject: 'Information Technology',
        classGrade: '6-8',
        academicYear: '2026-2027',
        examType: 'Model Paper',
        documentType: 'study_material',
        description: 'Step-by-step beginner guide for procedural programming with Python Turtle and loops.',
        filePath: 'resources/study/python-turtle-basics.pdf',
        fileSizeBytes: 2100000,
        visibility: 'members_only',
        downloadCount: 35,
        isDemo: true,
      }
    );

    // Initial Database-Driven Member Designations
    this.designations.push(
      { id: 'desig-1', title: 'President', level: 'leadership', hierarchyOrder: 1, description: 'Executive head of the IT Club, overseeing overall council activities, inter-school tech events, and club administration.', isSystem: true },
      { id: 'desig-2', title: 'Vice President', level: 'leadership', hierarchyOrder: 2, description: 'Executive second-in-command, coordinating member mentoring and technical project development.', isSystem: true },
      { id: 'desig-3', title: 'Secretary', level: 'leadership', hierarchyOrder: 3, description: 'Maintains club records, meeting proceedings, and official correspondence.', isSystem: true },
      { id: 'desig-4', title: 'Joint Secretary', level: 'leadership', hierarchyOrder: 4, description: 'Assists the Secretary in event administration and logistics management.', isSystem: true },
      { id: 'desig-5', title: 'Technical Lead', level: 'leadership', hierarchyOrder: 5, description: 'Directs hackathon preparations, repository reviews, and coding workshop curriculum.', isSystem: true },
      { id: 'desig-0', title: 'Faculty Moderator', level: 'faculty', hierarchyOrder: 0, description: 'Senior School Faculty Member supervising IT Club compliance and student guidance.', isSystem: true },
      { id: 'desig-10', title: 'Senior Member', level: 'member', hierarchyOrder: 10, description: 'Active senior student contributor who leads working groups and peer mentoring.', isSystem: true },
      { id: 'desig-20', title: 'Member', level: 'member', hierarchyOrder: 20, description: 'Standard active club member participating in projects, workshops, and quizzes.', isSystem: true },
      { id: 'desig-30', title: 'Junior Member', level: 'member', hierarchyOrder: 30, description: 'Junior student (Classes 6-8) beginning digital skills and programming fundamentals.', isSystem: true }
    );

    // Seeded Notices (tagged isDemo for candidate cleanup)
    this.notices.push(
      {
        id: 'not-1',
        title: 'CBSE Class 10 IT-402 Practical Examination Schedule 2026',
        content: 'All Class 10 candidates enrolled in IT-402 (Information Technology) are hereby notified that internal practical examinations and project viva will commence from November 15, 2026. Please ensure your practical log notebooks are signed.',
        category: 'Academic',
        priority: 'urgent',
        publishedDate: '2026-10-01',
        status: 'published',
        author: 'IT Club Faculty Moderator',
        isPublic: true,
        createdAt: '2026-10-01T08:00:00Z',
        isDemo: true,
      },
      {
        id: 'not-2',
        title: 'Call for Registrations: St. Mary’s Annual Coding Championship 2026',
        content: 'Registrations are now open for the Intra-School Coding Contest across two divisions: Junior (Classes 6-8, Python & Scratch) and Senior (Classes 9-10, Java & Web Development). Submit your applicant ID before October 25.',
        category: 'Club Activity',
        priority: 'general',
        publishedDate: '2026-10-05',
        status: 'published',
        author: 'Executive Council',
        isPublic: true,
        createdAt: '2026-10-05T10:00:00Z',
        isDemo: true,
      }
    );

    // Seeded Posts (tagged isDemo)
    this.posts.push(
      {
        id: 'post-1',
        title: 'Building Modern Web Applications: Lessons from St. Mary’s Hackathon',
        slug: 'lessons-from-st-marys-hackathon',
        content: 'Our student teams demonstrated exceptional ingenuity using React and Tailwind CSS during the 24-hour innovation challenge. Here is a breakdown of the top winning algorithms and architecture patterns.',
        category: 'Web Development',
        authorName: 'IT Club Editorial Team',
        authorId: '00000000-0000-4000-8000-000000000000',
        status: 'published',
        publishedAt: '2026-09-15T12:00:00Z',
        priority: 'featured',
        createdAt: '2026-09-15T12:00:00Z',
        updatedAt: '2026-09-15T12:00:00Z',
        isDemo: true,
      },
      {
        id: 'post-2',
        title: 'Demystifying Cyber Safety: Best Practices for School Students',
        slug: 'demystifying-cyber-safety',
        content: 'With increased digital learning, understanding two-factor authentication, phishing defense, and strong credentials has never been more vital for students.',
        category: 'Cyber Security',
        authorName: 'IT Club Editorial Team',
        authorId: '00000000-0000-4000-8000-000000000000',
        status: 'published',
        publishedAt: '2026-09-20T14:00:00Z',
        priority: 'general',
        createdAt: '2026-09-20T14:00:00Z',
        updatedAt: '2026-09-20T14:00:00Z',
        isDemo: true,
      }
    );

    // Seeded Events (tagged isDemo)
    this.events.push(
      {
        id: 'evt-1',
        title: 'Annual Tech Symposium & Robotics Demo 2026',
        slug: 'annual-tech-symposium-2026',
        date: '2026-11-20',
        time: '10:00 AM - 03:30 PM',
        location: 'School Main Auditorium, St. Mary’s Campus, Barbigha',
        description: 'Keynote demonstrations on embedded robotics, open-source programming showcase, and student project exhibitions for parents and guests.',
        category: 'Exhibition',
        status: 'upcoming',
        isPublic: true,
        createdAt: '2026-09-10T09:00:00Z',
        isDemo: true,
      },
      {
        id: 'evt-2',
        title: 'Python for Beginners Bootcamp (Classes 6 to 8)',
        slug: 'python-beginners-bootcamp-2026',
        date: '2026-11-28',
        time: '01:30 PM - 03:00 PM',
        location: 'Computer Science Lab 1',
        description: 'Interactive hands-on session introducing syntax, variables, loops, and basic graphic art using the Python turtle library.',
        category: 'Workshop',
        status: 'upcoming',
        isPublic: true,
        createdAt: '2026-09-12T10:00:00Z',
        isDemo: true,
      }
    );

    // Seeded Gallery Items (tagged isDemo)
    this.gallery.push(
      {
        id: 'gal-1',
        albumTitle: 'Coding Olympiad 2026',
        title: 'Student teams testing automated test cases',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        category: 'Competitions',
        date: '2026-08-14',
        status: 'published',
        createdAt: '2026-08-14T11:00:00Z',
        isDemo: true,
      },
      {
        id: 'gal-2',
        albumTitle: 'Hardware & IoT Exhibition',
        title: 'Microcontroller line-follower robot demonstration',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
        category: 'Workshops',
        date: '2026-08-28',
        status: 'published',
        createdAt: '2026-08-28T14:30:00Z',
        isDemo: true,
      }
    );

    // Seeded Question Papers (tagged isDemo)
    this.questionPapers.push(
      {
        id: 'qp-1',
        title: 'Class 10 CBSE IT-402 Pre-Board Model Paper 2026',
        slug: 'class-10-cbse-it-402-pre-board-2026',
        classGrade: '10',
        subject: 'Information Technology (Code 402)',
        academicYear: '2026-2027',
        examType: 'Pre-Board',
        description: 'Complete question paper conforming to the 50-mark theory distribution: Employability Skills (10 marks) and Subject Specific Skills (40 marks).',
        filePath: 'exams/class10/cbse-it402-preboard-2026.pdf',
        fileSizeBytes: 1850000,
        status: 'published',
        downloadCount: 54,
        createdAt: '2026-08-20T09:00:00Z',
        isDemo: true,
      },
      {
        id: 'qp-2',
        title: 'Class 9 Information Technology Mid-Term Exam Paper',
        slug: 'class-9-it-midterm-paper-2026',
        classGrade: '9',
        subject: 'Information Technology (Code 402)',
        academicYear: '2026-2027',
        examType: 'Mid-Term',
        description: 'Covers LibreOffice Writer, digital documentation basics, and fundamental communication skills.',
        filePath: 'exams/class9/it-midterm-2026.pdf',
        fileSizeBytes: 1220000,
        status: 'published',
        downloadCount: 38,
        createdAt: '2026-09-02T10:00:00Z',
        isDemo: true,
      }
    );

    // Seeded Contact Messages (tagged isDemo)
    this.contactMessages.push(
      {
        id: 'msg-1',
        fullName: 'Rajesh Verma',
        email: 'rajesh.verma@example.com',
        phone: '+91 98765 43210',
        subject: 'Inquiry regarding Class 8 IT Club admission',
        message: 'Hello, I would like to know if my ward studying in Class 8 Section A can enroll in the Junior Robotics and Python weekend workshop.',
        status: 'unread',
        createdAt: '2026-09-05T11:20:00Z',
        isDemo: true,
      },
      {
        id: 'msg-2',
        fullName: 'Meera Sen',
        email: 'meera.sen@techpulse.org',
        subject: 'Inter-school Hackathon invitation proposal',
        message: 'Dear IT Club Faculty & President, TechPulse Foundation invites St. Mary’s English School to participate in the National Cyber Challenge 2026.',
        status: 'read',
        createdAt: '2026-09-08T15:45:00Z',
        isDemo: true,
      }
    );

    // Seeded File Records
    this.files.push(
      {
        id: 'fil-1',
        fileName: 'preboard-model-2026.pdf',
        fileType: 'application/pdf',
        sizeBytes: 1450000,
        entityType: 'question_papers',
        storagePath: 'exams/class10/preboard-model-2026.pdf',
        status: 'active',
        uploadedAt: '2026-08-20T09:00:00Z',
      },
      {
        id: 'fil-2',
        fileName: 'java-practice-set-1.pdf',
        fileType: 'application/pdf',
        sizeBytes: 820000,
        entityType: 'resources',
        storagePath: 'resources/worksheets/java-practice-set-1.pdf',
        status: 'active',
        uploadedAt: '2026-08-25T11:00:00Z',
      }
    );

    // Seeded Initial Audit Log
    this.auditLogs.push(
      {
        id: 'audit-init-1',
        actorId: 'system-boot',
        actorName: 'System Security Engine',
        actorRole: 'system',
        action: 'PLATFORM_INITIALIZED',
        entityType: 'security',
        entityId: 'smes-it-club',
        changes: { status: 'operational', timestamp: '2026-08-01T00:00:00Z' },
        timestamp: '2026-08-01T00:00:00Z',
      }
    );
  }

  /**
   * Appends an audit log record
   */
  public addAuditLog(
    actorId: string,
    actorName: string,
    actorRole: string,
    action: string,
    entityType: string,
    entityId: string,
    changes?: any
  ): StoredAuditLog {
    const entry: StoredAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      actorId,
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      changes: changes || {},
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    // Keep max 500 logs in memory
    if (this.auditLogs.length > 500) {
      this.auditLogs.length = 500;
    }
    return entry;
  }

  /**
   * Scans and returns all candidate mock/demo records across store collections
   */
  public getMockCandidates() {
    const mockPosts = this.posts.filter(p => p.isDemo);
    const mockNotices = this.notices.filter(n => n.isDemo);
    const mockEvents = this.events.filter(e => e.isDemo);
    const mockGallery = this.gallery.filter(g => g.isDemo);
    const mockProjects = this.projects.filter(p => (p as any).isDemo);
    const mockAchievements = this.achievements.filter(a => (a as any).isDemo);
    const mockResources = this.resources.filter(r => r.isDemo);
    const mockQuestionPapers = this.questionPapers.filter(q => q.isDemo);
    const mockContactMessages = this.contactMessages.filter(m => m.isDemo);

    return {
      posts: mockPosts,
      notices: mockNotices,
      events: mockEvents,
      gallery: mockGallery,
      projects: mockProjects,
      achievements: mockAchievements,
      resources: mockResources,
      questionPapers: mockQuestionPapers,
      contactMessages: mockContactMessages,
      totalCandidateCount:
        mockPosts.length +
        mockNotices.length +
        mockEvents.length +
        mockGallery.length +
        mockProjects.length +
        mockAchievements.length +
        mockResources.length +
        mockQuestionPapers.length +
        mockContactMessages.length,
    };
  }

  /**
   * Soft-archives all candidate demo records so they are hidden from public views
   */
  public archiveAllMockCandidates(): { archivedCount: number } {
    let count = 0;
    this.posts.forEach(p => { if (p.isDemo && p.status !== 'archived') { p.status = 'archived'; count++; } });
    this.notices.forEach(n => { if (n.isDemo && n.status !== 'archived') { n.status = 'archived'; count++; } });
    this.events.forEach(e => { if (e.isDemo && e.status !== 'archived') { e.status = 'archived'; count++; } });
    this.gallery.forEach(g => { if (g.isDemo && g.status !== 'archived') { g.status = 'archived'; count++; } });
    this.questionPapers.forEach(q => { if (q.isDemo && q.status !== 'archived') { q.status = 'archived'; count++; } });
    this.contactMessages.forEach(m => { if (m.isDemo && m.status !== 'archived') { m.status = 'archived'; count++; } });
    return { archivedCount: count };
  }

  /**
   * Safely removes candidate demo records permanently
   */
  public removeAllMockCandidates(): { removedCount: number } {
    const initialTotal =
      this.posts.length +
      this.notices.length +
      this.events.length +
      this.gallery.length +
      this.questionPapers.length +
      this.contactMessages.length +
      this.resources.length;

    this.posts = this.posts.filter(p => !p.isDemo);
    this.notices = this.notices.filter(n => !n.isDemo);
    this.events = this.events.filter(e => !e.isDemo);
    this.gallery = this.gallery.filter(g => !g.isDemo);
    this.questionPapers = this.questionPapers.filter(q => !q.isDemo);
    this.contactMessages = this.contactMessages.filter(m => !m.isDemo);
    this.resources = this.resources.filter(r => !r.isDemo);

    const finalTotal =
      this.posts.length +
      this.notices.length +
      this.events.length +
      this.gallery.length +
      this.questionPapers.length +
      this.contactMessages.length +
      this.resources.length;

    return { removedCount: initialTotal - finalTotal };
  }

  /**
   * Resolves member by Applicant Number (supports "IT@1", "IT@25", "it@25", or numeric string)
   */
  public findMemberByApplicantNumber(applicantNo: string): StoredMember | undefined {
    const clean = applicantNo.trim();
    const normalized = clean.toUpperCase().startsWith('IT@')
      ? clean.toUpperCase()
      : `IT@${clean}`;
    return Array.from(this.members.values()).find(
      m => m.memberNumber.toUpperCase() === normalized ||
           m.memberNumber.toUpperCase() === clean.toUpperCase() ||
           m.memberNumber.replace(/^IT@/i, '') === clean.replace(/^IT@/i, '')
    );
  }

  /**
   * Resolves member by user_id
   */
  public findMemberByUserId(userId: string): StoredMember | undefined {
    return Array.from(this.members.values()).find(m => m.userId === userId);
  }

  /**
   * Resolves profile by user_id
   */
  public findProfileByUserId(userId: string): StoredProfile | undefined {
    return this.profiles.get(userId);
  }

  /**
   * Retrieves all members merged with their profile data
   */
  public getAllMembers() {
    return Array.from(this.members.values()).map(m => {
      const p = this.profiles.get(m.userId);
      return {
        ...m,
        admissionNumber: m.admissionNumber,
        fullName: p?.fullName || m.slug,
        displayName: p?.displayName || p?.fullName || m.slug,
        email: p?.email,
        avatarUrl: p?.avatarUrl,
        role: p?.role || 'member',
        roles: p?.roles || ['member'],
      };
    }).sort((a, b) => a.hierarchyOrder - b.hierarchyOrder);
  }

  /**
   * Retrieves a single member by ID
   */
  public getMemberById(id: string) {
    const m = this.members.get(id);
    if (!m) return undefined;
    const p = this.profiles.get(m.userId);
    return {
      ...m,
      admissionNumber: m.admissionNumber,
      fullName: p?.fullName || m.slug,
      displayName: p?.displayName || p?.fullName || m.slug,
      email: p?.email,
      avatarUrl: p?.avatarUrl,
      role: p?.role || 'member',
      roles: p?.roles || ['member'],
    };
  }

  /**
   * Creates a new member with sequential Applicant Number (IT@N) & School Admission Number
   */
  public createMember(data: {
    fullName: string;
    admissionNumber: string;
    birthYear?: number;
    classGrade: string;
    section: string;
    designation?: string;
    bio?: string;
    skills?: string[];
  }): { member: StoredMember; profile: StoredProfile; applicantNumber: string; admissionNumber: string } {
    const applicantNumber = this.getNextApplicantNumber();
    const admissionNumber = data.admissionNumber.trim();
    
    const userId = `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const memberId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const designation = data.designation || 'Member';
    let designationLevel: 'leadership' | 'member' | 'alumnus' | 'faculty' = 'member';
    let hierarchyOrder = 20;

    const matchedDesig = this.designations.find(d => d.title.toLowerCase() === designation.toLowerCase());
    if (matchedDesig) {
      designationLevel = matchedDesig.level;
      hierarchyOrder = matchedDesig.hierarchyOrder;
    } else if (['President', 'Vice President', 'Secretary', 'Technical Lead'].includes(designation)) {
      designationLevel = 'leadership';
      hierarchyOrder = designation === 'President' ? 1 : designation === 'Vice President' ? 2 : 5;
    }

    const cleanNum = applicantNumber.replace(/^IT@/i, '');
    const email = `applicant.it${cleanNum}@stmarysenglishschool.edu`;

    const profile: StoredProfile = {
      id: userId,
      email,
      fullName: data.fullName.trim(),
      displayName: data.fullName.trim(),
      avatarUrl: undefined,
      role: 'member',
      roles: ['member'],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const member: StoredMember = {
      id: memberId,
      userId,
      memberNumber: applicantNumber,
      admissionNumber,
      slug: data.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      birthYear: data.birthYear || 2011,
      classGrade: data.classGrade.trim(),
      section: data.section.trim().toUpperCase(),
      designation,
      designationLevel,
      hierarchyOrder,
      status: 'active',
      publicVisibility: true,
      portfolioVisibility: true,
      isFeatured: false,
      bio: data.bio || `Active member of the St. Mary's English School IT Club.`,
      skills: data.skills || ['Computing Basics', 'Information Technology'],
      joiningDate: now.split('T')[0],
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.set(userId, profile);
    this.members.set(memberId, member);

    // Add welcome notification
    this.notifications.push({
      id: `notif-${Date.now()}`,
      recipientId: userId,
      title: 'Welcome to St. Mary’s English School IT Club',
      message: `Your Member Account has been officially registered with Applicant Number: ${applicantNumber}. Your initial login password is your School Admission Number. Please change your password upon initial sign in.`,
      notificationType: 'info',
      readAt: null,
      createdAt: now,
    });

    return { member, profile, applicantNumber, admissionNumber };
  }

  /**
   * Updates an existing member & profile
   */
  public updateMember(id: string, data: {
    fullName?: string;
    admissionNumber?: string;
    classGrade?: string;
    section?: string;
    designation?: string;
    bio?: string;
    skills?: string[];
    status?: 'active' | 'inactive' | 'archived' | 'suspended';
    publicVisibility?: boolean;
    portfolioVisibility?: boolean;
    isFeatured?: boolean;
  }) {
    const member = this.members.get(id);
    if (!member) return null;

    const profile = this.profiles.get(member.userId);
    const now = new Date().toISOString();

    if (data.fullName && profile) {
      profile.fullName = data.fullName.trim();
      profile.displayName = data.fullName.trim();
      member.slug = data.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (data.admissionNumber !== undefined) {
      member.admissionNumber = data.admissionNumber.trim();
    }
    if (data.classGrade !== undefined) member.classGrade = data.classGrade;
    if (data.section !== undefined) member.section = data.section.toUpperCase();
    if (data.designation !== undefined) {
      member.designation = data.designation;
      const matchedDesig = this.designations.find(d => d.title.toLowerCase() === data.designation!.toLowerCase());
      if (matchedDesig) {
        member.designationLevel = matchedDesig.level;
        member.hierarchyOrder = matchedDesig.hierarchyOrder;
      }
    }
    if (data.bio !== undefined) member.bio = data.bio;
    if (data.skills !== undefined) member.skills = data.skills;
    if (data.status !== undefined) {
      member.status = data.status;
      if (profile) profile.status = data.status;
    }
    if (data.publicVisibility !== undefined) member.publicVisibility = data.publicVisibility;
    if (data.portfolioVisibility !== undefined) member.portfolioVisibility = data.portfolioVisibility;
    if (data.isFeatured !== undefined) member.isFeatured = data.isFeatured;

    member.updatedAt = now;
    if (profile) profile.updatedAt = now;

    return this.getMemberById(id);
  }

  /**
   * Soft-archives a member
   */
  public archiveMember(id: string) {
    const m = this.members.get(id);
    if (m && (m.memberNumber === 'IT@0' || m.memberNumber === '0')) {
      throw new Error('The Root Administrator (Applicant IT@0) cannot be archived.');
    }
    return this.updateMember(id, { status: 'archived', publicVisibility: false });
  }

  /**
   * Restores an archived member
   */
  public restoreMember(id: string) {
    return this.updateMember(id, { status: 'active', publicVisibility: true });
  }

  /**
   * Permanently deletes a member
   */
  public deleteMember(id: string): boolean {
    const m = this.members.get(id);
    if (!m) return false;
    if (m.memberNumber === 'IT@0' || m.memberNumber === '0') {
      throw new Error('The Root Administrator (Applicant IT@0) cannot be deleted.');
    }
    this.profiles.delete(m.userId);
    this.members.delete(id);
    return true;
  }
}

export const memberRepository = new MemberRepositoryStore();

/**
 * Initializes and synchronizes the reserved Root Administrator in Supabase Auth on server startup.
 * Purges obsolete test/demo accounts (IT@1, IT@2, IT@3) and ensures Applicant IT@0 is the ONLY authorized Admin.
 */
export async function syncSeededAuthUsers(): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    const { data: { users }, error } = await admin.auth.admin.listUsers();
    if (error) {
      console.warn('[Auth Sync] Supabase Auth user listing notice:', error.message);
      return;
    }

    const obsoleteEmails = [
      'applicant.it1@stmarysenglishschool.edu',
      'applicant.1@stmarysenglishschool.edu',
      'applicant.it2@stmarysenglishschool.edu',
      'applicant.2@stmarysenglishschool.edu',
      'applicant.it3@stmarysenglishschool.edu',
      'applicant.3@stmarysenglishschool.edu',
    ];

    // Purge obsolete test/demo auth accounts if present
    for (const u of (users || [])) {
      if (u.email && obsoleteEmails.includes(u.email.toLowerCase())) {
        try {
          await admin.auth.admin.deleteUser(u.id);
          console.log(`[Auth Sync] Cleaned up legacy test account from Supabase Auth: ${u.email}`);
        } catch (delErr: any) {
          console.warn(`[Auth Sync] Warning deleting legacy user ${u.email}:`, delErr.message);
        }
      }
    }

    // Provision or sync Reserved Root Administrator (Applicant IT@0)
    const rootEmail = 'applicant.it0@stmarysenglishschool.edu';
    let rootAuthUser = (users || []).find(u => u.email?.toLowerCase() === rootEmail.toLowerCase());

    if (!rootAuthUser) {
      const { data, error: createErr } = await admin.auth.admin.createUser({
        email: rootEmail,
        password: 'Password0000!', // Supabase Auth hashed credential; proxy login accepts initial password '0000'
        email_confirm: true,
        user_metadata: {
          full_name: 'Root Administrator',
          applicant_number: 'IT@0',
          role: 'admin',
          roles: ['member', 'admin', 'super_admin'],
        },
      });
      if (createErr) {
        console.warn('[Auth Sync] Notice provisioning root admin:', createErr.message);
      } else if (data?.user) {
        rootAuthUser = data.user;
        console.log('[Auth Sync] Provisioned reserved Root Administrator in Supabase Auth (Applicant IT@0)');
      }
    }

    // Align in-memory repository with Supabase user ID if available
    if (rootAuthUser) {
      const rootMember = memberRepository.findMemberByApplicantNumber('IT@0');
      if (rootMember) {
        const oldUserId = rootMember.userId;
        rootMember.userId = rootAuthUser.id;
        const profile = memberRepository.profiles.get(oldUserId);
        if (profile) {
          memberRepository.profiles.delete(oldUserId);
          profile.id = rootAuthUser.id;
          memberRepository.profiles.set(rootAuthUser.id, profile);
        }
      }
    }

    // Clean up any database roles or mock rows if Supabase DB is accessible
    try {
      await (admin as any).from('members').delete().in('member_number', ['IT@1', 'IT@2', 'IT@3', '1', '2', '3']);
      await (admin as any).from('profiles').delete().in('email', obsoleteEmails);
    } catch {
      // Ignore if database tables not initialized yet
    }
  } catch (err: any) {
    console.warn('[Auth Sync] Notice during root admin sync:', err.message);
  }
}
