/**
 * St. Mary's English School - IT Club Platform
 * Public Member Directory & Portfolio Data Service
 * 
 * PROMPT 7: Public / Private Data Separation & Database-Driven Designations
 * 
 * Mandates:
 * 1. Public queries ONLY retrieve public, published records (status = 'active', public_visibility = true).
 * 2. Absolute Public/Private Separation: Never fetch or return passwords, auth secrets,
 *    private login credentials, private notifications, or internal admin notes.
 * 3. Designations are database-driven from public.designations.
 * 4. Respects leadership hierarchy (President, Vice President, Secretary, Senior Member, Member).
 * 5. URL-safe slug routing (/members/:slug).
 * 6. Clean empty states when database is empty (No fake production data).
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { BaseService } from './baseService';
import { AuthService } from './authService';
import {
  ApiResponse,
  PublicMemberSummary,
  PublicMemberProfile,
  Designation,
  MemberDirectoryFilters,
  MemberProjectPreview,
  MemberAchievementPreview,
  MemberCertificatePreview,
  MemberPostPreview,
  MemberVideoPreview,
  MemberDashboardData,
} from '../types';

export class MemberService extends BaseService {
  /**
   * Fetches active database-driven designations ordered by hierarchy.
   */
  static async getDesignations(): Promise<ApiResponse<Designation[]>> {
    return this.executeQuery('getDesignations', async () => {
      if (!isSupabaseConfigured || !supabase) {
        // Safe default fallback matching database seed in migration 4
        return {
          data: [
            { id: 'des-1', title: 'President', slug: 'president', level: 'leadership', hierarchyOrder: 1, isActive: true },
            { id: 'des-2', title: 'Vice President', slug: 'vice-president', level: 'leadership', hierarchyOrder: 2, isActive: true },
            { id: 'des-3', title: 'Secretary', slug: 'secretary', level: 'leadership', hierarchyOrder: 3, isActive: true },
            { id: 'des-4', title: 'Senior Member', slug: 'senior-member', level: 'member', hierarchyOrder: 10, isActive: true },
            { id: 'des-5', title: 'Member', slug: 'member', level: 'member', hierarchyOrder: 20, isActive: true },
          ],
          error: null,
        };
      }

      const { data, error } = await (supabase as any)
        .from('designations')
        .select('*')
        .eq('is_active', true)
        .order('hierarchy_order', { ascending: true });

      if (error) {
        return { data: null, error };
      }

      const mapped: Designation[] = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        level: row.level,
        hierarchyOrder: row.hierarchy_order,
        description: row.description,
        isActive: row.is_active,
      }));

      return { data: mapped, error: null };
    });
  }

  /**
   * Fetches public active member directory profiles with optional filtering.
   * STRICT SECURITY: Only selects public fields.
   */
  static async getPublicMembers(filters?: MemberDirectoryFilters): Promise<ApiResponse<PublicMemberSummary[]>> {
    return this.executeQuery('getPublicMembers', async () => {
      if (!isSupabaseConfigured || !supabase) {
        // Return empty array when Supabase is unconfigured - clean empty state per prompt 7 mandate
        return { data: [], error: null };
      }

      const client = supabase as any;

      // Select public member fields joined with profile and designation
      let query = client
        .from('members')
        .select(`
          id,
          slug,
          class_grade,
          section,
          status,
          public_visibility,
          portfolio_visibility,
          is_featured,
          portfolio_bio,
          profiles:user_id (
            id,
            full_name,
            display_name,
            avatar_url,
            bio
          ),
          designations:designation_id (
            id,
            title,
            slug,
            level,
            hierarchy_order
          ),
          member_skills (
            proficiency_level,
            skills (
              name,
              category
            )
          ),
          project_members (
            id,
            projects (
              id,
              status,
              visibility
            )
          ),
          achievements (
            id,
            visibility
          )
        `)
        .eq('status', 'active')
        .eq('public_visibility', true);

      if (filters?.classGrade && filters.classGrade !== 'all') {
        query = query.eq('class_grade', filters.classGrade);
      }

      if (filters?.section && filters.section !== 'all') {
        query = query.eq('section', filters.section);
      }

      if (filters?.designationId && filters.designationId !== 'all') {
        query = query.eq('designation_id', filters.designationId);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error };
      }

      if (!data || data.length === 0) {
        return { data: [], error: null };
      }

      // Map raw rows into strongly typed PublicMemberSummary models
      let members: PublicMemberSummary[] = data.map((row: any) => {
        const profile = row.profiles || {};
        const designation = row.designations || {};
        const fullName = profile.full_name || profile.display_name || 'IT Club Member';
        const designationTitle = designation.title || 'Member';
        const designationLevel = designation.level || 'member';
        const hierarchyOrder = typeof designation.hierarchy_order === 'number' ? designation.hierarchy_order : 100;

        // Extract skills
        const skills: string[] = (row.member_skills || [])
          .map((ms: any) => ms.skills?.name)
          .filter(Boolean);

        // Count public projects
        const publicProjects = (row.project_members || []).filter(
          (pm: any) => pm.projects?.status === 'published' && pm.projects?.visibility === 'public'
        );

        // Count public achievements
        const publicAchievements = (row.achievements || []).filter(
          (ach: any) => ach.visibility === 'public'
        );

        const memberSlug = row.slug || MemberService.generateSlug(fullName, row.class_grade);

        return {
          id: row.id,
          slug: memberSlug,
          fullName,
          avatarUrl: profile.avatar_url || null,
          designation: designationTitle,
          designationLevel: designationLevel as any,
          hierarchyOrder,
          classGrade: row.class_grade,
          section: row.section,
          bio: row.portfolio_bio || profile.bio,
          skills,
          projectCount: publicProjects.length,
          achievementCount: publicAchievements.length,
          isFeatured: Boolean(row.is_featured),
          status: row.status,
        };
      });

      // Filter by leadership only if specified
      if (filters?.leadershipOnly) {
        members = members.filter((m) => m.designationLevel === 'leadership');
      }

      // Filter by skill if specified
      if (filters?.skill && filters.skill !== 'all') {
        const targetSkill = filters.skill.toLowerCase();
        members = members.filter((m) =>
          m.skills.some((s) => s.toLowerCase().includes(targetSkill))
        );
      }

      // Filter by general search query (name, designation, class, section, skills)
      if (filters?.query && filters.query.trim().length > 0) {
        const q = filters.query.trim().toLowerCase();
        members = members.filter((m) => {
          const matchName = m.fullName.toLowerCase().includes(q);
          const matchDesignation = m.designation.toLowerCase().includes(q);
          const matchClass = m.classGrade ? m.classGrade.toLowerCase().includes(q) : false;
          const matchSection = m.section ? m.section.toLowerCase().includes(q) : false;
          const matchSkills = m.skills.some((s) => s.toLowerCase().includes(q));
          const matchBio = m.bio ? m.bio.toLowerCase().includes(q) : false;
          return matchName || matchDesignation || matchClass || matchSection || matchSkills || matchBio;
        });
      }

      // Sort by leadership hierarchy (President -> VP -> Secretary -> Senior Member -> Member), then featured, then name
      members.sort((a, b) => {
        if (a.hierarchyOrder !== b.hierarchyOrder) {
          return a.hierarchyOrder - b.hierarchyOrder;
        }
        if (a.isFeatured !== b.isFeatured) {
          return a.isFeatured ? -1 : 1;
        }
        return a.fullName.localeCompare(b.fullName);
      });

      return { data: members, error: null };
    });
  }

  /**
   * Fetches an individual member profile and full public portfolio by slug.
   * Strictly verifies public visibility and strips all private metadata.
   */
  static async getMemberBySlug(slug: string): Promise<ApiResponse<PublicMemberProfile | null>> {
    return this.executeQuery('getMemberBySlug', async () => {
      if (!isSupabaseConfigured || !supabase) {
        return { data: null, error: null };
      }

      const client = supabase as any;
      const cleanSlug = slug.trim().toLowerCase();

      // 1. Fetch member core record
      const { data: memberRow, error: memberErr } = await client
        .from('members')
        .select(`
          id,
          user_id,
          slug,
          class_grade,
          section,
          joining_date,
          status,
          public_visibility,
          portfolio_visibility,
          is_featured,
          portfolio_bio,
          github_url,
          linkedin_url,
          website_url,
          profiles:user_id (
            id,
            full_name,
            display_name,
            avatar_url,
            bio
          ),
          designations:designation_id (
            id,
            title,
            slug,
            level,
            hierarchy_order
          )
        `)
        .eq('slug', cleanSlug)
        .eq('status', 'active')
        .eq('public_visibility', true)
        .maybeSingle();

      if (memberErr) {
        return { data: null, error: memberErr };
      }

      if (!memberRow) {
        return { data: null, error: null };
      }

      const memberId = memberRow.id;
      const userId = memberRow.user_id;
      const profile = memberRow.profiles || {};
      const designation = memberRow.designations || {};

      // 2. Fetch public skills
      const { data: skillsData } = await client
        .from('member_skills')
        .select(`
          id,
          proficiency_level,
          skills (
            id,
            name,
            category
          )
        `)
        .eq('member_id', memberId)
        .order('sort_order', { ascending: true });

      const skills = (skillsData || []).map((s: any) => ({
        id: s.skills?.id || s.id,
        name: s.skills?.name || 'General Computing',
        category: s.skills?.category || 'Technology',
        proficiency: s.proficiency_level || 'Intermediate',
      }));

      // 3. Fetch associated published public projects
      const { data: projectMembersData } = await client
        .from('project_members')
        .select(`
          role_in_project,
          projects (
            id,
            title,
            slug,
            short_description,
            thumbnail_url,
            status,
            visibility,
            repo_url,
            live_url
          )
        `)
        .eq('member_id', memberId);

      const projects: MemberProjectPreview[] = (projectMembersData || [])
        .filter((pm: any) => pm.projects && pm.projects.status === 'published' && pm.projects.visibility === 'public')
        .map((pm: any) => ({
          id: pm.projects.id,
          title: pm.projects.title,
          slug: pm.projects.slug,
          shortDescription: pm.projects.short_description || '',
          thumbnailUrl: pm.projects.thumbnail_url || null,
          roleInProject: pm.role_in_project || 'Contributor',
          status: pm.projects.status,
          repoUrl: pm.projects.repo_url || null,
          liveUrl: pm.projects.live_url || null,
        }));

      // 4. Fetch public achievements
      const { data: achievementsData } = await client
        .from('achievements')
        .select('*')
        .eq('member_id', memberId)
        .eq('visibility', 'public')
        .order('achievement_date', { ascending: false });

      const achievements: MemberAchievementPreview[] = (achievementsData || []).map((ach: any) => ({
        id: ach.id,
        title: ach.title,
        description: ach.description,
        category: ach.category,
        issuer: ach.issuer,
        achievementDate: ach.achievement_date,
        proofUrl: ach.proof_url || null,
        isFeatured: Boolean(ach.is_featured),
      }));

      // 5. Fetch public certificates
      const { data: certificatesData } = await client
        .from('certificates')
        .select('*')
        .or(`recipient_id.eq.${userId},recipient_id.eq.${memberId}`)
        .eq('status', 'valid')
        .order('issue_date', { ascending: false });

      const certificates: MemberCertificatePreview[] = (certificatesData || []).map((cert: any) => ({
        id: cert.id,
        title: cert.title,
        description: cert.description || null,
        issueDate: cert.issue_date,
        certificateNumber: cert.certificate_number,
        verificationCode: cert.verification_code,
        fileUrl: cert.file_url || null,
        issuerName: cert.issuer_name,
      }));

      // 6. Fetch approved public member posts
      const { data: postsData } = await client
        .from('member_posts')
        .select('*')
        .eq('member_id', memberId)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('published_at', { ascending: false });

      const posts: MemberPostPreview[] = (postsData || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.cover_image_url,
        publishedAt: post.published_at,
      }));

      // 7. Fetch approved public member videos
      const { data: videosData } = await client
        .from('member_videos')
        .select('*')
        .eq('member_id', memberId)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('published_at', { ascending: false });

      const videos: MemberVideoPreview[] = (videosData || []).map((vid: any) => ({
        id: vid.id,
        title: vid.title,
        description: vid.description,
        videoUrl: vid.video_url,
        thumbnailUrl: vid.thumbnail_url,
        durationSeconds: vid.duration_seconds,
        publishedAt: vid.published_at,
      }));

      const fullProfile: PublicMemberProfile = {
        id: memberId,
        slug: cleanSlug,
        fullName: profile.full_name || profile.display_name || 'IT Club Member',
        avatarUrl: profile.avatar_url || null,
        designation: designation.title || 'Member',
        designationLevel: (designation.level || 'member') as any,
        hierarchyOrder: typeof designation.hierarchy_order === 'number' ? designation.hierarchy_order : 100,
        classGrade: memberRow.class_grade,
        section: memberRow.section,
        bio: profile.bio || null,
        portfolioBio: memberRow.portfolio_bio || null,
        joiningDate: memberRow.joining_date || null,
        githubUrl: memberRow.github_url || null,
        linkedinUrl: memberRow.linkedin_url || null,
        websiteUrl: memberRow.website_url || null,
        skills,
        projects,
        achievements,
        certificates,
        posts,
        videos,
      };

      return { data: fullProfile, error: null };
    });
  }

  /**
   * Helper to extract unique classes and sections dynamically from active members.
   */
  static extractClassesAndSections(members: PublicMemberSummary[]): { classes: string[]; sections: string[] } {
    const classSet = new Set<string>();
    const sectionSet = new Set<string>();

    members.forEach((m) => {
      if (m.classGrade) classSet.add(m.classGrade);
      if (m.section) sectionSet.add(m.section);
    });

    return {
      classes: Array.from(classSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      sections: Array.from(sectionSet).sort(),
    };
  }

  /**
   * Generates a URL-safe, clean slug from student name and class.
   */
  static generateSlug(name: string, classGrade?: string | null): string {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    
    if (classGrade) {
      const cleanClass = classGrade.toLowerCase().replace(/[^a-z0-9]/g, '');
      return `${cleanName}-${cleanClass}`;
    }
    return cleanName;
  }

  // ============================================================================
  // PROMPT 8: AUTHORITATIVE MEMBER DASHBOARD & PRIVATE DATA
  // ============================================================================

  /**
   * Fetches the authoritative member dashboard data for the authenticated student.
   * Strictly IDOR-protected server-side.
   */
  static async getMemberDashboard(): Promise<ApiResponse<MemberDashboardData>> {
    try {
      const token = await AuthService.getAuthToken();
      const response = await fetch('/api/member/dashboard', {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          error: {
            code: 'DASHBOARD_FETCH_FAILED',
            message: json.message || 'Failed to load member dashboard records.',
          },
        };
      }

      return {
        success: true,
        data: json.data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Unable to connect to member dashboard service.',
        },
      };
    }
  }

  /**
   * Updates student portfolio and bio fields (Mass-assignment guarded server-side).
   */
  static async updateMemberProfile(fields: {
    bio?: string;
    portfolioBio?: string;
    skills?: string[];
    avatarUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
  }): Promise<ApiResponse<{ message: string; data: any }>> {
    try {
      const token = await AuthService.getAuthToken();
      const response = await fetch('/api/member/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify(fields),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          error: {
            code: 'PROFILE_UPDATE_FAILED',
            message: json.message || 'Failed to update member profile.',
          },
        };
      }

      return {
        success: true,
        data: json,
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Unable to connect to profile update service.',
        },
      };
    }
  }

  /**
   * Marks a specific member notification as read (IDOR protected).
   */
  static async markNotificationRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      const token = await AuthService.getAuthToken();
      const response = await fetch(`/api/member/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          error: {
            code: 'NOTIFICATION_UPDATE_FAILED',
            message: json.message || 'Failed to acknowledge notification.',
          },
        };
      }

      return { success: true, data: undefined };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Unable to connect to notification service.',
        },
      };
    }
  }

  /**
   * Marks all notifications for the current authenticated member as read.
   */
  static async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    try {
      const token = await AuthService.getAuthToken();
      const response = await fetch('/api/member/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          error: {
            code: 'NOTIFICATIONS_UPDATE_FAILED',
            message: json.message || 'Failed to mark all notifications as read.',
          },
        };
      }

      return { success: true, data: undefined };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Unable to connect to notification service.',
        },
      };
    }
  }

  /**
   * Provisions a new member account with sequential Applicant Number (IT@N) and School Admission Number credential.
   * Admin-only operation.
   */
  static async provisionMember(data: {
    fullName: string;
    admissionNumber: string;
    classGrade: string;
    section: string;
    designation?: string;
    birthYear?: number;
    bio?: string;
    skills?: string[];
  }): Promise<ApiResponse<any>> {
    try {
      const token = await AuthService.getAuthToken();
      const response = await fetch('/api/admin/members/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          error: {
            code: 'MEMBER_PROVISION_FAILED',
            message: json.message || 'Failed to provision member account.',
          },
        };
      }

      return {
        success: true,
        data: json.data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'Unable to connect to member provisioning service.',
        },
      };
    }
  }
}
