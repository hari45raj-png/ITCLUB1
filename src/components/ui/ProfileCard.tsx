/**
 * St. Mary's English School - IT Club Platform
 * Member Directory & Profile Card Foundation
 * 
 * PROMPT 7: Member Directory Profile Card
 * 
 * Specification:
 * - Dynamic / Database-driven designations (President, Vice President, Secretary, Member)
 * - Clear leadership hierarchy without visual excess
 * - Photo, Class, Section, Skills chips, Short bio
 * - Zero exposure of private credentials, passwords, or applicant numbers
 * - Clean neutral fallback avatar (no fake AI identity images)
 * - Accessible focus, keyboard navigation, and touch targets
 */

import React from 'react';
import { Badge } from './Badge';
import { Award, Code, ExternalLink, User } from 'lucide-react';
import { PublicMemberSummary } from '../../types/member';

export interface LegacyMemberProfileData {
  id: string;
  fullName: string;
  designation: string;
  isLeadership?: boolean;
  classGrade?: string | null;
  section?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  skills: string[];
  projectCount?: number;
  achievementCount?: number;
  slug?: string;
}

export type ProfileCardData = PublicMemberSummary | LegacyMemberProfileData;

export interface ProfileCardProps {
  member: ProfileCardData;
  onViewProfile?: (member: ProfileCardData) => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  member,
  onViewProfile,
  className = '',
}) => {
  const isLeadershipRole =
    ('designationLevel' in member && member.designationLevel === 'leadership') ||
    Boolean(member.isLeadership) ||
    ['President', 'Vice President', 'Secretary'].includes(member.designation);

  const handleClick = () => {
    if (onViewProfile) {
      onViewProfile(member);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      id={`member-card-${member.id}`}
      tabIndex={onViewProfile ? 0 : undefined}
      role={onViewProfile ? 'button' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group bg-white rounded-xl border transition-all duration-200 p-5 flex flex-col justify-between text-left ${
        onViewProfile ? 'cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-pink-500/20' : ''
      } ${
        isLeadershipRole
          ? 'border-neutral-300 shadow-xs hover:border-neutral-400 hover:shadow-md'
          : 'border-neutral-200 shadow-2xs hover:border-neutral-300 hover:shadow-xs'
      } ${className}`}
    >
      <div className="space-y-4">
        {/* Top Header: Avatar & Designation */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Clean circular avatar with brand ring and neutral fallback */}
            <div
              className={`w-13 h-13 rounded-full flex items-center justify-center p-0.5 shrink-0 bg-white ring-2 ${
                isLeadershipRole ? 'ring-purple-500' : 'ring-neutral-200'
              }`}
            >
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={`${member.fullName} - ${member.designation}`}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold text-sm">
                  {member.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || <User className="w-6 h-6 text-neutral-400" />}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-neutral-900 text-base leading-tight group-hover:text-pink-600 transition-colors">
                {member.fullName}
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                {member.classGrade ? `Class ${member.classGrade}` : 'Student Member'}
                {member.section ? ` • Sec ${member.section}` : ''}
              </p>
            </div>
          </div>

          <Badge variant={isLeadershipRole ? 'leadership' : 'member'} size="sm">
            {member.designation}
          </Badge>
        </div>

        {/* Bio Excerpt */}
        {member.bio && (
          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
            {member.bio}
          </p>
        )}

        {/* Skills Chips */}
        {member.skills && member.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {member.skills.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200/80"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 4 && (
              <span className="text-[10px] text-neutral-400 font-medium px-1.5 py-0.5">
                +{member.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Metrics & Action */}
      <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
          {member.projectCount !== undefined && member.projectCount > 0 && (
            <span className="flex items-center gap-1" title={`${member.projectCount} Projects`}>
              <Code className="w-3.5 h-3.5 text-neutral-400" />
              <span>{member.projectCount}</span>
            </span>
          )}
          {member.achievementCount !== undefined && member.achievementCount > 0 && (
            <span className="flex items-center gap-1" title={`${member.achievementCount} Achievements`}>
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{member.achievementCount}</span>
            </span>
          )}
        </div>

        {onViewProfile && (
          <span className="text-xs font-semibold text-neutral-900 group-hover:text-pink-600 inline-flex items-center gap-1 transition-colors min-h-[32px]">
            <span>Portfolio</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        )}
      </div>
    </div>
  );
};
