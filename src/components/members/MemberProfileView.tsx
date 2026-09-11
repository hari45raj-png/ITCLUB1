/**
 * St. Mary's English School - IT Club Platform
 * Individual Member Profile & Public Portfolio View (/members/[slug])
 * 
 * PROMPT 7: Public Member Profile & Portfolio System
 * 
 * Features:
 * - Dynamic data loaded by slug via MemberService.getMemberBySlug(slug)
 * - Profile Header: Avatar, Name, Designation, Class, Section, Bio, Links
 * - Conditional Portfolio Sections (ONLY rendered if content exists):
 *   1. About / Extended Biography
 *   2. Technical Skills & Proficiencies
 *   3. Club & Academic Projects
 *   4. Public Achievements & Honors
 *   5. Verified Certificates (with verification link)
 *   6. Approved Public Posts & Articles (with read modal)
 *   7. Approved Public Videos (with video player modal)
 * - Strict Public/Private Data Separation (Zero passwords, auth tokens, or private exam notes)
 * - Clean mobile-first responsive layout
 */

import React, { useState, useEffect } from 'react';
import { MemberService } from '../../services/memberService';
import {
  PublicMemberProfile,
  MemberProjectPreview,
  MemberAchievementPreview,
  MemberCertificatePreview,
  MemberPostPreview,
  MemberVideoPreview,
} from '../../types/member';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import {
  ArrowLeft,
  Calendar,
  Award,
  Code,
  FileCheck2,
  BookOpen,
  Video,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  ShieldCheck,
  User,
  Clock,
  Play,
  CheckCircle2,
  Share2,
  Check,
} from 'lucide-react';

