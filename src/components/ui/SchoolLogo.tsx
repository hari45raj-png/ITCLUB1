/**
 * St. Mary's English School - IT Club Platform
 * Reusable School Crest & Brand Identity Logo Component
 * 
 * PROMPT 5: Authentic School Brand Presentation
 * 
 * Requirements:
 * - Prominent placement with clean white circular treatment
 * - Strong contrast & professional spacing
 * - Never distort or stretch
 * - CMS dynamic logo replacement ready without changing source code
 */

import React from 'react';
import { SCHOOL_BRAND } from '../../constants/branding';

interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  inverted?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  size = 'md',
  showText = true,
  inverted = false,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: {
      emblem: 'w-9 h-9 text-[8px]',
      title: 'text-xs sm:text-sm tracking-tight',
      subtitle: 'text-[10px] tracking-wider',
    },
    md: {
      emblem: 'w-11 h-11 text-[9px]',
      title: 'text-sm sm:text-base font-bold tracking-tight',
      subtitle: 'text-[11px] font-semibold tracking-wider',
    },
    lg: {
      emblem: 'w-14 h-14 text-[10px]',
      title: 'text-base sm:text-lg font-bold tracking-tight',
      subtitle: 'text-xs font-semibold tracking-wider',
    },
    xl: {
      emblem: 'w-20 h-20 text-xs',
      title: 'text-xl sm:text-2xl font-extrabold tracking-tight',
      subtitle: 'text-sm font-semibold tracking-wider',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Prominent White Circular Crest Container */}
      <div
        className={`${currentSize.emblem} rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm ring-2 ring-white/90 shrink-0 relative`}
      >
        {SCHOOL_BRAND.customLogoUrl ? (
          <img
            src={SCHOOL_BRAND.customLogoUrl}
            alt={SCHOOL_BRAND.schoolName}
            className="w-full h-full object-contain rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full rounded-full border border-neutral-200 bg-white flex flex-col items-center justify-center text-center p-0.5 shadow-2xs">
            <span className="font-extrabold tracking-tighter text-neutral-900 leading-none">
              SMES
            </span>
            <div className="w-3.5 h-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 my-0.5 rounded-full"></div>
            <span className="font-bold text-neutral-700 tracking-widest uppercase text-[65%] leading-none">
              IT
            </span>
          </div>
        )}
      </div>

      {/* Brand Typography Hierarchy: Official School Name + IT Club */}
      {showText && (
        <div className="flex flex-col justify-center min-w-0">
          <span
            className={`font-bold leading-tight uppercase tracking-tight truncate ${
              currentSize.title
            } ${inverted ? 'text-white' : 'text-neutral-950'}`}
          >
            {SCHOOL_BRAND.schoolName}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`font-semibold uppercase tracking-wider ${
                currentSize.subtitle
              } ${inverted ? 'text-neutral-300' : 'text-neutral-700'}`}
            >
              {SCHOOL_BRAND.clubName}
            </span>
            <span className={`text-[10px] hidden sm:inline ${inverted ? 'text-neutral-400' : 'text-neutral-400'}`}>
              • {SCHOOL_BRAND.establishedShort}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
