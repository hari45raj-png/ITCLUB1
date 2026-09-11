/**
 * St. Mary's English School - IT Club Platform
 * Master Application Coordinator & Layout Shell
 * 
 * PROMPT 5: School Branding, Design System & UI/UX Foundation
 * 
 * Responsibilities:
 * - Seamless navigation across Public Website, Member Area, and Admin Center
 * - Enforces authentication hierarchy:
 *     Visitor -> Member Authentication -> Admin Passcode Verification -> Admin Control Center
 * - Integrated School Crest & Branding Foundation
 * - Full backward compatibility with Prompts 1-4 Architecture Consoles
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginModal } from './components/auth/LoginModal';
import { AdminVerificationModal } from './components/auth/AdminVerificationModal';
import { GlobalSearchModal } from './components/views/GlobalSearchModal';
import { PublicWebsiteView } from './components/views/PublicWebsiteView';
import { MemberDirectoryView } from './components/members/MemberDirectoryView';
import { MemberProfileView } from './components/members/MemberProfileView';
import { MemberPortalView } from './components/views/MemberPortalView';
import { AdminControlCenterView } from './components/views/AdminControlCenterView';
import { DesignSystemShowcase } from './components/views/DesignSystemShowcase';
import { ArchitectureDashboard } from './components/ArchitectureDashboard';
import { Button } from './components/ui/Button';
import { Shield, Lock, LogIn, UserCheck } from 'lucide-react';
import { SCHOOL_BRAND } from './constants/branding';

function AppContent() {
  const { user, role } = useAuth();
  const [activeTier, setActiveTier] = useState<'public' | 'member' | 'admin'>('public');
  const [activeSection, setActiveSection] = useState<string>('home');
  const [selectedMemberSlug, setSelectedMemberSlug] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminVerifyModalOpen, setIsAdminVerifyModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  // Sections that belong to the underlying Prompts 1-4 technical architecture consoles
  const architectureSections = [
    'storage',
    'security',
    'database',
    'overview',
    'architecture',
    'roles',
    'components',
    'roadmap',
    'diagnostics',
  ];

  const handleTierChange = (tier: 'public' | 'member' | 'admin') => {
    if (tier === 'admin') {
      if (!user) {
        setIsLoginModalOpen(true);
        return;
      }
      if (!isAdminVerified) {
        setIsAdminVerifyModalOpen(true);
        return;
      }
    }
    setActiveTier(tier);
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminVerified(true);
    setActiveTier('admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-neutral-900 antialiased font-sans">
      {/* Global Header & Navigation */}
      <Header
        activeTier={activeTier}
        onTierChange={handleTierChange}
        activeSection={activeSection}
        onSectionChange={(sec) => {
          setActiveSection(sec);
          if (sec !== 'member-profile') {
            setSelectedMemberSlug(null);
          }
          if (sec === 'home' || sec === 'members' || sec === 'member-profile' || sec === 'events' || sec === 'notices' || sec === 'gallery' || sec === 'about') {
            setActiveTier('public');
          }
        }}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAdminAuth={() => {
          if (!user) {
            setIsLoginModalOpen(true);
          } else {
            setIsAdminVerifyModalOpen(true);
          }
        }}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-12">
        {/* Tier 1: Public Website Portal */}
        {activeTier === 'public' && (
          <>
            {activeSection === 'design-system' ? (
              <DesignSystemShowcase />
            ) : architectureSections.includes(activeSection) ? (
              <ArchitectureDashboard
                activeTier={activeTier}
                activeSection={activeSection}
                onOpenLogin={() => setIsLoginModalOpen(true)}
              />
            ) : activeSection === 'member-profile' && selectedMemberSlug ? (
              <MemberProfileView
                slug={selectedMemberSlug}
                onBackToDirectory={() => {
                  setActiveSection('members');
                  setSelectedMemberSlug(null);
                }}
              />
            ) : activeSection === 'members' ? (
              <MemberDirectoryView
                onSelectMember={(slug) => {
                  setSelectedMemberSlug(slug);
                  setActiveSection('member-profile');
                }}
                onNavigateHome={() => {
                  setActiveSection('home');
                  setSelectedMemberSlug(null);
                }}
              />
            ) : (
              <PublicWebsiteView
                onOpenLogin={() => setIsLoginModalOpen(true)}
                onNavigateSection={(sec) => {
                  setActiveSection(sec);
                  setSelectedMemberSlug(null);
                }}
                onSelectMember={(slug) => {
                  setSelectedMemberSlug(slug);
                  setActiveSection('member-profile');
                  setActiveTier('public');
                }}
              />
            )}
          </>
        )}

        {/* Tier 2: Authenticated Member Dashboard */}
        {activeTier === 'member' && (
          <>
            {user ? (
              <MemberPortalView
                onOpenAdminVerify={() => setIsAdminVerifyModalOpen(true)}
              />
            ) : (
              <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-neutral-200 shadow-sm text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto border border-neutral-200">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Member Portal Authentication Required</h2>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  The Member Area is reserved for registered students of {SCHOOL_BRAND.schoolName} IT Club. Please log in using your Applicant Number and confidential password.
                </p>
                <div className="pt-2">
                  <Button
                    variant="dark"
                    onClick={() => setIsLoginModalOpen(true)}
                    leftIcon={<LogIn className="w-4 h-4" />}
                    className="w-full"
                  >
                    Log In with Applicant Number
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tier 3: Admin Control Center */}
        {activeTier === 'admin' && (
          <>
            {user && isAdminVerified ? (
              <AdminControlCenterView />
            ) : (
              <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-neutral-200 shadow-sm text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto border border-neutral-200">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Administrative Clearance Gate</h2>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Access to the IT Club Admin Control Center requires a valid member session followed by server-side security passcode verification.
                </p>
                <div className="pt-2">
                  {!user ? (
                    <Button
                      variant="dark"
                      onClick={() => setIsLoginModalOpen(true)}
                      className="w-full"
                    >
                      Step 1: Member Authentication
                    </Button>
                  ) : (
                    <Button
                      variant="dark"
                      onClick={() => setIsAdminVerifyModalOpen(true)}
                      leftIcon={<Shield className="w-4 h-4 text-pink-400" />}
                      className="w-full"
                    >
                      Step 2: Enter Admin Passcode
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Academic Footer */}
      <Footer
        onNavigate={(sec) => {
          setActiveSection(sec);
          if (sec === 'members' || sec === 'events' || sec === 'notices' || sec === 'gallery' || sec === 'about') {
            setActiveTier('public');
          }
        }}
        onOpenAdmin={() => {
          if (!user) {
            setIsLoginModalOpen(true);
          } else {
            setIsAdminVerifyModalOpen(true);
          }
        }}
      />

      {/* 1. Member Login Modal (Applicant Number + Password) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setActiveTier('member');
          setActiveSection('member-portal');
        }}
        onSwitchToAdmin={() => {
          setIsLoginModalOpen(false);
          setIsAdminVerifyModalOpen(true);
        }}
      />

      {/* 2. Admin Verification Modal (Passcode via /api/auth/verify-admin) */}
      <AdminVerificationModal
        isOpen={isAdminVerifyModalOpen}
        onClose={() => setIsAdminVerifyModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* 3. Global Multi-Domain Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigate={(sec) => {
          setActiveSection(sec);
          setActiveTier('public');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
