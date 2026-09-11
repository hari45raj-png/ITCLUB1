/**
 * St. Mary's English School - IT Club Platform
 * Public Member Directory View (/members)
 * 
 * PROMPT 7: Complete Member Directory & Leadership Hierarchy
 * 
 * Features:
 * - Direct query from Supabase database via MemberService
 * - Leadership Council hierarchy (President, Vice President, Secretary)
 * - Filtering by Name, Designation, Class, Section, and Skills
 * - Absolute Public/Private Separation (Zero passwords or auth secrets)
 * - Clean empty state when no members exist in database
 * - Accessible touch targets, keyboard navigation, and responsive grid
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MemberService } from '../../services/memberService';
import { PublicMemberSummary, Designation, MemberDirectoryFilters } from '../../types/member';
import { ProfileCard, ProfileCardData } from '../ui/ProfileCard';
import { SearchControl } from '../ui/SearchControl';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Users,
  Shield,
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  GraduationCap,
  Award,
  X,
  UserCheck,
} from 'lucide-react';

interface MemberDirectoryViewProps {
  onSelectMember: (slug: string) => void;
  onNavigateHome?: () => void;
}

export const MemberDirectoryView: React.FC<MemberDirectoryViewProps> = ({
  onSelectMember,
  onNavigateHome,
}) => {
  const [members, setMembers] = useState<PublicMemberSummary[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');

  // Load database members and designations
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [membersRes, designationsRes] = await Promise.all([
        MemberService.getPublicMembers(),
        MemberService.getDesignations(),
      ]);

      if (membersRes.success && membersRes.data) {
        setMembers(membersRes.data);
      } else {
        setError(membersRes.error?.message || 'Unable to load member directory.');
      }

      if (designationsRes.success && designationsRes.data) {
        setDesignations(designationsRes.data);
      }
    } catch (err) {
      setError('A connection error occurred while querying member records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dynamically extract classes, sections, and available skills
  const { classes, sections, availableSkills } = useMemo(() => {
    const classSet = new Set<string>();
    const sectionSet = new Set<string>();
    const skillSet = new Set<string>();

    members.forEach((m) => {
      if (m.classGrade) classSet.add(m.classGrade);
      if (m.section) sectionSet.add(m.section);
      m.skills.forEach((s) => skillSet.add(s));
    });

    return {
      classes: Array.from(classSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      sections: Array.from(sectionSet).sort(),
      availableSkills: Array.from(skillSet).sort(),
    };
  }, [members]);

  // Client-side filtering across active members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // 1. Designation filter
      if (selectedDesignation === 'leadership') {
        if (m.designationLevel !== 'leadership') return false;
      } else if (selectedDesignation === 'members') {
        if (m.designationLevel === 'leadership') return false;
      } else if (selectedDesignation !== 'all') {
        if (m.designation.toLowerCase() !== selectedDesignation.toLowerCase()) return false;
      }

      // 2. Class filter
      if (selectedClass !== 'all' && m.classGrade !== selectedClass) {
        return false;
      }

      // 3. Section filter
      if (selectedSection !== 'all' && m.section !== selectedSection) {
        return false;
      }

      // 4. Skill filter
      if (selectedSkill !== 'all') {
        const hasSkill = m.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase());
        if (!hasSkill) return false;
      }

      // 5. Search text filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.fullName.toLowerCase().includes(q);
        const matchesDesignation = m.designation.toLowerCase().includes(q);
        const matchesBio = m.bio ? m.bio.toLowerCase().includes(q) : false;
        const matchesClass = m.classGrade ? m.classGrade.toLowerCase().includes(q) : false;
        const matchesSection = m.section ? m.section.toLowerCase().includes(q) : false;
        const matchesSkill = m.skills.some((s) => s.toLowerCase().includes(q));

        if (!matchesName && !matchesDesignation && !matchesBio && !matchesClass && !matchesSection && !matchesSkill) {
          return false;
        }
      }

      return true;
    });
  }, [members, selectedDesignation, selectedClass, selectedSection, selectedSkill, searchQuery]);

  // Split into leadership vs general members for hierarchical display
  const { leadershipMembers, generalMembers } = useMemo(() => {
    const leadership = filteredMembers.filter((m) => m.designationLevel === 'leadership');
    const general = filteredMembers.filter((m) => m.designationLevel !== 'leadership');
    return { leadershipMembers: leadership, generalMembers: general };
  }, [filteredMembers]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedDesignation !== 'all' ||
    selectedClass !== 'all' ||
    selectedSection !== 'all' ||
    selectedSkill !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDesignation('all');
    setSelectedClass('all');
    setSelectedSection('all');
    setSelectedSkill('all');
  };

  const handleCardSelect = (item: ProfileCardData) => {
    if ('slug' in item && item.slug) {
      onSelectMember(item.slug);
    } else {
      onSelectMember(MemberService.generateSlug(item.fullName, item.classGrade));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Breadcrumb & Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            {onNavigateHome ? (
              <button
                type="button"
                onClick={onNavigateHome}
                className="hover:text-neutral-900 cursor-pointer transition-colors"
              >
                Home
              </button>
            ) : (
              <span>Home</span>
            )}
            <span>/</span>
            <span className="text-neutral-900 font-semibold">Member Directory</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200/90 text-neutral-700 text-xs font-medium mb-2 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-pink-600" />
                <span>Authorized Student Roster</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                IT Club Member Directory
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-2xl leading-relaxed">
                Meet the verified student innovators, competitive programmers, and technical leadership council of St. Mary's English School.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={isLoading}
                icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="member-search-input" className="sr-only">
                Search Members
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="member-search-input"
                  type="text"
                  placeholder="Search by name, skills, bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-neutral-300 hover:border-neutral-400 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-neutral-900 transition-all min-h-[44px]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Designation Select */}
            <div className="lg:col-span-3">
              <label htmlFor="designation-filter" className="sr-only">
                Filter by Designation
              </label>
              <select
                id="designation-filter"
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 hover:border-neutral-400 rounded-xl text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-neutral-900 transition-all min-h-[44px] cursor-pointer"
              >
                <option value="all">All Positions & Roles</option>
                <option value="leadership">Leadership Council Only</option>
                <option value="members">General Members Only</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.title}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Grade Select */}
            <div className="lg:col-span-2">
              <label htmlFor="class-filter" className="sr-only">
                Filter by Class
              </label>
              <select
                id="class-filter"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 hover:border-neutral-400 rounded-xl text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-neutral-900 transition-all min-h-[44px] cursor-pointer"
              >
                <option value="all">All Classes</option>
                {classes.length > 0 ? (
                  classes.map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="12">Class 12</option>
                    <option value="11">Class 11</option>
                    <option value="10">Class 10</option>
                    <option value="9">Class 9</option>
                  </>
                )}
              </select>
            </div>

            {/* Section Select */}
            <div className="lg:col-span-1">
              <label htmlFor="section-filter" className="sr-only">
                Filter by Section
              </label>
              <select
                id="section-filter"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 hover:border-neutral-400 rounded-xl text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-neutral-900 transition-all min-h-[44px] cursor-pointer"
              >
                <option value="all">Sec</option>
                {sections.length > 0 ? (
                  sections.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </>
                )}
              </select>
            </div>

            {/* Skill Select */}
            <div className="lg:col-span-2">
              <label htmlFor="skill-filter" className="sr-only">
                Filter by Skill
              </label>
              <select
                id="skill-filter"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 hover:border-neutral-400 rounded-xl text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-pink-500/20 focus:border-neutral-900 transition-all min-h-[44px] cursor-pointer"
              >
                <option value="all">All Skills</option>
                {availableSkills.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Chips & Clear Action */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-neutral-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-neutral-500 font-medium">
                Showing{' '}
                <strong className="text-neutral-900 font-bold">
                  {filteredMembers.length}
                </strong>{' '}
                of {members.length} {members.length === 1 ? 'member' : 'members'}
              </span>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 ml-2">
                  {selectedDesignation !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium">
                      Role: {selectedDesignation}
                      <button
                        type="button"
                        onClick={() => setSelectedDesignation('all')}
                        className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedClass !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium">
                      Class: {selectedClass}
                      <button
                        type="button"
                        onClick={() => setSelectedClass('all')}
                        className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedSkill !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium">
                      Skill: {selectedSkill}
                      <button
                        type="button"
                        onClick={() => setSelectedSkill('all')}
                        className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-pink-600 hover:text-pink-700 font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
              >
                <span>Clear all filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-neutral-200/80 p-5 h-60 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-full bg-neutral-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-neutral-200 rounded-sm w-3/4" />
                    <div className="h-3 bg-neutral-100 rounded-sm w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-neutral-100 rounded-sm" />
                <div className="h-4 bg-neutral-200 rounded-sm w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <Shield className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h3 className="font-bold text-base">Directory Query Error</h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="mt-4 border-rose-300 text-rose-800 hover:bg-rose-100"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Clean Empty State: No Published Members in Database */}
        {!isLoading && !error && members.length === 0 && (
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-10 sm:p-14 text-center max-w-xl mx-auto shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4 border border-neutral-200">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
              No Published Member Profiles Available Yet
            </h3>
            <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
              Official student memberships and club leadership portfolios will appear here once registered and verified by the faculty moderator.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-medium">
              <Shield className="w-4 h-4 text-neutral-400" />
              <span>Database query verified: 0 active public profiles</span>
            </div>
          </div>
        )}

        {/* Filter Zero Matches */}
        {!isLoading && !error && members.length > 0 && filteredMembers.length === 0 && (
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-10 text-center max-w-md mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto mb-3 border border-neutral-200">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 text-base">No Matching Members Found</h3>
            <p className="text-xs text-neutral-600 mt-1">
              No member profiles match your current search and filter combination.
            </p>
            <Button
              variant="dark"
              size="sm"
              onClick={clearFilters}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Content Render: Hierarchy sections */}
        {!isLoading && !error && filteredMembers.length > 0 && (
          <div className="space-y-10">
            {/* 1. Leadership Council Section */}
            {leadershipMembers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-200/80">
                  <div className="w-2 h-2 rounded-full bg-neutral-900" />
                  <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                    <span>Leadership Council</span>
                    <Badge variant="leadership" size="sm">
                      Executive Committee
                    </Badge>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {leadershipMembers.map((member) => (
                    <ProfileCard
                      key={member.id}
                      member={member}
                      onViewProfile={handleCardSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. General Members Section */}
            {generalMembers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-200/80">
                  <div className="w-2 h-2 rounded-full bg-neutral-400" />
                  <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                    <span>Active Student Members</span>
                    <span className="text-xs font-semibold text-neutral-400">
                      ({generalMembers.length})
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generalMembers.map((member) => (
                    <ProfileCard
                      key={member.id}
                      member={member}
                      onViewProfile={handleCardSelect}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
