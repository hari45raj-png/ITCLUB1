/**
 * ST. MARY'S ENGLISH SCHOOL — IT CLUB FULL-STACK PLATFORM
 * Supabase Database TypeScript Schema Definitions
 * 
 * Auto-compatible with @supabase/supabase-js createClient<Database>()
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          public_contact: string | null;
          status: 'active' | 'inactive' | 'suspended' | 'pending';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          public_contact?: string | null;
          status?: 'active' | 'inactive' | 'suspended' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          public_contact?: string | null;
          status?: 'active' | 'inactive' | 'suspended' | 'pending';
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
        };
      };
      permissions: {
        Row: {
          id: string;
          code: string;
          module: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          module: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          module?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          assigned_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          assigned_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          assigned_by?: string | null;
          created_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          user_id: string;
          member_number: string | null;
          slug: string | null;
          designation_id: string | null;
          class_grade: string | null;
          section: string | null;
          joining_date: string;
          status: 'active' | 'inactive' | 'alumnus' | 'suspended' | 'pending';
          public_visibility: boolean;
          portfolio_visibility: boolean;
          is_featured: boolean;
          portfolio_bio: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          website_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          member_number?: string | null;
          slug?: string | null;
          designation_id?: string | null;
          class_grade?: string | null;
          section?: string | null;
          joining_date?: string;
          status?: 'active' | 'inactive' | 'alumnus' | 'suspended' | 'pending';
          public_visibility?: boolean;
          portfolio_visibility?: boolean;
          is_featured?: boolean;
          portfolio_bio?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          member_number?: string | null;
          slug?: string | null;
          designation_id?: string | null;
          class_grade?: string | null;
          section?: string | null;
          joining_date?: string;
          status?: 'active' | 'inactive' | 'alumnus' | 'suspended' | 'pending';
          public_visibility?: boolean;
          portfolio_visibility?: boolean;
          is_featured?: boolean;
          portfolio_bio?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      member_skills: {
        Row: {
          id: string;
          member_id: string;
          skill_id: string;
          proficiency_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          skill_id: string;
          proficiency_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          skill_id?: string;
          proficiency_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
          sort_order?: number;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          short_description: string;
          full_description: string | null;
          status: 'draft' | 'published' | 'in_progress' | 'completed' | 'archived';
          visibility: 'public' | 'members_only' | 'private' | 'admin_only';
          is_featured: boolean;
          thumbnail_url: string | null;
          repo_url: string | null;
          live_url: string | null;
          start_date: string | null;
          completion_date: string | null;
          created_by: string | null;
          published_at: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          short_description: string;
          full_description?: string | null;
          status?: 'draft' | 'published' | 'in_progress' | 'completed' | 'archived';
          visibility?: 'public' | 'members_only' | 'private' | 'admin_only';
          is_featured?: boolean;
          thumbnail_url?: string | null;
          repo_url?: string | null;
          live_url?: string | null;
          start_date?: string | null;
          completion_date?: string | null;
          created_by?: string | null;
          published_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          short_description?: string;
          full_description?: string | null;
          status?: 'draft' | 'published' | 'in_progress' | 'completed' | 'archived';
          visibility?: 'public' | 'members_only' | 'private' | 'admin_only';
          is_featured?: boolean;
          thumbnail_url?: string | null;
          repo_url?: string | null;
          live_url?: string | null;
          start_date?: string | null;
          completion_date?: string | null;
          created_by?: string | null;
          published_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          member_id: string;
          role_in_project: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          member_id: string;
          role_in_project?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          member_id?: string;
          role_in_project?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          member_id: string | null;
          title: string;
          description: string;
          category: 'Competition' | 'Academic' | 'Hackathon' | 'Leadership' | 'Honor' | 'Other';
          issuer: string;
          achievement_date: string;
          proof_url: string | null;
          visibility: 'public' | 'members_only' | 'private';
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id?: string | null;
          title: string;
          description: string;
          category?: 'Competition' | 'Academic' | 'Hackathon' | 'Leadership' | 'Honor' | 'Other';
          issuer: string;
          achievement_date?: string;
          proof_url?: string | null;
          visibility?: 'public' | 'members_only' | 'private';
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string | null;
          title?: string;
          description?: string;
          category?: 'Competition' | 'Academic' | 'Hackathon' | 'Leadership' | 'Honor' | 'Other';
          issuer?: string;
          achievement_date?: string;
          proof_url?: string | null;
          visibility?: 'public' | 'members_only' | 'private';
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          recipient_id: string | null;
          title: string;
          description: string | null;
          issue_date: string;
          expiry_date: string | null;
          certificate_number: string;
          verification_code: string;
          status: 'valid' | 'revoked' | 'expired';
          file_url: string | null;
          issuer_name: string;
          metadata: Json;
          revoked_at: string | null;
          revocation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipient_id?: string | null;
          title: string;
          description?: string | null;
          issue_date?: string;
          expiry_date?: string | null;
          certificate_number: string;
          verification_code: string;
          status?: 'valid' | 'revoked' | 'expired';
          file_url?: string | null;
          issuer_name?: string;
          metadata?: Json;
          revoked_at?: string | null;
          revocation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string | null;
          title?: string;
          description?: string | null;
          issue_date?: string;
          expiry_date?: string | null;
          certificate_number?: string;
          verification_code?: string;
          status?: 'valid' | 'revoked' | 'expired';
          file_url?: string | null;
          issuer_name?: string;
          metadata?: Json;
          revoked_at?: string | null;
          revocation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          event_type: 'Workshop' | 'Seminar' | 'Competition' | 'Coding Challenge' | 'Meeting' | 'Hackathon';
          location: string;
          start_time: string;
          end_time: string;
          registration_status: 'open' | 'closed' | 'waitlist' | 'not_required';
          visibility: 'public' | 'members_only' | 'private';
          is_featured: boolean;
          cover_image_url: string | null;
          max_participants: number | null;
          created_by: string | null;
          published_at: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          event_type?: 'Workshop' | 'Seminar' | 'Competition' | 'Coding Challenge' | 'Meeting' | 'Hackathon';
          location?: string;
          start_time: string;
          end_time: string;
          registration_status?: 'open' | 'closed' | 'waitlist' | 'not_required';
          visibility?: 'public' | 'members_only' | 'private';
          is_featured?: boolean;
          cover_image_url?: string | null;
          max_participants?: number | null;
          created_by?: string | null;
          published_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          event_type?: 'Workshop' | 'Seminar' | 'Competition' | 'Coding Challenge' | 'Meeting' | 'Hackathon';
          location?: string;
          start_time?: string;
          end_time?: string;
          registration_status?: 'open' | 'closed' | 'waitlist' | 'not_required';
          visibility?: 'public' | 'members_only' | 'private';
          is_featured?: boolean;
          cover_image_url?: string | null;
          max_participants?: number | null;
          created_by?: string | null;
          published_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string;
          member_id: string;
          status: 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'waitlisted';
          attended: boolean;
          registered_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          member_id: string;
          status?: 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'waitlisted';
          attended?: boolean;
          registered_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          member_id?: string;
          status?: 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'waitlisted';
          attended?: boolean;
          registered_at?: string;
          updated_at?: string;
        };
      };
      notices: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          summary: string | null;
          category: 'General' | 'Academic' | 'Event' | 'Quiz' | 'Urgent' | 'Competition';
          priority: 'low' | 'normal' | 'high' | 'urgent';
          status: 'draft' | 'published' | 'unpublished' | 'archived';
          visibility: 'public' | 'members_only' | 'admin_only';
          is_featured: boolean;
          is_popup: boolean;
          created_by: string | null;
          published_at: string | null;
          expires_at: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          summary?: string | null;
          category?: 'General' | 'Academic' | 'Event' | 'Quiz' | 'Urgent' | 'Competition';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          status?: 'draft' | 'published' | 'unpublished' | 'archived';
          visibility?: 'public' | 'members_only' | 'admin_only';
          is_featured?: boolean;
          is_popup?: boolean;
          created_by?: string | null;
          published_at?: string | null;
          expires_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          summary?: string | null;
          category?: 'General' | 'Academic' | 'Event' | 'Quiz' | 'Urgent' | 'Competition';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          status?: 'draft' | 'published' | 'unpublished' | 'archived';
          visibility?: 'public' | 'members_only' | 'admin_only';
          is_featured?: boolean;
          is_popup?: boolean;
          created_by?: string | null;
          published_at?: string | null;
          expires_at?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          notification_type: 'info' | 'alert' | 'event' | 'certificate' | 'quiz' | 'notice' | 'system';
          title: string;
          message: string;
          related_entity_type: string | null;
          related_entity_id: string | null;
          read_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          notification_type?: 'info' | 'alert' | 'event' | 'certificate' | 'quiz' | 'notice' | 'system';
          title: string;
          message: string;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          read_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          notification_type?: 'info' | 'alert' | 'event' | 'certificate' | 'quiz' | 'notice' | 'system';
          title?: string;
          message?: string;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          read_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      gallery_albums: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          cover_image_url: string | null;
          event_id: string | null;
          visibility: 'public' | 'members_only' | 'private';
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          cover_image_url?: string | null;
          event_id?: string | null;
          visibility?: 'public' | 'members_only' | 'private';
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          cover_image_url?: string | null;
          event_id?: string | null;
          visibility?: 'public' | 'members_only' | 'private';
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      gallery_images: {
        Row: {
          id: string;
          album_id: string;
          storage_path: string;
          caption: string | null;
          alt_text: string | null;
          sort_order: number;
          visibility: 'public' | 'members_only' | 'private';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          storage_path: string;
          caption?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          visibility?: 'public' | 'members_only' | 'private';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          storage_path?: string;
          caption?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          visibility?: 'public' | 'members_only' | 'private';
          created_at?: string;
          updated_at?: string;
        };
      };
      resource_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          category_id: string | null;
          title: string;
          slug: string;
          description: string | null;
          resource_type: 'pdf' | 'document' | 'worksheet' | 'tutorial' | 'code' | 'link';
          subject: string;
          class_level: string | null;
          visibility: 'public' | 'members_only' | 'private';
          status: 'draft' | 'published' | 'archived';
          is_featured: boolean;
          created_by: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          title: string;
          slug: string;
          description?: string | null;
          resource_type?: 'pdf' | 'document' | 'worksheet' | 'tutorial' | 'code' | 'link';
          subject?: string;
          class_level?: string | null;
          visibility?: 'public' | 'members_only' | 'private';
          status?: 'draft' | 'published' | 'archived';
          is_featured?: boolean;
          created_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          title?: string;
          slug?: string;
          description?: string | null;
          resource_type?: 'pdf' | 'document' | 'worksheet' | 'tutorial' | 'code' | 'link';
          subject?: string;
          class_level?: string | null;
          visibility?: 'public' | 'members_only' | 'private';
          status?: 'draft' | 'published' | 'archived';
          is_featured?: boolean;
          created_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      resource_files: {
        Row: {
          id: string;
          resource_id: string;
          file_name: string;
          storage_path: string;
          file_size_bytes: number;
          mime_type: string;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          file_name: string;
          storage_path: string;
          file_size_bytes?: number;
          mime_type: string;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          file_name?: string;
          storage_path?: string;
          file_size_bytes?: number;
          mime_type?: string;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          instructions: string | null;
          category: string;
          duration_minutes: number;
          total_marks: number;
          passing_marks: number;
          attempt_limit: number;
          status: 'draft' | 'published' | 'archived' | 'closed';
          visibility: 'public' | 'members_only' | 'private';
          start_time: string | null;
          end_time: string | null;
          created_by: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          instructions?: string | null;
          category?: string;
          duration_minutes?: number;
          total_marks?: number;
          passing_marks?: number;
          attempt_limit?: number;
          status?: 'draft' | 'published' | 'archived' | 'closed';
          visibility?: 'public' | 'members_only' | 'private';
          start_time?: string | null;
          end_time?: string | null;
          created_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          instructions?: string | null;
          category?: string;
          duration_minutes?: number;
          total_marks?: number;
          passing_marks?: number;
          attempt_limit?: number;
          status?: 'draft' | 'published' | 'archived' | 'closed';
          visibility?: 'public' | 'members_only' | 'private';
          start_time?: string | null;
          end_time?: string | null;
          created_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          question_type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_text';
          marks: number;
          sort_order: number;
          explanation: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          question_type?: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_text';
          marks?: number;
          sort_order?: number;
          explanation?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question_text?: string;
          question_type?: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_text';
          marks?: number;
          sort_order?: number;
          explanation?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          is_correct?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          option_text?: string;
          is_correct?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string;
          attempt_number: number;
          status: 'in_progress' | 'submitted' | 'evaluated' | 'abandoned';
          score: number;
          percentage: number;
          time_spent_seconds: number;
          started_at: string;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          user_id: string;
          attempt_number?: number;
          status?: 'in_progress' | 'submitted' | 'evaluated' | 'abandoned';
          score?: number;
          percentage?: number;
          time_spent_seconds?: number;
          started_at?: string;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          user_id?: string;
          attempt_number?: number;
          status?: 'in_progress' | 'submitted' | 'evaluated' | 'abandoned';
          score?: number;
          percentage?: number;
          time_spent_seconds?: number;
          started_at?: string;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_option_id: string | null;
          text_response: string | null;
          is_correct: boolean | null;
          marks_awarded: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          selected_option_id?: string | null;
          text_response?: string | null;
          is_correct?: boolean | null;
          marks_awarded?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          selected_option_id?: string | null;
          text_response?: string | null;
          is_correct?: boolean | null;
          marks_awarded?: number;
          created_at?: string;
        };
      };
      quiz_results: {
        Row: {
          id: string;
          attempt_id: string;
          quiz_id: string;
          user_id: string;
          total_score: number;
          percentage: number;
          passed: boolean;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          quiz_id: string;
          user_id: string;
          total_score?: number;
          percentage?: number;
          passed?: boolean;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          quiz_id?: string;
          user_id?: string;
          total_score?: number;
          percentage?: number;
          passed?: boolean;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      exam_documents: {
        Row: {
          id: string;
          title: string;
          slug: string;
          subject: string;
          class_grade: string;
          academic_year: string;
          exam_type: 'Half-Yearly' | 'Annual' | 'Pre-Board' | 'Unit Test' | 'Model Paper' | 'Entrance';
          document_type: 'question_paper' | 'sample_paper' | 'answer_key' | 'syllabus' | 'worksheet' | 'study_material';
          description: string | null;
          file_path: string;
          file_size_bytes: number;
          download_count: number;
          visibility: 'public' | 'members_only' | 'admin_only';
          status: 'draft' | 'published' | 'archived';
          published_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          subject: string;
          class_grade: string;
          academic_year: string;
          exam_type: 'Half-Yearly' | 'Annual' | 'Pre-Board' | 'Unit Test' | 'Model Paper' | 'Entrance';
          document_type?: 'question_paper' | 'sample_paper' | 'answer_key' | 'syllabus' | 'worksheet' | 'study_material';
          description?: string | null;
          file_path: string;
          file_size_bytes?: number;
          download_count?: number;
          visibility?: 'public' | 'members_only' | 'admin_only';
          status?: 'draft' | 'published' | 'archived';
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          subject?: string;
          class_grade?: string;
          academic_year?: string;
          exam_type?: 'Half-Yearly' | 'Annual' | 'Pre-Board' | 'Unit Test' | 'Model Paper' | 'Entrance';
          document_type?: 'question_paper' | 'sample_paper' | 'answer_key' | 'syllabus' | 'worksheet' | 'study_material';
          description?: string | null;
          file_path?: string;
          file_size_bytes?: number;
          download_count?: number;
          visibility?: 'public' | 'members_only' | 'admin_only';
          status?: 'draft' | 'published' | 'archived';
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exam_results: {
        Row: {
          id: string;
          student_id: string;
          document_id: string | null;
          subject: string;
          marks_obtained: number;
          max_marks: number;
          percentage: number;
          grade: string;
          status: 'draft' | 'published' | 'withheld' | 'archived';
          exam_date: string;
          publication_date: string;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          document_id?: string | null;
          subject: string;
          marks_obtained: number;
          max_marks: number;
          percentage: number;
          grade: string;
          status?: 'draft' | 'published' | 'withheld' | 'archived';
          exam_date?: string;
          publication_date?: string;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          document_id?: string | null;
          subject?: string;
          marks_obtained?: number;
          max_marks?: number;
          percentage?: number;
          grade?: string;
          status?: 'draft' | 'published' | 'withheld' | 'archived';
          exam_date?: string;
          publication_date?: string;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          sender_name: string;
          sender_email: string;
          subject: string;
          message: string;
          status: 'new' | 'read' | 'in_progress' | 'resolved' | 'archived';
          submitted_at: string;
          handled_at: string | null;
          handled_by: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_name: string;
          sender_email: string;
          subject: string;
          message: string;
          status?: 'new' | 'read' | 'in_progress' | 'resolved' | 'archived';
          submitted_at?: string;
          handled_at?: string | null;
          handled_by?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_name?: string;
          sender_email?: string;
          subject?: string;
          message?: string;
          status?: 'new' | 'read' | 'in_progress' | 'resolved' | 'archived';
          submitted_at?: string;
          handled_at?: string | null;
          handled_by?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      file_metadata: {
        Row: {
          id: string;
          bucket_name: string;
          storage_path: string;
          original_name: string;
          mime_type: string;
          size_bytes: number;
          entity_type: string | null;
          entity_id: string | null;
          uploaded_by: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bucket_name: string;
          storage_path: string;
          original_name: string;
          mime_type: string;
          size_bytes?: number;
          entity_type?: string | null;
          entity_id?: string | null;
          uploaded_by?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bucket_name?: string;
          storage_path?: string;
          original_name?: string;
          mime_type?: string;
          size_bytes?: number;
          entity_type?: string | null;
          entity_id?: string | null;
          uploaded_by?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          is_public: boolean;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          is_public?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          is_public?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      designations: {
        Row: {
          id: string;
          title: string;
          slug: string;
          level: 'leadership' | 'member' | 'alumnus' | 'honorary';
          hierarchy_order: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          level?: 'leadership' | 'member' | 'alumnus' | 'honorary';
          hierarchy_order?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          level?: 'leadership' | 'member' | 'alumnus' | 'honorary';
          hierarchy_order?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      member_posts: {
        Row: {
          id: string;
          member_id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          cover_image_url: string | null;
          status: 'draft' | 'published' | 'archived';
          visibility: 'public' | 'members_only' | 'private';
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          cover_image_url?: string | null;
          status?: 'draft' | 'published' | 'archived';
          visibility?: 'public' | 'members_only' | 'private';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          cover_image_url?: string | null;
          status?: 'draft' | 'published' | 'archived';
          visibility?: 'public' | 'members_only' | 'private';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      member_videos: {
        Row: {
          id: string;
          member_id: string;
          title: string;
          description: string | null;
          video_url: string;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          status: 'draft' | 'published' | 'archived';
          visibility: 'public' | 'members_only' | 'private';
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          title: string;
          description?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          status?: 'draft' | 'published' | 'archived';
          visibility?: 'public' | 'members_only' | 'private';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          title?: string;
          description?: string | null;
          video_url?: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          status?: 'draft' | 'published' | 'archived';
          visibility?: 'public' | 'members_only' | 'private';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