interface MemberProfileViewProps {
  slug: string;
  onBackToDirectory: () => void;
  onNavigateVerifyCertificate?: (code: string) => void;
}

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({
  slug,
  onBackToDirectory,
  onNavigateVerifyCertificate,
}) => {
  const [profile, setProfile] = useState<PublicMemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active modals for reading post or watching video
  const [selectedPost, setSelectedPost] = useState<MemberPostPreview | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MemberVideoPreview | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await MemberService.getMemberBySlug(slug);

        if (!isMounted) return;

        if (res.success && res.data) {
          setProfile(res.data);
        } else {
          setError(res.error?.message || 'Member profile not found or is currently private.');
        }
      } catch (err) {
        if (isMounted) {
          setError('A connection error occurred while loading this member profile.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const isLeadership =
    profile?.designationLevel === 'leadership' ||
    ['President', 'Vice President', 'Secretary'].includes(profile?.designation || '');

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Actions Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToDirectory}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Member Directory
          </Button>

          {profile && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              icon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            >
              {copiedLink ? 'Profile Link Copied!' : 'Share Portfolio'}
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 sm:p-12 animate-pulse space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-28 h-28 rounded-full bg-neutral-200 shrink-0" />
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="h-6 bg-neutral-200 rounded-sm w-1/3 mx-auto sm:mx-0" />
                <div className="h-4 bg-neutral-100 rounded-sm w-1/4 mx-auto sm:mx-0" />
                <div className="h-16 bg-neutral-50 rounded-sm w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Error / Not Found State */}
        {!isLoading && (error || !profile) && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4 border border-neutral-200">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Member Profile Unavailable</h2>
            <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
              {error || 'This member profile is either not published, archived, or does not exist.'}
            </p>
            <Button
              variant="dark"
              size="sm"
              onClick={onBackToDirectory}
              className="mt-6"
            >
              Return to Member Directory
            </Button>
          </div>
        )}

        {/* Full Member Profile & Public Portfolio */}
        {!isLoading && profile && (
          <div className="space-y-8">
            {/* 1. Profile Hero Header Card */}
            <div
              className={`bg-white rounded-2xl border p-6 sm:p-8 lg:p-10 shadow-xs transition-all ${
                isLeadership ? 'border-neutral-300 ring-1 ring-neutral-900/5' : 'border-neutral-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                {/* Avatar with leadership ring */}
                <div
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 shrink-0 bg-white ring-4 ${
                    isLeadership ? 'ring-neutral-900' : 'ring-neutral-200'
                  }`}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold text-2xl">
                      {profile.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || <User className="w-12 h-12" />}
                    </div>
                  )}
                </div>

                {/* Main Information */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                        {profile.fullName}
                      </h1>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                        <Badge variant={isLeadership ? 'leadership' : 'member'}>
                          {profile.designation}
                        </Badge>
                        {profile.classGrade && (
                          <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md">
                            Class {profile.classGrade}
                            {profile.section ? ` • Sec ${profile.section}` : ''}
                          </span>
                        )}
                        {profile.joiningDate && (
                          <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Member since {new Date(profile.joiningDate).getFullYear()}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Social & Portfolio External Links */}
                    <div className="flex items-center justify-center sm:justify-end gap-2 pt-2 sm:pt-0">
                      {profile.githubUrl && (
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                          title="GitHub Profile"
                          aria-label="GitHub Profile"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                          title="LinkedIn Profile"
                          aria-label="LinkedIn Profile"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {profile.websiteUrl && (
                        <a
                          href={profile.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                          title="Personal Website"
                          aria-label="Personal Website"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Short Introduction */}
                  {profile.bio && (
                    <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-3xl pt-1">
                      {profile.bio}
                    </p>
                  )}

                  {/* Quick Counters */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs font-semibold text-neutral-600 border-t border-neutral-100">
                    {profile.projects.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-pink-600" />
                        <span>{profile.projects.length} Published Projects</span>
                      </span>
                    )}
                    {profile.achievements.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>{profile.achievements.length} Honors & Awards</span>
                      </span>
                    )}
                    {profile.certificates.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-purple-600" />
                        <span>{profile.certificates.length} Verified Certificates</span>
                      </span>
                    )}
                    {profile.posts.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-neutral-700" />
                        <span>{profile.posts.length} Technical Posts</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Detailed About Statement (Only if exists) */}
            {profile.portfolioBio && profile.portfolioBio !== profile.bio && (
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 space-y-3">
                <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-pink-600" />
                  <span>About & Technical Focus</span>
                </h2>
                <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                  {profile.portfolioBio}
                </div>
              </div>
            )}

            {/* 3. Skills & Proficiencies (Only if skills exist) */}
            {profile.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <Code className="w-4 h-4 text-pink-600" />
                    <span>Technical Proficiencies & Skills</span>
                  </h2>
                  <span className="text-xs text-neutral-400 font-medium">
                    {profile.skills.length} verified competencies
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-800"
                    >
                      <span className="font-semibold">{skill.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-neutral-200/80 text-neutral-600 font-medium">
                        {skill.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Club & Academic Projects (Only if projects exist) */}
            {profile.projects.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Code className="w-5 h-5 text-pink-600" />
                    <span>Club & Academic Projects</span>
                  </h2>
                  <span className="text-xs font-semibold text-neutral-500">
                    {profile.projects.length} Projects
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs hover:shadow-sm hover:border-neutral-300 transition-all flex flex-col justify-between p-5 space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-neutral-900 text-base">
                              {proj.title}
                            </h3>
                            <p className="text-xs text-pink-600 font-semibold mt-0.5">
                              Role: {proj.roleInProject}
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {proj.status === 'completed' ? 'Completed' : 'Active'}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                          {proj.shortDescription}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-neutral-100 text-xs">
                        {proj.repoUrl && (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-600 hover:text-neutral-900 font-semibold inline-flex items-center gap-1"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Source</span>
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-700 font-semibold inline-flex items-center gap-1 ml-auto"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Public Achievements & Honors (Only if achievements exist) */}
            {profile.achievements.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>Public Achievements & Competition Honors</span>
                  </h2>
                  <span className="text-xs font-semibold text-neutral-500">
                    {profile.achievements.length} Honors
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm">
                            {ach.category}
                          </span>
                          <h3 className="font-bold text-neutral-900 text-sm mt-1.5">
                            {ach.title}
                          </h3>
                        </div>
                        <span className="text-xs text-neutral-400 font-medium shrink-0">
                          {ach.achievementDate ? new Date(ach.achievementDate).getFullYear() : ''}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {ach.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                        <span>Issued by: <strong>{ach.issuer}</strong></span>
                        {ach.proofUrl && (
                          <a
                            href={ach.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-700 font-semibold inline-flex items-center gap-1"
                          >
                            <span>Certificate Proof</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Verified Certificates (Only if certificates exist) */}
            {profile.certificates.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-purple-600" />
                    <span>Verified Academic & Event Certificates</span>
                  </h2>
                  <span className="text-xs font-semibold text-neutral-500">
                    {profile.certificates.length} Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verified Authenticity</span>
                        </div>
                        <h3 className="font-bold text-neutral-900 text-sm">
                          {cert.title}
                        </h3>
                        <p className="text-xs text-neutral-500">
                          {cert.issuerName} • {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : ''}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] text-neutral-600">
                          {cert.verificationCode}
                        </span>

                        {onNavigateVerifyCertificate ? (
                          <button
                            type="button"
                            onClick={() => onNavigateVerifyCertificate(cert.verificationCode)}
                            className="text-pink-600 hover:text-pink-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Verify Code</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : cert.fileUrl ? (
                          <a
                            href={cert.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-700 font-semibold inline-flex items-center gap-1"
                          >
                            <span>View PDF</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Approved Public Articles & Posts (Only if posts exist) */}
            {profile.posts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-neutral-700" />
                    <span>Technical Articles & Insights</span>
                  </h2>
                  <span className="text-xs font-semibold text-neutral-500">
                    {profile.posts.length} Published
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Published'}
                          </span>
                        </div>
                        <h3 className="font-bold text-neutral-900 text-sm">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-neutral-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPost(post)}
                          className="text-xs font-semibold text-pink-600 hover:text-pink-700 p-0"
                        >
                          Read Article →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Approved Public Videos (Only if videos exist) */}
            {profile.videos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-600" />
                    <span>Featured Demonstrations & Project Videos</span>
                  </h2>
                  <span className="text-xs font-semibold text-neutral-500">
                    {profile.videos.length} Videos
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.videos.map((vid) => (
                    <div
                      key={vid.id}
                      className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      {/* Video Thumbnail Area */}
                      <div
                        className="relative bg-neutral-900 h-36 flex items-center justify-center cursor-pointer group"
                        onClick={() => setSelectedVideo(vid)}
                      >
                        {vid.thumbnailUrl ? (
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                            <Video className="w-10 h-10 text-neutral-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                          <div className="w-11 h-11 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current ml-0.5 text-pink-600" />
                          </div>
                        </div>
                        {vid.durationSeconds && (
                          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-sm">
                            {Math.floor(vid.durationSeconds / 60)}:
                            {(vid.durationSeconds % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-neutral-900 text-sm line-clamp-1">
                          {vid.title}
                        </h3>
                        {vid.description && (
                          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                            {vid.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Read Article */}
        <Modal
          isOpen={Boolean(selectedPost)}
          onClose={() => setSelectedPost(null)}
          title={selectedPost?.title || 'Article'}
          size="lg"
        >
          {selectedPost && (
            <div className="space-y-4 text-neutral-800">
              <div className="flex items-center gap-2 text-xs text-neutral-400 pb-3 border-b border-neutral-100">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Published {selectedPost.publishedAt ? new Date(selectedPost.publishedAt).toLocaleDateString() : ''} by {profile?.fullName}
                </span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-line text-neutral-700">
                {selectedPost.content}
              </div>
              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedPost(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal: Watch Video */}
        <Modal
          isOpen={Boolean(selectedVideo)}
          onClose={() => setSelectedVideo(null)}
          title={selectedVideo?.title || 'Video Player'}
          size="lg"
        >
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
                {selectedVideo.videoUrl.includes('youtube') || selectedVideo.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={selectedVideo.videoUrl.replace('watch?v=', 'embed/')}
                    title={selectedVideo.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedVideo.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                )}
              </div>
              {selectedVideo.description && (
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {selectedVideo.description}
                </p>
              )}
              <div className="pt-3 border-t border-neutral-100 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedVideo(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
