/**
 * St. Mary's English School - IT Club Platform
 * Authoritative Domain Services Layer
 * 
 * Rules:
 * 1. Strongly typed contracts for each business domain entity.
 * 2. Prepares query boundaries for future schema implementation (Prompt 2).
 * 3. Gracefully handles empty tables (returns empty arrays, not errors).
 * 4. Strictly enforces status/visibility filtering.
 */

import { supabase } from '../lib/supabaseClient';
import { BaseService } from './baseService';
import {
  ApiResponse,
  ClubNotice,
  MemberPortfolio,
  ClubProject,
  ClubAchievement,
  ExamDocument,
  CertificateRecord,
  QuizAssessment,
} from '../types';

export class NoticeService extends BaseService {
  /**
   * Fetches published notices for public & member bulletin boards.
   */
  static async getPublishedNotices(limit = 10): Promise<ApiResponse<ClubNotice[]>> {
    return this.executeQuery('getPublishedNotices', async () => {
      if (!supabase) throw new Error('Supabase client unavailable');
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(limit);

      return { data: data || [], error };
    });
  }
}

export { MemberService } from './memberService';

export class ProjectService extends BaseService {
  /**
   * Fetches published club projects.
   */
  static async getPublishedProjects(): Promise<ApiResponse<ClubProject[]>> {
    return this.executeQuery('getPublishedProjects', async () => {
      if (!supabase) throw new Error('Supabase client unavailable');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false });

      return { data: data || [], error };
    });
  }
}

export class AchievementService extends BaseService {
  /**
   * Fetches club competition achievements and awards.
   */
  static async getAchievements(): Promise<ApiResponse<ClubAchievement[]>> {
    return this.executeQuery('getAchievements', async () => {
      if (!supabase) throw new Error('Supabase client unavailable');
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('year', { ascending: false });

      return { data: data || [], error };
    });
  }
}

export class AcademicService extends BaseService {
  /**
   * Fetches syllabus, sample papers, and study documents.
   */
  static async getExamDocuments(documentType?: string): Promise<ApiResponse<ExamDocument[]>> {
    return this.executeQuery('getExamDocuments', async () => {
      if (!supabase) throw new Error('Supabase client unavailable');
      let query = supabase
        .from('exam_documents')
        .select('*')
        .eq('status', 'published');

      if (documentType) {
        query = query.eq('document_type', documentType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      return { data: data || [], error };
    });
  }

  /**
   * Fetches active quiz assessments.
   */
  static async getAvailableQuizzes(): Promise<ApiResponse<QuizAssessment[]>> {
    return this.executeQuery('getAvailableQuizzes', async () => {
      if (!supabase) throw new Error('Supabase client unavailable');
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('status', 'published');

      return { data: data || [], error };
    });
  }
}

export class CertificateService extends BaseService {
  /**
   * Performs public verification of a certificate by its unique code.
   */
  static async verifyCertificate(verificationCode: string): Promise<ApiResponse<CertificateRecord | null>> {
    return this.executeQuery('verifyCertificate', async () => {
      if (!supabase) throw new Error('Supabase client unavailable');
      const cleanCode = verificationCode.trim().toUpperCase();
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('verification_code', cleanCode)
        .maybeSingle();

      if (error || !data) {
        return { data: null, error };
      }

      const row = data as Record<string, any>;
      const record: CertificateRecord = {
        id: row.id,
        verificationCode: row.verification_code,
        recipientName: row.recipient_name,
        recipientEmail: row.recipient_email,
        eventOrQuizTitle: row.event_or_quiz_title,
        issueDate: row.issue_date,
        issuedBy: row.issued_by,
        pdfUrl: row.pdf_url,
        isValid: Boolean(row.is_valid),
      };

      return { data: record, error: null };
    });
  }
}
