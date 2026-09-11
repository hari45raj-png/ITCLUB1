/**
 * St. Mary's English School - IT Club Platform
 * Master Global Navigation & Header Foundation
 * 
 * PROMPT 5: Academic School-Branded Header & Navigation
 * 
 * Specification:
 * - Prominent School Crest Logo (clean white circular emblem)
 * - Clean desktop layout without overcrowding (uses dropdowns for secondary academic modules)
 * - Side-placed Admin access button following strict flow:
 *     Visitor -> Member Authentication -> Admin Verification -> Admin Control Center
 * - Member Login UI trigger (Applicant Number + Member Password)
 * - Mobile responsive drawer with >= 44px touch targets
 */

import React, { useState } from 'react';
import {
  Menu,
  X,
  Shield,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Search,
  BookOpen,
  Calendar,
  Image as ImageIcon,
  Bell,
  Layers,
  Award,
  FileText,
  FileQuestion,
  HelpCircle,
  FolderCode,
} from 'lucide-react';
import { SCHOOL_BRAND } from '../constants/branding';
import { SchoolLogo } from './ui/SchoolLogo';
import { useAuth } from './auth/AuthProvider';

interface HeaderProps {
  activeTier: 'public' | 'member' | 'admin';
  onTierChange: (tier: 'public' | 'member' | 'admin') => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onOpenLogin: () => void;
  onOpenAdminAuth: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTier,
  onTierChange,
  activeSection,
  onSectionChange,
  onOpenLogin,
  onOpenAdminAuth,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [architectureDropdownOpen, setArchitectureDropdownOpen] = useState(false);
  const { user, role, signOut } = useAuth();

  // Primary visible links on desktop
  const primaryNav = [
    { id: 'home', label: 'Home' },
    { id: 'members', label: 'Members' },
    { id: 'events', label: 'Events' },
    { id: 'notices', label: 'Notices' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'about', label: 'About' },
  ];

  // Secondary academic resources accessible via "Academics" dropdown
  const academicNav = [
    { id: 'learning-hub', label: 'Learning Hub', icon: BookOpen },
    { id: 'projects', label: 'Projects & Repos', icon: FolderCode },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'resources', label: 'Study Resources', icon: FileText },
    { id: 'quizzes', label: 'Technical Quizzes', icon: HelpCircle },
    { id: 'question-papers', label: 'Model Question Papers', icon: FileQuestion },
    { id: 'certificates', label: 'Certificate Registry', icon: Award },
  ];

  const handleAdminClick = () => {
    // If not authenticated, open login first with guidance; if authenticated, open admin passcode modal
    if (!user) {
      onOpenLogin();
    } else {
      onOpenAdminAuth();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md text-neutral-900 border-b border-neutral-200/90 shadow-2xs">
      {/* Top Banner: Official School Identity, Establishment & Affiliation */}
      <div className="bg-neutral-50/90 border-b border-neutral-200/70 px-4 sm:px-8 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-neutral-600">
            <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500"></span>
            <span className="font-bold text-neutral-900 tracking-tight">
              {SCHOOL_BRAND.schoolName}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-600 font-medium">
              {SCHOOL_BRAND.establishedShort}
            </span>
            <span className="text-neutral-300 hidden md:inline">•</span>
            <span className="text-neutral-500 hidden md:inline text-[11px]">
              {SCHOOL_BRAND.affiliation}
            </span>
          </div>

          {/* Tier Access Indicator */}
          <div className="flex items-center space-x-1 bg-neutral-200/60 rounded-full p-0.5 border border-neutral-200 text-[11px]">
            <button
              id="tier-btn-public"
              type="button"
              onClick={() => onTierChange('public')}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition-colors cursor-pointer ${
                activeTier === 'public'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Public
            </button>
            <button
              id="tier-btn-member"
              type="button"
              onClick={() => onTierChange('member')}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition-colors cursor-pointer ${
                activeTier === 'member'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Member
            </button>
            <button
              id="tier-btn-admin"
              type="button"
              onClick={() => {
                if (user && role === 'admin') {
                  onTierChange('admin');
                } else {
                  handleAdminClick();
                }
              }}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition-colors cursor-pointer ${
                activeTier === 'admin'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-6">
        {/* Brand & Crest Logo */}
        <SchoolLogo
          size="md"
          inverted={false}
          onClick={() => onSectionChange('home')}
          className="cursor-pointer shrink-0"
        />

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          <nav className="flex items-center gap-1">
            {primaryNav.map((link) => (
              <button
                id={`nav-link-${link.id}`}
                key={link.id}
                type="button"
                onClick={() => onSectionChange(link.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                  activeSection === link.id
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Academics Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                  academicNav.some((n) => n.id === activeSection)
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
              >
                <span>Academics</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {moreDropdownOpen && (
                <div
                  onMouseLeave={() => setMoreDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-56 rounded-2xl bg-white border border-neutral-200 shadow-xl py-1.5 z-50 divide-y divide-neutral-100"
                >
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Academic Resources
                  </div>
                  <div className="py-1">
                    {academicNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onSectionChange(item.id);
                            setMoreDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-neutral-50 transition-colors cursor-pointer ${
                            activeSection === item.id ? 'text-pink-600 font-bold bg-pink-50/50' : 'text-neutral-700'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Action Bar: Search, Member Auth & Understated Admin Button */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Quick Search Button */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Search IT Club Platform"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Member Login / Profile Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onTierChange('member')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer border border-neutral-200"
              >
                <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white">
                  {user.email?.slice(0, 1).toUpperCase()}
                </div>
                <span className="truncate max-w-[90px]">Member</span>
              </button>

              <button
                type="button"
                onClick={() => signOut()}
                className="p-1.5 rounded-full text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="header-member-login-btn"
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-neutral-500" />
              <span>Member Login</span>
            </button>
          )}

          {/* Dedicated Admin Button: Understated, visible at side of navigation as clean dark pill */}
          <button
            id="header-admin-entry-btn"
            type="button"
            onClick={handleAdminClick}
            className="bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-all cursor-pointer shadow-2xs"
            title="Administrator Access Entry Point"
          >
            <Shield className="w-3.5 h-3.5 text-neutral-300" />
            <span>Admin</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {user ? (
            <button
              type="button"
              onClick={() => onTierChange('member')}
              className="px-2.5 py-1.5 rounded-full text-neutral-800 bg-neutral-100 text-xs font-semibold border border-neutral-200"
            >
              Member
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-2.5 py-1.5 text-xs rounded-full bg-neutral-900 text-white font-semibold"
            >
              Login
            </button>
          )}

          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Responsive, Touch Targets >= 44px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-200 px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto shadow-lg">
          {/* Mobile Search button */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs flex items-center gap-2 min-h-[44px]"
            >
              <Search className="w-4 h-4 text-neutral-400" />
              <span>Search platform...</span>
            </button>
          )}

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1">
              Navigation
            </div>
            {primaryNav.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  onSectionChange(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] flex items-center ${
                  activeSection === link.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-2 border-t border-neutral-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1">
              Academics & Resources
            </div>
            {academicNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSectionChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-colors min-h-[44px] flex items-center justify-between ${
                  activeSection === item.id ? 'text-pink-600 bg-pink-50 font-bold' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Admin Entry in mobile drawer */}
          <div className="pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleAdminClick();
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white flex items-center justify-between min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-neutral-300" />
                <span>Admin Clearance Flow</span>
              </span>
              <span className="text-[10px] text-neutral-400">Restricted</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
