/**
 * St. Mary's English School - IT Club Platform
 * Master Footer Component
 * 
 * Official School Identity Presentation:
 * - ST. MARY'S ENGLISH SCHOOL
 * - IT CLUB
 * - Established in 2002
 * - Sheikhpura Road, Barbigha (Sheikhpura) Bihar - 811101
 * - CBSE Affiliation No.: 330509 | School Code: 65518 | UDISE Code: 10262909101
 */

import React from 'react';
import { SCHOOL_BRAND } from '../constants/branding';
import { SchoolLogo } from './ui/SchoolLogo';
import { MapPin, Shield, BookOpen, Award } from 'lucide-react';

interface FooterProps {
  onNavigate?: (section: string) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  return (
    <footer className="bg-[#0F1419] text-neutral-400 border-t border-neutral-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-10">
          {/* Col 1: School & Club Identity */}
          <div className="md:col-span-2 space-y-4">
            <SchoolLogo size="md" inverted showText />
            
            <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-md">
              The official technological society of {SCHOOL_BRAND.schoolName} ({SCHOOL_BRAND.establishedText}). Dedicated to computational problem solving, software engineering fundamentals, competitive programming, and ethical digital leadership.
            </p>

            <div className="space-y-1.5 text-xs text-neutral-300 pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{SCHOOL_BRAND.location}</span>
              </div>
            </div>

            {/* Official School Codes */}
            <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400 bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800 max-w-md">
              <span className="font-semibold text-neutral-200">CBSE Affiliation No.: {SCHOOL_BRAND.cbseAffiliationNo}</span>
              <span className="text-neutral-600">•</span>
              <span>School Code: <strong className="text-neutral-200 font-medium">{SCHOOL_BRAND.schoolCode}</strong></span>
              <span className="text-neutral-600">•</span>
              <span>UDISE Code: <strong className="text-neutral-200 font-medium">{SCHOOL_BRAND.udiseCode}</strong></span>
            </div>
          </div>

          {/* Col 2: Public Navigation & Directory */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Public Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer text-neutral-300"
                >
                  Home & Highlights
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('members')}
                  className="hover:text-white transition-colors cursor-pointer text-neutral-300"
                >
                  Member Directory & Portfolios
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('events')}
                  className="hover:text-white transition-colors cursor-pointer text-neutral-300"
                >
                  Academic Schedule & Events
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('notices')}
                  className="hover:text-white transition-colors cursor-pointer text-neutral-300"
                >
                  Circulars & Bulletins
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('gallery')}
                  className="hover:text-white transition-colors cursor-pointer text-neutral-300"
                >
                  Photo Archives
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer text-neutral-300"
                >
                  About & School Identity
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Computing & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Student Computing
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('learning-hub')}
                  className="hover:text-white transition-colors cursor-pointer text-neutral-300 inline-flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Curriculum & Learning Hub</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('certificates')}
                  className="hover:text-white transition-colors cursor-pointer text-neutral-300 inline-flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Certificate Registry</span>
                </button>
              </li>
              <li className="pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Authorized Faculty Clearance &rarr;</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Institutional Integrity & Copyright */}
        <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-400">
          <p>
            © {new Date().getFullYear()} {SCHOOL_BRAND.schoolName} — {SCHOOL_BRAND.clubName}. {SCHOOL_BRAND.establishedText}.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span>Motto: <strong className="text-neutral-200 font-medium">{SCHOOL_BRAND.motto}</strong></span>
            <span>•</span>
            <span className="text-neutral-400">CBSE Affiliated Academic Society</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
