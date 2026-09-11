/**
 * St. Mary's English School - IT Club Platform
 * Public Website Layout & Experience
 * 
 * PROMPT 5: Academic Public Portal Foundation
 * 
 * Requirements:
 * - Effortless visitor browsing (view-only, zero edit/delete controls)
 * - Coherent school branding (Crimson Red, Deep Navy, White, Charcoal)
 * - Dynamic Member Directory with leadership hierarchy
 * - Public Member Portfolio Lightbox (zero leaked credentials)
 * - Events, Notices, and Gallery sections
 */

import React, { useState, useEffect } from 'react';
import { SCHOOL_BRAND } from '../../constants/branding';
import { SchoolLogo } from '../ui/SchoolLogo';
import { ProfileCard } from '../ui/ProfileCard';
import { EventCard, EventData } from '../ui/EventCard';
import { NoticeCard, NoticeData } from '../ui/NoticeCard';
import { GalleryCard, GalleryItemData } from '../ui/GalleryCard';
import { SearchControl } from '../ui/SearchControl';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MemberService } from '../../services/memberService';
import { PublicMemberSummary } from '../../types/member';
import {
  Calendar,
  Users,
  Bell,
  Image as ImageIcon,
  Award,
  Code,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface PublicWebsiteViewProps {
  onOpenLogin: () => void;
  onNavigateSection?: (section: string) => void;
  onSelectMember?: (slug: string) => void;
}

const SAMPLE_EVENTS: EventData[] = [
  {
    id: 'e-1',
    title: 'Inter-School Hackathon & Algorithmic Challenge 2026',
    date: '2026-10-15T09:00:00Z',
    time: '09:00 AM - 04:30 PM',
    venue: 'Senior Computer Laboratory 1 & 2',
    description: 'A 6-hour collaborative coding competition featuring algorithmic problem solving, web engineering, and open-source innovations.',
    status: 'upcoming',
    category: 'Competitive Programming',
  },
  {
    id: 'e-2',
    title: 'CBSE Computer Applications Model Exam & Review',
    date: '2026-10-28T10:00:00Z',
    time: '10:00 AM - 12:30 PM',
    venue: 'Academic Auditorium',
    description: 'Comprehensive mock examination session covering CBSE curriculum concepts, algorithmic problem solving, and board exam preparation.',
    status: 'upcoming',
    category: 'Curriculum Exam',
  },
  {
    id: 'e-3',
    title: 'Full-Stack Web Development Boot Camp',
    date: '2026-08-12T13:00:00Z',
    time: '01:00 PM - 03:30 PM',
    venue: 'IT Multimedia Center',
    description: 'Hands-on practical session introducing relational databases, modern responsive layouts, and Supabase integration fundamentals.',
    status: 'completed',
    category: 'Technical Workshop',
  },
];

const SAMPLE_NOTICES: NoticeData[] = [
  {
    id: 'n-1',
    title: 'Schedule for Annual IT Club Executive Council Elections',
    content: 'Nominations are formally invited from students of Classes 10 to 12 for the posts of President, Vice President, and Technical Lead for the 2026-2027 academic session.',
    publishedAt: '2026-09-08T08:30:00Z',
    isPinned: true,
    priority: 'urgent',
    hasAttachments: true,
    attachmentCount: 2,
  },
  {
    id: 'n-2',
    title: 'Model Question Papers for Class 10 Pre-Board Computer Applications',
    content: 'The official IT Club question bank and solution keys for Section A and Section B programs are now available for registered student members.',
    publishedAt: '2026-09-05T11:00:00Z',
    isPinned: false,
    priority: 'academic',
    hasAttachments: true,
    attachmentCount: 1,
  },
  {
    id: 'n-3',
    title: 'Laboratory Maintenance & System Upgrade Window',
    content: 'Senior Computer Lab 1 will undergo scheduled operating system maintenance this Saturday from 2:00 PM to 6:00 PM.',
    publishedAt: '2026-09-01T14:15:00Z',
    isPinned: false,
    priority: 'general',
  },
];

const SAMPLE_GALLERY: GalleryItemData[] = [
  {
    id: 'g-1',
    title: 'State Championship Hackathon Delegation',
    category: 'Hackathon',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    eventDate: 'August 2026',
  },
  {
    id: 'g-2',
    title: 'Robotics & Microcontroller Workshop',
    category: 'Workshop',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    eventDate: 'July 2026',
  },
  {
    id: 'g-3',
    title: 'Junior Coding Circle Mentorship Session',
    category: 'Mentorship',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    eventDate: 'June 2026',
  },
];

export const PublicWebsiteView: React.FC<PublicWebsiteViewProps> = ({
  onOpenLogin,
  onNavigateSection,
  onSelectMember,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'leadership' | 'class12' | 'class11' | 'class10'>('all');
  const [members, setMembers] = useState<PublicMemberSummary[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(true);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItemData | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMembers = async () => {
      setIsLoadingMembers(true);
      try {
        const res = await MemberService.getPublicMembers();
        if (isMounted && res.success && res.data) {
          setMembers(res.data);
        }
      } catch (err) {
        // graceful fallback to empty
      } finally {
        if (isMounted) setIsLoadingMembers(false);
      }
    };
    fetchMembers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter members dynamically from actual database records
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (memberFilter === 'leadership') return m.designationLevel === 'leadership';
    if (memberFilter === 'class12') return m.classGrade === '12';
    if (memberFilter === 'class11') return m.classGrade === '11';
    if (memberFilter === 'class10') return m.classGrade === '10';
    return true;
  });

  const handleMemberCardClick = (item: any) => {
    if (onSelectMember) {
      onSelectMember(item.slug || MemberService.generateSlug(item.fullName, item.classGrade));
    } else if (onNavigateSection) {
      onNavigateSection('members');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Academic Hero Section (Clean White/Neutral with Charcoal & Pink Accent) */}
      <section className="relative bg-white text-neutral-900 overflow-hidden py-16 sm:py-24 border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200/90 text-xs font-medium text-neutral-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600"></span>
              <span>{SCHOOL_BRAND.schoolName} • {SCHOOL_BRAND.establishedText}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-neutral-900">
              Cultivating Algorithmic Logic & Digital Excellence
            </h1>

            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              Welcome to the official technical home of the {SCHOOL_BRAND.clubName}. We empower students from Classes 8 through 12 to master computer science fundamentals, construct full-stack projects, and excel in competitive examinations.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="dark"
                onClick={() => {
                  const el = document.getElementById('members-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="shadow-xs"
              >
                Browse Member Directory
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenLogin()}
              >
                Student Member Portal &rarr;
              </Button>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-neutral-100 text-xs">
              {SCHOOL_BRAND.pillars.map((p, i) => (
                <div key={i} className="space-y-1">
                  <h4 className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-pink-600" />
                    <span>{p.title}</span>
                  </h4>
                  <p className="text-neutral-500 text-[11px] leading-normal">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Public Member Directory Section */}
      <section id="members-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-600">
              <Users className="w-4 h-4" />
              <span>Public Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Club Members & Leadership Council
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Database-driven member roster featuring student achievements, leadership designations, and verified portfolio projects.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {[
              { id: 'all', label: 'All Members' },
              { id: 'leadership', label: 'Executive Council' },
              { id: 'class12', label: 'Class 12' },
              { id: 'class11', label: 'Class 11' },
              { id: 'class10', label: 'Class 10' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setMemberFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  memberFilter === f.id
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Member Search Control */}
        <SearchControl
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter members by name, leadership designation, or skills..."
        />

        {/* Members Grid (Responsive, Accessible) */}
        {isLoadingMembers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200/80 p-5 h-56 space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-200" />
                <div className="h-4 bg-neutral-200 rounded w-1/2" />
                <div className="h-3 bg-neutral-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 text-neutral-500 space-y-3 max-w-lg mx-auto shadow-2xs">
            <Users className="w-10 h-10 mx-auto stroke-1 text-neutral-400" />
            <h3 className="text-base font-bold text-neutral-900">
              {searchQuery ? `No club members matching "${searchQuery}"` : 'No Published Member Profiles Available Yet'}
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {searchQuery
                ? 'Try adjusting your search criteria or clearing filters.'
                : 'Active IT Club student profiles will appear here once verified by the faculty moderator.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.slice(0, 6).map((member) => (
                <ProfileCard
                  key={member.id}
                  member={member}
                  onViewProfile={handleMemberCardClick}
                />
              ))}
            </div>

            {onNavigateSection && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => onNavigateSection('members')}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Complete Member Directory ({members.length} Members)
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Upcoming Events & Competitions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-600">
              <Calendar className="w-4 h-4" />
              <span>Academic Schedule</span>
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              Upcoming Events & Competitions
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_EVENTS.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* 4. Official Notices & Circulars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-600">
              <Bell className="w-4 h-4" />
              <span>Official Circulars</span>
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              Announcements & Examination Bulletins
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_NOTICES.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      </section>

      {/* 5. Photo & Media Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-600">
              <ImageIcon className="w-4 h-4" />
              <span>Media Archives</span>
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              Life at St. Mary's IT Club
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {SAMPLE_GALLERY.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
              onOpenLightbox={(g) => setSelectedGalleryItem(g)}
            />
          ))}
        </div>
      </section>

      {/* 6. Gallery Lightbox Modal */}
      {selectedGalleryItem && (
        <Modal
          isOpen={Boolean(selectedGalleryItem)}
          onClose={() => setSelectedGalleryItem(null)}
          title={selectedGalleryItem.title}
          maxWidth="lg"
        >
          <div className="space-y-3">
            <div className="aspect-16/10 w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={selectedGalleryItem.imageUrl}
                alt={selectedGalleryItem.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Category: <strong>{selectedGalleryItem.category}</strong></span>
              <span>{selectedGalleryItem.eventDate}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
