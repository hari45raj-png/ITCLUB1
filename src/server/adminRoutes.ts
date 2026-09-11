/**
 * St. Mary's English School - IT Club Platform
 * Administrative Control Center API Routes
 * 
 * Strict Enforcement:
 * - Every single endpoint is protected by `requireAdmin` middleware.
 * - Non-members and unauthorized members are strictly rejected server-side (401/403).
 * - Every sensitive administrative mutation appends an authoritative audit log entry.
 */

import { Router, Request, Response } from 'express';
import { requireAdmin } from './authMiddleware';
import { memberRepository, StoredMember, StoredProfile } from './memberRepository';
import { getSupabaseAdmin } from './supabaseAdmin';

export const adminRouter = Router();

// Apply requireAdmin across all routes on this router
adminRouter.use(requireAdmin);

// ============================================================================
// 1. DASHBOARD & METRICS
// ============================================================================
adminRouter.get('/dashboard/stats', async (req: Request, res: Response) => {
  try {
    const members = Array.from(memberRepository.members.values());
    const activeMembers = members.filter(m => m.status === 'active').length;
    const archivedMembers = members.filter(m => m.status === 'archived').length;
    
    const upcomingEvents = memberRepository.events.filter(e => e.status === 'upcoming').length;
    const publishedNotices = memberRepository.notices.filter(n => n.status === 'published').length;
    const publishedPosts = memberRepository.posts.filter(p => p.status === 'published').length;
    
    const unreadMessages = memberRepository.contactMessages.filter(m => m.status === 'unread').length;
    const mockData = memberRepository.getMockCandidates();

    return res.json({
      success: true,
      data: {
        totalMembers: members.length,
        activeMembers,
        archivedMembers,
        upcomingEvents,
        publishedNotices,
        publishedPosts,
        totalProjects: memberRepository.projects.length,
        totalAchievements: memberRepository.achievements.length,
        totalResources: memberRepository.resources.length,
        totalQuestionPapers: memberRepository.questionPapers.length,
        totalQuizzes: memberRepository.quizzes.length,
        totalCertificates: memberRepository.certificates.length,
        unreadContactMessages: unreadMessages,
        totalFiles: memberRepository.files.length,
        candidateMockItems: mockData.totalCandidateCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to retrieve stats.' });
  }
});

// ============================================================================
// 2. MEMBERS MANAGEMENT
// ============================================================================
adminRouter.get('/members', async (req: Request, res: Response) => {
  try {
    const { status, search, designation } = req.query;
    let list = memberRepository.getAllMembers();

    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter(m => m.status === status);
    }
    if (designation && typeof designation === 'string' && designation !== 'all') {
      list = list.filter(m => m.designation.toLowerCase() === designation.toLowerCase());
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(m =>
        m.fullName.toLowerCase().includes(q) ||
        m.memberNumber.toLowerCase().includes(q) ||
        m.classGrade.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post('/members/create', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { fullName, admissionNumber, classGrade, section, designation, bio, skills, birthYear } = req.body;

    if (!fullName || !admissionNumber || !classGrade || !section) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, School Admission Number, Class Grade, and Section are required.',
      });
    }

    const cleanFullName = String(fullName).trim();
    const cleanAdmissionNo = String(admissionNumber).trim();
    const cleanClassGrade = String(classGrade).trim();
    const cleanSection = String(section).trim().toUpperCase();

    if (!cleanAdmissionNo || cleanAdmissionNo.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid School Admission Number (e.g. 6756).',
      });
    }

    // Check if admission number already registered to prevent duplicates
    const allMembers = memberRepository.getAllMembers();
    const existingWithAdmission = allMembers.find(
      m => m.admissionNumber && m.admissionNumber.toLowerCase() === cleanAdmissionNo.toLowerCase()
    );
    if (existingWithAdmission) {
      return res.status(400).json({
        success: false,
        message: `A member is already registered with School Admission Number ${cleanAdmissionNo}.`,
      });
    }

    const numBirthYear = birthYear ? parseInt(birthYear, 10) : 2011;

    const result = memberRepository.createMember({
      fullName: cleanFullName,
      admissionNumber: cleanAdmissionNo,
      birthYear: isNaN(numBirthYear) ? 2011 : numBirthYear,
      classGrade: cleanClassGrade,
      section: cleanSection,
      designation: designation ? String(designation).trim() : 'Member',
      bio: bio ? String(bio).trim() : undefined,
      skills: Array.isArray(skills) ? skills : undefined,
    });

    // Also attempt to create in Supabase Auth if available
    try {
      const admin = getSupabaseAdmin();
      await admin.auth.admin.createUser({
        email: result.profile.email,
        password: `Password${cleanAdmissionNo}!`,
        email_confirm: true,
        user_metadata: {
          full_name: result.profile.fullName,
          applicant_number: result.applicantNumber,
          admission_number: cleanAdmissionNo,
          role: result.profile.role,
        },
      });
    } catch {
      // Local sync fallback
    }

    // Authoritative Audit Log
    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'MEMBER_PROVISIONED',
      'members',
      result.member.id,
      {
        applicantNumber: result.applicantNumber,
        admissionNumber: cleanAdmissionNo,
        fullName: result.profile.fullName,
        classGrade: result.member.classGrade,
        section: result.member.section,
        designation: result.member.designation,
      }
    );

    return res.status(201).json({
      success: true,
      message: `Member successfully provisioned with Applicant Number: ${result.applicantNumber}`,
      data: {
        member: result.member,
        profile: result.profile,
        applicantNumber: result.applicantNumber,
        admissionNumber: cleanAdmissionNo,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.get('/members/:id', async (req: Request, res: Response) => {
  const member = memberRepository.getMemberById(req.params.id);
  if (!member) {
    return res.status(404).json({ success: false, message: 'Member not found.' });
  }
  return res.json({ success: true, data: member });
});

adminRouter.patch('/members/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const updated = memberRepository.updateMember(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'MEMBER_UPDATED',
      'members',
      req.params.id,
      req.body
    );

    return res.json({ success: true, message: 'Member updated successfully.', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post('/members/:id/archive', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const member = memberRepository.archiveMember(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'MEMBER_ARCHIVED',
      'members',
      req.params.id,
      { status: 'archived' }
    );

    return res.json({ success: true, message: 'Member archived successfully.', data: member });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post('/members/:id/restore', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const member = memberRepository.restoreMember(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'MEMBER_RESTORED',
      'members',
      req.params.id,
      { status: 'active' }
    );

    return res.json({ success: true, message: 'Member restored successfully.', data: member });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/members/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const existing = memberRepository.getMemberById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    // Safety guard: Cannot delete Root Administrator (Applicant IT@0)
    if (existing.memberNumber === 'IT@0' || existing.memberNumber === '0') {
      return res.status(400).json({
        success: false,
        message: 'The Root Administrator (Applicant IT@0) cannot be deleted.',
      });
    }

    memberRepository.deleteMember(req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'MEMBER_DELETED',
      'members',
      req.params.id,
      { applicantNumber: existing.memberNumber, fullName: existing.fullName }
    );

    return res.json({ success: true, message: 'Member record successfully deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 3. DESIGNATIONS MANAGEMENT
// ============================================================================
adminRouter.get('/designations', async (req: Request, res: Response) => {
  try {
    const members = Array.from(memberRepository.members.values());
    const withCounts = memberRepository.designations.map(d => ({
      ...d,
      assignedCount: members.filter(m => m.designation.toLowerCase() === d.title.toLowerCase()).length,
    })).sort((a, b) => a.hierarchyOrder - b.hierarchyOrder);

    return res.json({ success: true, data: withCounts });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post('/designations', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { title, level = 'member', hierarchyOrder = 25, description = '' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Designation title is required.' });
    }

    const newDesig = {
      id: `desig-${Date.now()}`,
      title: title.trim(),
      level: level as any,
      hierarchyOrder: Number(hierarchyOrder) || 25,
      description: description.trim(),
      isSystem: false,
    };

    memberRepository.designations.push(newDesig);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'DESIGNATION_CREATED',
      'designations',
      newDesig.id,
      newDesig
    );

    return res.status(201).json({ success: true, message: 'Designation created successfully.', data: newDesig });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.patch('/designations/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const desig = memberRepository.designations.find(d => d.id === req.params.id);
    if (!desig) {
      return res.status(404).json({ success: false, message: 'Designation not found.' });
    }

    if (req.body.title) desig.title = req.body.title.trim();
    if (req.body.level) desig.level = req.body.level;
    if (req.body.hierarchyOrder !== undefined) desig.hierarchyOrder = Number(req.body.hierarchyOrder);
    if (req.body.description !== undefined) desig.description = req.body.description.trim();

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'DESIGNATION_UPDATED',
      'designations',
      desig.id,
      req.body
    );

    return res.json({ success: true, message: 'Designation updated.', data: desig });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/designations/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const desig = memberRepository.designations.find(d => d.id === req.params.id);
    if (!desig) {
      return res.status(404).json({ success: false, message: 'Designation not found.' });
    }

    if (desig.isSystem && ['President', 'Vice President', 'Secretary', 'Member'].includes(desig.title)) {
      return res.status(400).json({
        success: false,
        message: 'Core system designation cannot be removed.',
      });
    }

    memberRepository.designations = memberRepository.designations.filter(d => d.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'DESIGNATION_DELETED',
      'designations',
      req.params.id,
      { title: desig.title }
    );

    return res.json({ success: true, message: 'Designation removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 4. POSTS & ARTICLES MANAGEMENT
// ============================================================================
adminRouter.get('/posts', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.posts });
});

adminRouter.post('/posts', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { title, content, category, imageUrl, priority = 'general', status = 'published' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const now = new Date().toISOString();
    const newPost = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content: content.trim(),
      category: category ? category.trim() : 'General',
      authorName: caller.displayName,
      authorId: caller.id,
      status: status as any,
      priority: priority as any,
      imageUrl: imageUrl || undefined,
      publishedAt: status === 'published' ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    memberRepository.posts.unshift(newPost);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'POST_CREATED',
      'posts',
      newPost.id,
      { title: newPost.title, status: newPost.status }
    );

    return res.status(201).json({ success: true, message: 'Post created.', data: newPost });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.patch('/posts/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const post = memberRepository.posts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (req.body.title) post.title = req.body.title.trim();
    if (req.body.content) post.content = req.body.content.trim();
    if (req.body.category) post.category = req.body.category.trim();
    if (req.body.imageUrl !== undefined) post.imageUrl = req.body.imageUrl;
    if (req.body.priority) post.priority = req.body.priority;
    if (req.body.status) {
      post.status = req.body.status;
      if (req.body.status === 'published' && !post.publishedAt) {
        post.publishedAt = new Date().toISOString();
      }
    }
    post.updatedAt = new Date().toISOString();

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'POST_UPDATED',
      'posts',
      post.id,
      req.body
    );

    return res.json({ success: true, message: 'Post updated.', data: post });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/posts/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.posts = memberRepository.posts.filter(p => p.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'POST_DELETED',
      'posts',
      req.params.id
    );

    return res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 5. NOTICES & ANNOUNCEMENTS
// ============================================================================
adminRouter.get('/notices', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.notices });
});

adminRouter.post('/notices', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { title, content, category = 'Academic', priority = 'general', isPublic = true, broadcastNotification = false } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const now = new Date().toISOString();
    const newNotice = {
      id: `not-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      priority: priority as any,
      publishedDate: now.split('T')[0],
      status: 'published' as const,
      author: caller.displayName,
      isPublic: Boolean(isPublic),
      createdAt: now,
    };

    memberRepository.notices.unshift(newNotice);

    // Optional member notification broadcast
    if (broadcastNotification) {
      memberRepository.notifications.push({
        id: `notif-${Date.now()}`,
        recipientId: 'ALL',
        title: `Notice: ${newNotice.title}`,
        message: newNotice.content.slice(0, 140) + '...',
        notificationType: priority === 'urgent' ? 'alert' : 'notice',
        readAt: null,
        createdAt: now,
      });
    }

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'NOTICE_PUBLISHED',
      'notices',
      newNotice.id,
      { title: newNotice.title, priority: newNotice.priority }
    );

    return res.status(201).json({ success: true, message: 'Notice published.', data: newNotice });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.patch('/notices/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const notice = memberRepository.notices.find(n => n.id === req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found.' });
    }

    if (req.body.title) notice.title = req.body.title.trim();
    if (req.body.content) notice.content = req.body.content.trim();
    if (req.body.category) notice.category = req.body.category.trim();
    if (req.body.priority) notice.priority = req.body.priority;
    if (req.body.status) notice.status = req.body.status;
    if (req.body.isPublic !== undefined) notice.isPublic = req.body.isPublic;

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'NOTICE_UPDATED',
      'notices',
      notice.id,
      req.body
    );

    return res.json({ success: true, message: 'Notice updated.', data: notice });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/notices/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.notices = memberRepository.notices.filter(n => n.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'NOTICE_DELETED',
      'notices',
      req.params.id
    );

    return res.json({ success: true, message: 'Notice deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 6. EVENTS MANAGEMENT
// ============================================================================
adminRouter.get('/events', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.events });
});

adminRouter.post('/events', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { title, date, time, location, description, category = 'Workshop', status = 'upcoming', imageUrl } = req.body;

    if (!title || !date || !location) {
      return res.status(400).json({ success: false, message: 'Title, date, and location are required.' });
    }

    const now = new Date().toISOString();
    const newEvent = {
      id: `evt-${Date.now()}`,
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      date: date.trim(),
      time: time ? time.trim() : '10:00 AM',
      location: location.trim(),
      description: description ? description.trim() : '',
      category: category.trim(),
      status: status as any,
      imageUrl: imageUrl || undefined,
      isPublic: true,
      createdAt: now,
    };

    memberRepository.events.push(newEvent);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'EVENT_CREATED',
      'events',
      newEvent.id,
      { title: newEvent.title, date: newEvent.date }
    );

    return res.status(201).json({ success: true, message: 'Event scheduled.', data: newEvent });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.patch('/events/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const event = memberRepository.events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (req.body.title) event.title = req.body.title.trim();
    if (req.body.date) event.date = req.body.date.trim();
    if (req.body.time) event.time = req.body.time.trim();
    if (req.body.location) event.location = req.body.location.trim();
    if (req.body.description !== undefined) event.description = req.body.description.trim();
    if (req.body.category) event.category = req.body.category.trim();
    if (req.body.status) event.status = req.body.status;
    if (req.body.imageUrl !== undefined) event.imageUrl = req.body.imageUrl;

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'EVENT_UPDATED',
      'events',
      event.id,
      req.body
    );

    return res.json({ success: true, message: 'Event updated.', data: event });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/events/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.events = memberRepository.events.filter(e => e.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'EVENT_DELETED',
      'events',
      req.params.id
    );

    return res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 7. GALLERY MANAGEMENT
// ============================================================================
adminRouter.get('/gallery', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.gallery });
});

adminRouter.post('/gallery', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { albumTitle, title, imageUrl, category = 'General', date } = req.body;

    if (!albumTitle || !title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Album Title, Item Title, and Image URL are required.' });
    }

    const now = new Date().toISOString();
    const newItem = {
      id: `gal-${Date.now()}`,
      albumTitle: albumTitle.trim(),
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      category: category.trim(),
      date: date ? date.trim() : now.split('T')[0],
      status: 'published' as const,
      createdAt: now,
    };

    memberRepository.gallery.push(newItem);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'GALLERY_ITEM_ADDED',
      'gallery',
      newItem.id,
      { album: newItem.albumTitle, title: newItem.title }
    );

    return res.status(201).json({ success: true, message: 'Gallery media added.', data: newItem });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/gallery/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.gallery = memberRepository.gallery.filter(g => g.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'GALLERY_ITEM_DELETED',
      'gallery',
      req.params.id
    );

    return res.json({ success: true, message: 'Gallery item removed.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 8. PROJECTS & ACHIEVEMENTS
// ============================================================================
adminRouter.get('/projects', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.projects });
});

adminRouter.post('/projects', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { title, shortDescription, roleInProject, repoUrl, liveUrl, memberId, isApproved = true } = req.body;

    if (!title || !shortDescription) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const newProj = {
      id: `proj-${Date.now()}`,
      memberId: memberId || 'm1111111-1111-4111-8111-111111111111',
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      shortDescription: shortDescription.trim(),
      roleInProject: roleInProject ? roleInProject.trim() : 'Developer',
      status: 'published' as const,
      repoUrl: repoUrl || undefined,
      liveUrl: liveUrl || undefined,
      isApproved: Boolean(isApproved),
      isFeatured: false,
    };

    memberRepository.projects.push(newProj);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'PROJECT_CREATED',
      'projects',
      newProj.id,
      { title: newProj.title }
    );

    return res.status(201).json({ success: true, message: 'Project registered.', data: newProj });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/projects/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.projects = memberRepository.projects.filter(p => p.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'PROJECT_DELETED',
      'projects',
      req.params.id
    );

    return res.json({ success: true, message: 'Project removed.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.get('/achievements', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.achievements });
});

adminRouter.post('/achievements', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { title, memberId, awardCategory, competitionName, rankPosition, eventDate, certificateUrl } = req.body;

    if (!title || !competitionName) {
      return res.status(400).json({ success: false, message: 'Title and competition name are required.' });
    }

    const newAch = {
      id: `ach-${Date.now()}`,
      memberId: memberId || 'm1111111-1111-4111-8111-111111111111',
      title: title.trim(),
      description: `${competitionName.trim()} - ${rankPosition || 'Honor'}`,
      category: (awardCategory === 'Competition' ? 'Competition' : 'Academic') as any,
      issuer: 'St. Mary’s English School IT Club',
      achievementDate: eventDate || new Date().toISOString().split('T')[0],
      proofUrl: certificateUrl || undefined,
      isFeatured: true,
    };

    memberRepository.achievements.push(newAch);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'ACHIEVEMENT_RECORDED',
      'achievements',
      newAch.id,
      { title: newAch.title }
    );

    return res.status(201).json({ success: true, message: 'Achievement recorded.', data: newAch });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/achievements/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.achievements = memberRepository.achievements.filter(a => a.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'ACHIEVEMENT_DELETED',
      'achievements',
      req.params.id
    );

    return res.json({ success: true, message: 'Achievement removed.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 9. RESOURCES & QUESTION PAPERS
// ============================================================================
adminRouter.get('/resources', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.resources });
});

adminRouter.post('/resources', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { title, subject, classGrade, academicYear, examType, documentType, description, filePath } = req.body;

    if (!title || !subject || !classGrade) {
      return res.status(400).json({ success: false, message: 'Title, subject, and class grade are required.' });
    }

    const newRes = {
      id: `res-${Date.now()}`,
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      subject: subject.trim(),
      classGrade: String(classGrade).trim(),
      academicYear: academicYear || '2026-2027',
      examType: examType || 'Periodic Test',
      documentType: documentType || 'study_material',
      description: description ? description.trim() : undefined,
      filePath: filePath || `resources/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`,
      fileSizeBytes: 1200000,
      visibility: 'members_only',
      downloadCount: 0,
    };

    memberRepository.resources.push(newRes);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'RESOURCE_UPLOADED',
      'resources',
      newRes.id,
      { title: newRes.title }
    );

    return res.status(201).json({ success: true, message: 'Resource added.', data: newRes });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/resources/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.resources = memberRepository.resources.filter(r => r.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'RESOURCE_DELETED',
      'resources',
      req.params.id
    );

    return res.json({ success: true, message: 'Resource deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.get('/question-papers', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.questionPapers });
});

adminRouter.post('/question-papers', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { title, classGrade, subject, academicYear, examType, description, filePath } = req.body;

    if (!title || !classGrade || !subject) {
      return res.status(400).json({ success: false, message: 'Title, class grade, and subject are required.' });
    }

    const newPaper = {
      id: `qp-${Date.now()}`,
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      classGrade: String(classGrade).trim(),
      subject: subject.trim(),
      academicYear: academicYear || '2026-2027',
      examType: examType || 'Pre-Board',
      description: description ? description.trim() : 'Official Model Paper',
      filePath: filePath || `exams/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`,
      fileSizeBytes: 1500000,
      status: 'published' as const,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
    };

    memberRepository.questionPapers.push(newPaper);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'QUESTION_PAPER_REGISTERED',
      'question_papers',
      newPaper.id,
      { title: newPaper.title }
    );

    return res.status(201).json({ success: true, message: 'Question paper registered.', data: newPaper });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/question-papers/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.questionPapers = memberRepository.questionPapers.filter(q => q.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'QUESTION_PAPER_DELETED',
      'question_papers',
      req.params.id
    );

    return res.json({ success: true, message: 'Question paper deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 10. QUIZZES & RESULTS
// ============================================================================
adminRouter.get('/quizzes', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.quizzes });
});

adminRouter.post('/quizzes', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { title, description, category = 'General IT', durationMinutes = 20, totalMarks = 30, passingMarks = 15 } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Quiz title is required.' });
    }

    const newQuiz = {
      id: `quiz-${Date.now()}`,
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description ? description.trim() : '',
      category: category.trim(),
      durationMinutes: Number(durationMinutes) || 20,
      totalMarks: Number(totalMarks) || 30,
      passingMarks: Number(passingMarks) || 15,
      attemptLimit: 3,
      status: 'published',
      publishedAt: new Date().toISOString(),
    };

    memberRepository.quizzes.push(newQuiz);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'QUIZ_CREATED',
      'quizzes',
      newQuiz.id,
      { title: newQuiz.title }
    );

    return res.status(201).json({ success: true, message: 'Quiz created successfully.', data: newQuiz });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/quizzes/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.quizzes = memberRepository.quizzes.filter(q => q.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'QUIZ_DELETED',
      'quizzes',
      req.params.id
    );

    return res.json({ success: true, message: 'Quiz removed.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.get('/results', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.examResults });
});

// ============================================================================
// 11. CERTIFICATES MANAGEMENT
// ============================================================================
adminRouter.get('/certificates', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.certificates });
});

adminRouter.post('/certificates', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { recipientId, title, description, issueDate, certificateNumber } = req.body;

    if (!title || !recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient and certificate title are required.' });
    }

    const certNum = certificateNumber || `SMES-IT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCert = {
      id: `cert-${Date.now()}`,
      recipientId,
      title: title.trim(),
      description: description ? description.trim() : 'Issued for excellence in technical curriculum.',
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      certificateNumber: certNum,
      verificationCode: `V-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'valid' as const,
      issuerName: "St. Mary's English School IT Club Council",
    };

    memberRepository.certificates.push(newCert);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'CERTIFICATE_ISSUED',
      'certificates',
      newCert.id,
      { certificateNumber: newCert.certificateNumber, recipientId }
    );

    return res.status(201).json({ success: true, message: 'Certificate issued.', data: newCert });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post('/certificates/:id/revoke', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const cert = memberRepository.certificates.find(c => c.id === req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    cert.status = 'revoked';

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'CERTIFICATE_REVOKED',
      'certificates',
      cert.id,
      { certificateNumber: cert.certificateNumber, reason: req.body.reason || 'Administrative revocation' }
    );

    return res.json({ success: true, message: 'Certificate revoked.', data: cert });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 12. NOTIFICATIONS BROADCAST
// ============================================================================
adminRouter.get('/notifications', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.notifications });
});

adminRouter.post('/notifications', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { recipientId = 'ALL', title, message, type = 'info' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientId,
      title: title.trim(),
      message: message.trim(),
      notificationType: (type as any) || 'info',
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    memberRepository.notifications.unshift(newNotif);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'NOTIFICATION_BROADCAST',
      'notifications',
      newNotif.id,
      { recipient: recipientId, title: newNotif.title }
    );

    return res.status(201).json({ success: true, message: 'Notification broadcast sent.', data: newNotif });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/notifications/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.notifications = memberRepository.notifications.filter(n => n.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'NOTIFICATION_DELETED',
      'notifications',
      req.params.id
    );

    return res.json({ success: true, message: 'Notification deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 13. CONTACT MESSAGES
// ============================================================================
adminRouter.get('/contact-messages', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.contactMessages });
});

adminRouter.patch('/contact-messages/:id/status', async (req: Request, res: Response) => {
  try {
    const msg = memberRepository.contactMessages.find(m => m.id === req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    if (req.body.status) {
      msg.status = req.body.status;
    }

    return res.json({ success: true, message: 'Message status updated.', data: msg });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/contact-messages/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.contactMessages = memberRepository.contactMessages.filter(m => m.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'CONTACT_MESSAGE_DELETED',
      'contact_messages',
      req.params.id
    );

    return res.json({ success: true, message: 'Message removed.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 14. FILES & STORAGE REGISTRY
// ============================================================================
adminRouter.get('/files', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.files });
});

adminRouter.delete('/files/:id', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    memberRepository.files = memberRepository.files.filter(f => f.id !== req.params.id);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'FILE_DELETED',
      'storage',
      req.params.id
    );

    return res.json({ success: true, message: 'File record removed.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 15. SITE SETTINGS & SCHOOL BRANDING
// ============================================================================
adminRouter.get('/settings', async (req: Request, res: Response) => {
  return res.json({ success: true, data: memberRepository.settings });
});

adminRouter.patch('/settings', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const current = memberRepository.settings;

    // Only allow updating editable fields
    if (req.body.tagline !== undefined) current.tagline = String(req.body.tagline).trim();
    if (req.body.contactEmail !== undefined) current.contactEmail = String(req.body.contactEmail).trim();
    if (req.body.contactPhone !== undefined) current.contactPhone = String(req.body.contactPhone).trim();
    if (req.body.academicSession !== undefined) current.academicSession = String(req.body.academicSession).trim();
    if (req.body.maintenanceMode !== undefined) current.maintenanceMode = Boolean(req.body.maintenanceMode);

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'SITE_SETTINGS_UPDATED',
      'settings',
      'site-settings',
      req.body
    );

    return res.json({ success: true, message: 'Settings saved successfully.', data: current });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 16. AUDIT LOGS
// ============================================================================
adminRouter.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const logs = memberRepository.auditLogs.slice(0, limit);
    return res.json({ success: true, data: logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 17. MOCK DATA CLEANUP MECHANISM (PROMPT 9 REQUIREMENT 17 & 46)
// ============================================================================
adminRouter.get('/mock-data/candidates', async (req: Request, res: Response) => {
  try {
    const candidates = memberRepository.getMockCandidates();
    return res.json({
      success: true,
      message: `Identified ${candidates.totalCandidateCount} candidate demo/mock items across collections.`,
      data: candidates,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post('/mock-data/archive-all', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const result = memberRepository.archiveAllMockCandidates();

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'MOCK_DATA_SOFT_ARCHIVED',
      'mock_data',
      'all_candidates',
      result
    );

    return res.json({
      success: true,
      message: `Successfully soft-archived ${result.archivedCount} candidate demo records. They are now hidden from public listings.`,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post('/mock-data/remove-all', async (req: Request, res: Response) => {
  try {
    const caller = req.authenticatedUser!;
    const { confirmPhrase } = req.body;

    // Safety confirmation gate
    if (confirmPhrase !== 'CLEAN MOCK DATA') {
      return res.status(400).json({
        success: false,
        message: 'Security Confirmation Required: Please provide the exact confirmation phrase "CLEAN MOCK DATA".',
      });
    }

    const result = memberRepository.removeAllMockCandidates();

    memberRepository.addAuditLog(
      caller.id,
      caller.displayName,
      caller.roles[0] || 'admin',
      'MOCK_DATA_CLEANED_PERMANENTLY',
      'mock_data',
      'all_candidates',
      result
    );

    return res.json({
      success: true,
      message: `Successfully cleaned ${result.removedCount} candidate demo records from active website collections.`,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
