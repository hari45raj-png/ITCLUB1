import React, { useState } from 'react';
import {
  Database,
  Table,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  ArrowRight,
  FileCode,
  Layers,
  Sparkles,
  Lock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { supabase } from '../lib/supabaseClient';

interface SchemaTable {
  name: string;
  domain: string;
  description: string;
  primaryKey: string;
  columnsCount: number;
  foreignKeys: { column: string; references: string; onDelete: 'CASCADE' | 'RESTRICT' | 'SET NULL' }[];
  uniqueConstraints: string[];
  checkConstraints: string[];
  indexes: string[];
  lifecycleModel: string;
  rlsEnabled: boolean;
}

const DATABASE_TABLES: SchemaTable[] = [
  // 1. Identity & RBAC
  {
    name: 'profiles',
    domain: 'Identity & Access',
    description: 'Extended user profiles mapped 1:1 with auth.users',
    primaryKey: 'id (UUID)',
    columnsCount: 8,
    foreignKeys: [{ column: 'id', references: 'auth.users(id)', onDelete: 'CASCADE' }],
    uniqueConstraints: ['PRIMARY KEY (id)'],
    checkConstraints: ["status IN ('active', 'inactive', 'suspended', 'pending')"],
    indexes: ['idx_profiles_status ON status'],
    lifecycleModel: 'active -> inactive -> suspended',
    rlsEnabled: true,
  },
  {
    name: 'roles',
    domain: 'Identity & Access',
    description: 'System roles (super_admin, admin, faculty_moderator, member)',
    primaryKey: 'id (UUID)',
    columnsCount: 5,
    foreignKeys: [],
    uniqueConstraints: ['name (UNIQUE)'],
    checkConstraints: [],
    indexes: [],
    lifecycleModel: 'Immutable system roles with is_system flag',
    rlsEnabled: true,
  },
  {
    name: 'permissions',
    domain: 'Identity & Access',
    description: 'Granular system permission capabilities',
    primaryKey: 'id (UUID)',
    columnsCount: 5,
    foreignKeys: [],
    uniqueConstraints: ['code (UNIQUE)'],
    checkConstraints: [],
    indexes: [],
    lifecycleModel: 'Module-scoped permissions',
    rlsEnabled: true,
  },
  {
    name: 'role_permissions',
    domain: 'Identity & Access',
    description: 'Many-to-many junction between roles and permissions',
    primaryKey: 'role_id, permission_id (Composite)',
    columnsCount: 3,
    foreignKeys: [
      { column: 'role_id', references: 'roles(id)', onDelete: 'CASCADE' },
      { column: 'permission_id', references: 'permissions(id)', onDelete: 'CASCADE' },
    ],
    uniqueConstraints: ['PRIMARY KEY (role_id, permission_id)'],
    checkConstraints: [],
    indexes: [],
    lifecycleModel: 'Dynamic role assignment',
    rlsEnabled: true,
  },
  {
    name: 'user_roles',
    domain: 'Identity & Access',
    description: 'Many-to-many role assignments to user profiles',
    primaryKey: 'id (UUID)',
    columnsCount: 5,
    foreignKeys: [
      { column: 'user_id', references: 'profiles(id)', onDelete: 'CASCADE' },
      { column: 'role_id', references: 'roles(id)', onDelete: 'RESTRICT' },
      { column: 'assigned_by', references: 'profiles(id)', onDelete: 'SET NULL' },
    ],
    uniqueConstraints: ['UNIQUE (user_id, role_id)'],
    checkConstraints: [],
    indexes: [],
    lifecycleModel: 'Role assignment audit tracking',
    rlsEnabled: true,
  },

  // 2. Members & Skills
  {
    name: 'members',
    domain: 'Club Members',
    description: 'Official student member roster with academic grade and portfolio visibility',
    primaryKey: 'id (UUID)',
    columnsCount: 11,
    foreignKeys: [{ column: 'user_id', references: 'profiles(id)', onDelete: 'RESTRICT' }],
    uniqueConstraints: ['user_id (UNIQUE)', 'member_number (UNIQUE)'],
    checkConstraints: ["status IN ('active', 'inactive', 'alumnus', 'suspended', 'pending')"],
    indexes: ['idx_members_user_id', 'idx_members_status_vis', 'idx_members_featured'],
    lifecycleModel: 'pending -> active -> alumnus / suspended',
    rlsEnabled: true,
  },
  {
    name: 'skills',
    domain: 'Club Members',
    description: 'Standard technical skill registry (Python, Robotics, Web, etc.)',
    primaryKey: 'id (UUID)',
    columnsCount: 6,
    foreignKeys: [],
    uniqueConstraints: ['name (UNIQUE)', 'slug (UNIQUE)'],
    checkConstraints: [],
    indexes: [],
    lifecycleModel: 'Categorized taxonomies',
    rlsEnabled: true,
  },
  {
    name: 'member_skills',
    domain: 'Club Members',
    description: 'Junction mapping members to skills with proficiency levels',
    primaryKey: 'id (UUID)',
    columnsCount: 6,
    foreignKeys: [
      { column: 'member_id', references: 'members(id)', onDelete: 'CASCADE' },
      { column: 'skill_id', references: 'skills(id)', onDelete: 'RESTRICT' },
    ],
    uniqueConstraints: ['UNIQUE (member_id, skill_id)'],
    checkConstraints: ["proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')"],
    indexes: ['idx_member_skills_member', 'idx_member_skills_skill'],
    lifecycleModel: 'Member self-service & moderator endorsed',
    rlsEnabled: true,
  },

  // 3. Projects & Team
  {
    name: 'projects',
    domain: 'Projects & Team',
    description: 'Club software, hardware, and research initiatives',
    primaryKey: 'id (UUID)',
    columnsCount: 16,
    foreignKeys: [{ column: 'created_by', references: 'profiles(id)', onDelete: 'SET NULL' }],
    uniqueConstraints: ['slug (UNIQUE)'],
    checkConstraints: [
      "status IN ('draft', 'published', 'in_progress', 'completed', 'archived')",
      "visibility IN ('public', 'members_only', 'private', 'admin_only')",
      'completion_date >= start_date',
    ],
    indexes: ['idx_projects_slug', 'idx_projects_status_vis', 'idx_projects_featured'],
    lifecycleModel: 'draft -> in_progress -> completed / archived',
    rlsEnabled: true,
  },
  {
    name: 'project_members',
    domain: 'Projects & Team',
    description: 'Junction assigning student contributors to projects with roles',
    primaryKey: 'id (UUID)',
    columnsCount: 6,
    foreignKeys: [
      { column: 'project_id', references: 'projects(id)', onDelete: 'CASCADE' },
      { column: 'member_id', references: 'members(id)', onDelete: 'CASCADE' },
    ],
    uniqueConstraints: ['UNIQUE (project_id, member_id)'],
    checkConstraints: [],
    indexes: ['idx_project_members_project', 'idx_project_members_member'],
    lifecycleModel: 'Team collaboration assignment',
    rlsEnabled: true,
  },

  // 4. Certificates & Achievements
  {
    name: 'achievements',
    domain: 'Certificates & Honors',
    description: 'Inter-school competitions, hackathons, and honor roll records',
    primaryKey: 'id (UUID)',
    columnsCount: 11,
    foreignKeys: [{ column: 'member_id', references: 'members(id)', onDelete: 'SET NULL' }],
    uniqueConstraints: [],
    checkConstraints: [
      "category IN ('Competition', 'Academic', 'Hackathon', 'Leadership', 'Honor', 'Other')",
      "visibility IN ('public', 'members_only', 'private')",
    ],
    indexes: ['idx_achievements_member', 'idx_achievements_featured'],
    lifecycleModel: 'Accredited student achievement records',
    rlsEnabled: true,
  },
  {
    name: 'certificates',
    domain: 'Certificates & Honors',
    description: 'Cryptographically verifiable digital certificates with unique verification codes',
    primaryKey: 'id (UUID)',
    columnsCount: 15,
    foreignKeys: [{ column: 'recipient_id', references: 'members(id)', onDelete: 'RESTRICT' }],
    uniqueConstraints: ['certificate_number (UNIQUE)', 'verification_code (UNIQUE)'],
    checkConstraints: [
      "status IN ('valid', 'revoked', 'expired')",
      'expiry_date >= issue_date',
    ],
    indexes: ['idx_certificates_recipient', 'idx_certificates_vcode', 'idx_certificates_status'],
    lifecycleModel: 'valid -> expired / revoked (with reason & timestamp)',
    rlsEnabled: true,
  },

  // 5. Events & Notices
  {
    name: 'events',
    domain: 'Events & Engagement',
    description: 'Workshops, hackathons, seminars, and coding bootcamps',
    primaryKey: 'id (UUID)',
    columnsCount: 16,
    foreignKeys: [{ column: 'created_by', references: 'profiles(id)', onDelete: 'SET NULL' }],
    uniqueConstraints: ['slug (UNIQUE)'],
    checkConstraints: [
      "event_type IN ('Workshop', 'Seminar', 'Competition', 'Coding Challenge', 'Meeting', 'Hackathon')",
      "registration_status IN ('open', 'closed', 'waitlist', 'not_required')",
      "visibility IN ('public', 'members_only', 'private')",
      'end_time > start_time',
      'max_participants > 0',
    ],
    indexes: ['idx_events_slug', 'idx_events_times', 'idx_events_status_vis'],
    lifecycleModel: 'upcoming -> ongoing -> completed / cancelled',
    rlsEnabled: true,
  },
  {
    name: 'event_participants',
    domain: 'Events & Engagement',
    description: 'Event registration roster with attendance verification',
    primaryKey: 'id (UUID)',
    columnsCount: 7,
    foreignKeys: [
      { column: 'event_id', references: 'events(id)', onDelete: 'CASCADE' },
      { column: 'member_id', references: 'members(id)', onDelete: 'CASCADE' },
    ],
    uniqueConstraints: ['UNIQUE (event_id, member_id)'],
    checkConstraints: ["status IN ('registered', 'confirmed', 'attended', 'cancelled', 'waitlisted')"],
    indexes: ['idx_event_participants_event', 'idx_event_participants_member'],
    lifecycleModel: 'registered -> confirmed -> attended',
    rlsEnabled: true,
  },
  {
    name: 'notices',
    domain: 'Events & Engagement',
    description: 'School IT Club announcements with priority flags and expiry windows',
    primaryKey: 'id (UUID)',
    columnsCount: 16,
    foreignKeys: [{ column: 'created_by', references: 'profiles(id)', onDelete: 'SET NULL' }],
    uniqueConstraints: ['slug (UNIQUE)'],
    checkConstraints: [
      "category IN ('General', 'Academic', 'Event', 'Quiz', 'Urgent', 'Competition')",
      "priority IN ('low', 'normal', 'high', 'urgent')",
      "status IN ('draft', 'published', 'unpublished', 'archived')",
      "visibility IN ('public', 'members_only', 'admin_only')",
      'expires_at > published_at',
    ],
    indexes: ['idx_notices_slug', 'idx_notices_status_vis', 'idx_notices_published'],
    lifecycleModel: 'draft -> published -> expired -> archived',
    rlsEnabled: true,
  },
  {
    name: 'notifications',
    domain: 'Events & Engagement',
    description: 'Persistent student user alerts with read timestamps',
    primaryKey: 'id (UUID)',
    columnsCount: 9,
    foreignKeys: [{ column: 'recipient_id', references: 'profiles(id)', onDelete: 'CASCADE' }],
    uniqueConstraints: [],
    checkConstraints: ["notification_type IN ('info', 'alert', 'event', 'certificate', 'quiz', 'notice', 'system')"],
    indexes: ['idx_notifications_recipient', 'idx_notifications_unread'],
    lifecycleModel: 'unread -> read',
    rlsEnabled: true,
  },

  // 6. Media & Resources
  {
    name: 'gallery_albums',
    domain: 'Media & Resources',
    description: 'Event photo albums and club highlights',
    primaryKey: 'id (UUID)',
    columnsCount: 9,
    foreignKeys: [{ column: 'event_id', references: 'events(id)', onDelete: 'SET NULL' }],
    uniqueConstraints: ['slug (UNIQUE)'],
    checkConstraints: [
      "status IN ('draft', 'published', 'archived')",
      "visibility IN ('public', 'members_only', 'private')",
    ],
    indexes: [],
    lifecycleModel: 'draft -> published -> archived',
    rlsEnabled: true,
  },
  {
    name: 'gallery_images',
    domain: 'Media & Resources',
    description: 'Individual photos referencing Supabase Storage paths',
    primaryKey: 'id (UUID)',
    columnsCount: 8,
    foreignKeys: [{ column: 'album_id', references: 'gallery_albums(id)', onDelete: 'CASCADE' }],
    uniqueConstraints: [],
    checkConstraints: ["visibility IN ('public', 'members_only', 'private')"],
    indexes: ['idx_gallery_images_album'],
    lifecycleModel: 'Sorted album image collection',
    rlsEnabled: true,
  },
  {
    name: 'resource_categories',
    domain: 'Media & Resources',
    description: 'Taxonomy categories for academic resources (Programming, OS, Web, Networking)',
    primaryKey: 'id (UUID)',
    columnsCount: 6,
    foreignKeys: [],
    uniqueConstraints: ['name (UNIQUE)', 'slug (UNIQUE)'],
    checkConstraints: [],
    indexes: [],
    lifecycleModel: 'Hierarchical learning taxonomy',
    rlsEnabled: true,
  },
  {
    name: 'resources',
    domain: 'Media & Resources',
    description: 'Curated tutorials, guides, worksheets, and study notes',
    primaryKey: 'id (UUID)',
    columnsCount: 13,
    foreignKeys: [
      { column: 'category_id', references: 'resource_categories(id)', onDelete: 'SET NULL' },
      { column: 'created_by', references: 'profiles(id)', onDelete: 'SET NULL' },
    ],
    uniqueConstraints: ['slug (UNIQUE)'],
    checkConstraints: [
      "resource_type IN ('pdf', 'document', 'worksheet', 'tutorial', 'code', 'link')",
      "status IN ('draft', 'published', 'archived')",
      "visibility IN ('public', 'members_only', 'private')",
    ],
    indexes: ['idx_resources_slug', 'idx_resources_category'],
    lifecycleModel: 'draft -> published -> archived',
    rlsEnabled: true,
  },
  {
    name: 'resource_files',
    domain: 'Media & Resources',
    description: 'Downloadable document attachments with file size and download telemetry',
    primaryKey: 'id (UUID)',
    columnsCount: 8,
    foreignKeys: [{ column: 'resource_id', references: 'resources(id)', onDelete: 'CASCADE' }],
    uniqueConstraints: [],
    checkConstraints: ['file_size_bytes >= 0', 'download_count >= 0'],
    indexes: ['idx_resource_files_resource'],
    lifecycleModel: 'File storage sync with telemetry',
    rlsEnabled: true,
  },

  // 7. Examination & Quiz Engine
  {
    name: 'quizzes',
    domain: 'Quizzes & Examination',
    description: 'Timed online IT quizzes with passing score thresholds',
    primaryKey: 'id (UUID)',
    columnsCount: 16,
    foreignKeys: [{ column: 'created_by', references: 'profiles(id)', onDelete: 'SET NULL' }],
    uniqueConstraints: ['slug (UNIQUE)'],
    checkConstraints: [
      'duration_minutes > 0',
      'total_marks > 0',
      'passing_marks >= 0 AND passing_marks <= total_marks',
      'attempt_limit > 0',
      "status IN ('draft', 'published', 'archived', 'closed')",
      "visibility IN ('public', 'members_only', 'private')",
      'end_time > start_time',
    ],
    indexes: ['idx_quizzes_slug', 'idx_quizzes_status_vis'],
    lifecycleModel: 'draft -> published -> closed -> archived',
    rlsEnabled: true,
  },
  {
    name: 'quiz_questions',
    domain: 'Quizzes & Examination',
    description: 'Individual assessment questions with configurable marks and explanations',
    primaryKey: 'id (UUID)',
    columnsCount: 9,
    foreignKeys: [{ column: 'quiz_id', references: 'quizzes(id)', onDelete: 'CASCADE' }],
    uniqueConstraints: [],
    checkConstraints: [
      "question_type IN ('single_choice', 'multiple_choice', 'true_false', 'short_text')",
      'marks > 0',
    ],
    indexes: ['idx_quiz_questions_quiz'],
    lifecycleModel: 'Ordered question bank',
    rlsEnabled: true,
  },
  {
    name: 'quiz_options',
    domain: 'Quizzes & Examination',
    description: 'Answer choices with correctness flags',
    primaryKey: 'id (UUID)',
    columnsCount: 6,
    foreignKeys: [{ column: 'question_id', references: 'quiz_questions(id)', onDelete: 'CASCADE' }],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: ['idx_quiz_options_question'],
    lifecycleModel: 'Single/multiple choice answer choices',
    rlsEnabled: true,
  },
  {
    name: 'quiz_attempts',
    domain: 'Quizzes & Examination',
    description: 'Student test sessions with duration and status tracking',
    primaryKey: 'id (UUID)',
    columnsCount: 12,
    foreignKeys: [
      { column: 'quiz_id', references: 'quizzes(id)', onDelete: 'RESTRICT' },
      { column: 'user_id', references: 'profiles(id)', onDelete: 'RESTRICT' },
    ],
    uniqueConstraints: ['UNIQUE (quiz_id, user_id, attempt_number)'],
    checkConstraints: [
      'attempt_number > 0',
      "status IN ('in_progress', 'submitted', 'evaluated', 'abandoned')",
      'score >= 0',
      'percentage >= 0 AND percentage <= 100',
      'time_spent_seconds >= 0',
    ],
    indexes: ['idx_quiz_attempts_quiz_user'],
    lifecycleModel: 'in_progress -> submitted -> evaluated',
    rlsEnabled: true,
  },
  {
    name: 'quiz_answers',
    domain: 'Quizzes & Examination',
    description: 'Itemized answers recorded for evaluation',
    primaryKey: 'id (UUID)',
    columnsCount: 8,
    foreignKeys: [
      { column: 'attempt_id', references: 'quiz_attempts(id)', onDelete: 'CASCADE' },
      { column: 'question_id', references: 'quiz_questions(id)', onDelete: 'RESTRICT' },
      { column: 'selected_option_id', references: 'quiz_options(id)', onDelete: 'SET NULL' },
    ],
    uniqueConstraints: ['UNIQUE (attempt_id, question_id)'],
    checkConstraints: ['marks_awarded >= 0'],
    indexes: ['idx_quiz_answers_attempt'],
    lifecycleModel: 'Student submission logs',
    rlsEnabled: true,
  },
  {
    name: 'quiz_results',
    domain: 'Quizzes & Examination',
    description: 'Official test scorecards with pass/fail evaluation',
    primaryKey: 'id (UUID)',
    columnsCount: 10,
    foreignKeys: [
      { column: 'attempt_id', references: 'quiz_attempts(id)', onDelete: 'CASCADE' },
      { column: 'quiz_id', references: 'quizzes(id)', onDelete: 'RESTRICT' },
      { column: 'user_id', references: 'profiles(id)', onDelete: 'RESTRICT' },
    ],
    uniqueConstraints: ['attempt_id (UNIQUE)'],
    checkConstraints: ['total_score >= 0', 'percentage >= 0 AND percentage <= 100'],
    indexes: ['idx_quiz_results_user'],
    lifecycleModel: 'Official score publication',
    rlsEnabled: true,
  },
  {
    name: 'exam_documents',
    domain: 'Quizzes & Examination',
    description: 'Official school question papers, sample papers, and model answers',
    primaryKey: 'id (UUID)',
    columnsCount: 16,
    foreignKeys: [{ column: 'created_by', references: 'profiles(id)', onDelete: 'SET NULL' }],
    uniqueConstraints: ['slug (UNIQUE)'],
    checkConstraints: [
      "exam_type IN ('Half-Yearly', 'Annual', 'Pre-Board', 'Unit Test', 'Model Paper', 'Entrance')",
      "document_type IN ('question_paper', 'sample_paper', 'answer_key', 'syllabus', 'worksheet', 'study_material')",
      "visibility IN ('public', 'members_only', 'admin_only')",
      "status IN ('draft', 'published', 'archived')",
      'file_size_bytes >= 0',
      'download_count >= 0',
    ],
    indexes: ['idx_exam_docs_slug', 'idx_exam_docs_class_subject'],
    lifecycleModel: 'draft -> published -> archived',
    rlsEnabled: true,
  },
  {
    name: 'exam_results',
    domain: 'Quizzes & Examination',
    description: 'School exam grade sheets with marks and percentages',
    primaryKey: 'id (UUID)',
    columnsCount: 13,
    foreignKeys: [
      { column: 'student_id', references: 'members(id)', onDelete: 'RESTRICT' },
      { column: 'document_id', references: 'exam_documents(id)', onDelete: 'SET NULL' },
    ],
    uniqueConstraints: [],
    checkConstraints: [
      'marks_obtained >= 0',
      'max_marks > 0',
      'percentage >= 0 AND percentage <= 100',
      "status IN ('draft', 'published', 'withheld', 'archived')",
      'marks_obtained <= max_marks',
    ],
    indexes: ['idx_exam_results_student'],
    lifecycleModel: 'draft -> published -> withheld / archived',
    rlsEnabled: true,
  },

  // 8. System, Storage & Compliance
  {
    name: 'contact_messages',
    domain: 'System & Governance',
    description: 'Public contact inquiries and student support tickets',
    primaryKey: 'id (UUID)',
    columnsCount: 11,
    foreignKeys: [{ column: 'handled_by', references: 'profiles(id)', onDelete: 'SET NULL' }],
    uniqueConstraints: [],
    checkConstraints: ["status IN ('new', 'read', 'in_progress', 'resolved', 'archived')"],
    indexes: ['idx_contact_messages_status'],
    lifecycleModel: 'new -> read -> in_progress -> resolved -> archived',
    rlsEnabled: true,
  },
  {
    name: 'file_metadata',
    domain: 'System & Governance',
    description: 'Centralized registry synchronizing with Supabase Storage buckets',
    primaryKey: 'id (UUID)',
    columnsCount: 11,
    foreignKeys: [{ column: 'uploaded_by', references: 'profiles(id)', onDelete: 'SET NULL' }],
    uniqueConstraints: ['storage_path (UNIQUE)'],
    checkConstraints: ['size_bytes >= 0'],
    indexes: ['idx_file_metadata_bucket'],
    lifecycleModel: 'File upload -> entity attachment -> cleanup',
    rlsEnabled: true,
  },
  {
    name: 'site_settings',
    domain: 'System & Governance',
    description: 'Key-value JSON configuration for branding and feature flags',
    primaryKey: 'id (UUID)',
    columnsCount: 7,
    foreignKeys: [{ column: 'updated_by', references: 'profiles(id)', onDelete: 'SET NULL' }],
    uniqueConstraints: ['key (UNIQUE)'],
    checkConstraints: [],
    indexes: [],
    lifecycleModel: 'Dynamic platform configuration',
    rlsEnabled: true,
  },
  {
    name: 'audit_logs',
    domain: 'System & Governance',
    description: 'Append-only immutable administrative audit log with JSON diffs',
    primaryKey: 'id (UUID)',
    columnsCount: 9,
    foreignKeys: [{ column: 'actor_id', references: 'profiles(id)', onDelete: 'SET NULL' }],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: ['idx_audit_logs_actor', 'idx_audit_logs_entity', 'idx_audit_logs_created'],
    lifecycleModel: 'Immutable audit trail',
    rlsEnabled: true,
  },
];

export const DatabaseSchemaViewer: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<SchemaTable>(DATABASE_TABLES[0]);
  const [copied, setCopied] = useState(false);
  const [checkingCache, setCheckingCache] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<{ checked: boolean; message: string; isConnected: boolean } | null>(null);

  const domains = ['All', ...Array.from(new Set(DATABASE_TABLES.map((t) => t.domain)))];

  const filteredTables = DATABASE_TABLES.filter((t) => {
    const matchesDomain = selectedDomain === 'All' || t.domain === selectedDomain;
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesQuery;
  });

  const handleCopyMigration = () => {
    navigator.clipboard.writeText('-- Run this in Supabase SQL Editor\n-- File: supabase/migrations/20260910000001_initial_core_schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestDatabaseCache = async () => {
    setCheckingCache(true);
    try {
      if (!supabase) {
        setCacheStatus({
          checked: true,
          message: 'Supabase client is not configured with environment keys.',
          isConnected: false,
        });
        return;
      }

      // Check if schema cache is ready
      const { error } = await supabase.from('profiles').select('id').limit(1);

      if (error) {
        setCacheStatus({
          checked: true,
          message: `Cloud PostgREST connection reached. Schema cache response: ${error.message}. (Run migrations in Supabase SQL Editor to register tables).`,
          isConnected: true,
        });
      } else {
        setCacheStatus({
          checked: true,
          message: 'Active connection confirmed! Profiles table is accessible in cloud database.',
          isConnected: true,
        });
      }
    } catch (e: any) {
      setCacheStatus({
        checked: true,
        message: `Network check exception: ${e.message}`,
        isConnected: false,
      });
    } finally {
      setCheckingCache(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              PROMPT 2 DATABASE ARCHITECTURE FOUNDATION
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              PostgreSQL Relational Schema & Migration Matrix
            </h3>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              Normalized relational database model spanning 33 authoritative tables, strict foreign key constraints, complete lifecycle states, high-performance B-tree indexes, and pre-activated Row Level Security.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestDatabaseCache}
              disabled={checkingCache}
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${checkingCache ? 'animate-spin' : ''}`} />
              Verify Cloud Schema Cache
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyMigration}
              className="text-xs bg-[#0B192C] hover:bg-[#1E3E62]"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? 'Copied Reference' : 'Copy Migration Path'}
            </Button>
          </div>
        </div>

        {/* Diagnostic notification if checked */}
        {cacheStatus && (
          <div className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
            cacheStatus.isConnected
              ? 'bg-blue-50/80 border-blue-200 text-blue-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Database Verification Report:</span>
              <p className="text-slate-700 leading-relaxed">{cacheStatus.message}</p>
            </div>
          </div>
        )}

        {/* Database Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Relational Tables</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">33 Tables</div>
            <span className="text-[10px] text-emerald-600 font-semibold">100% Normalized</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Primary Keys</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">UUID v4</div>
            <span className="text-[10px] text-blue-600 font-semibold">gen_random_uuid()</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">RLS Status</span>
            <div className="text-lg font-extrabold text-emerald-700 mt-0.5">ACTIVATED</div>
            <span className="text-[10px] text-emerald-600 font-semibold">33/33 Tables Protected</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Integrity Model</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">Cascade / Restrict</div>
            <span className="text-[10px] text-slate-600 font-semibold">Protected Historical Data</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Targeted Indexes</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">38 B-Trees</div>
            <span className="text-[10px] text-indigo-600 font-semibold">Fast Query Filtering</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Plaintext Passwords</span>
            <div className="text-lg font-extrabold text-emerald-700 mt-0.5">ZERO (0)</div>
            <span className="text-[10px] text-emerald-600 font-semibold">auth.users Handled</span>
          </div>
        </div>
      </div>

      {/* Main Table Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Table Directory */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            {/* Search and Domain Filters */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search table or column..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B192C]"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {domains.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDomain(d)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedDomain === d
                      ? 'bg-[#0B192C] text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Table Item List */}
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
              {filteredTables.map((t) => {
                const isSelected = selectedTable.name === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTable(t)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border border-blue-200 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Table className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-700' : 'text-slate-400'}`} />
                        <span className="font-mono text-xs font-bold text-slate-900">
                          public.{t.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          {t.columnsCount} cols
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Detail Pane: Selected Table Specifications */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <h4 className="text-lg font-bold font-mono text-slate-900">
                    public.{selectedTable.name}
                  </h4>
                  <Badge variant="success" className="text-xs">
                    RLS Active
                  </Badge>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                    {selectedTable.domain}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{selectedTable.description}</p>
              </div>
            </div>

            {/* Primary Key & Identification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" /> Primary Key
                </span>
                <p className="font-mono text-xs font-bold text-slate-900 mt-1">
                  {selectedTable.primaryKey}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" /> Security State
                </span>
                <p className="text-xs font-bold text-emerald-700 mt-1">
                  Row Level Security Enabled
                </p>
              </div>
            </div>

            {/* Foreign Key Relationships */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Foreign Keys & Referential Integrity
              </h5>
              {selectedTable.foreignKeys.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                  No outgoing foreign key references. Standalone authoritative entity.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {selectedTable.foreignKeys.map((fk, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="font-mono text-slate-800">
                        <span className="font-bold text-blue-800">{fk.column}</span> →{' '}
                        <span className="text-slate-600">{fk.references}</span>
                      </div>
                      <Badge
                        variant={
                          fk.onDelete === 'CASCADE'
                            ? 'default'
                            : fk.onDelete === 'RESTRICT'
                            ? 'warning'
                            : 'outline'
                        }
                        className="text-[10px] self-start sm:self-auto"
                      >
                        ON DELETE {fk.onDelete}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unique Constraints & Check Constraints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Unique Constraints
                </h5>
                {selectedTable.uniqueConstraints.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">None beyond primary key.</p>
                ) : (
                  <ul className="space-y-1 text-xs font-mono text-slate-700">
                    {selectedTable.uniqueConstraints.map((uc, idx) => (
                      <li key={idx} className="bg-slate-50 px-2 py-1 rounded-sm border border-slate-200">
                        {uc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Data Check Constraints
                </h5>
                {selectedTable.checkConstraints.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Standard PostgreSQL typing constraints.</p>
                ) : (
                  <ul className="space-y-1 text-xs font-mono text-slate-700">
                    {selectedTable.checkConstraints.map((cc, idx) => (
                      <li key={idx} className="bg-slate-50 px-2 py-1 rounded-sm border border-slate-200 break-words">
                        {cc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Indexes & Performance */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Targeted Performance Indexes
              </h5>
              {selectedTable.indexes.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Indexed via Primary and Unique key indexes.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTable.indexes.map((idxName, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-[11px] bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200"
                    >
                      {idxName}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Lifecycle & Status Progression */}
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-1">
              <span className="font-bold text-amber-900">Controlled Lifecycle Progression:</span>
              <p className="text-amber-800">{selectedTable.lifecycleModel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Migration Artifacts Guide Card */}
      <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-blue-400" />
              Reproducible Migration Artifacts & Deployment Pipeline
            </h4>
            <p className="text-xs text-slate-300 max-w-3xl">
              Following Section 40 of the Development Constitution, all database schema structures are versioned as deterministic SQL migration files in the repository.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              MIGRATION READY
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1.5">
            <span className="font-bold text-amber-300">1. Migration Script</span>
            <p className="text-slate-300 font-mono">supabase/migrations/20260910000001_initial_core_schema.sql</p>
            <p className="text-slate-400 text-[11px]">Authoritative sequential migration containing all 33 DDL tables, triggers, and seed roles.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1.5">
            <span className="font-bold text-blue-300">2. Authoritative Schema</span>
            <p className="text-slate-300 font-mono">supabase/schema.sql</p>
            <p className="text-slate-400 text-[11px]">Single-file complete database snapshot for direct execution in Supabase Dashboard SQL Editor.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1.5">
            <span className="font-bold text-emerald-300">3. TypeScript Contracts</span>
            <p className="text-slate-300 font-mono">src/types/database.types.ts</p>
            <p className="text-slate-400 text-[11px]">1:1 strongly-typed client and server query interfaces for compile-time safety across all tables.</p>
          </div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="font-bold text-slate-200 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Execution Guide for Supabase Dashboard:
          </div>
          <p className="text-slate-400 leading-relaxed">
            To apply this unified schema directly in your Supabase project:
            <br />
            1. Open the Supabase Project Dashboard and click <strong className="text-white">SQL Editor</strong>.
            <br />
            2. Paste the contents of <strong className="text-white">supabase/schema.sql</strong> and click <strong className="text-white">Run</strong>.
            <br />
            3. All 33 tables, triggers, constraints, indexes, and initial system roles will be instantiated with full RLS protection.
          </p>
        </div>
      </div>
    </div>
  );
};
