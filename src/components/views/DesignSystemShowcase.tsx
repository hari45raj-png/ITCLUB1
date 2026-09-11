/**
 * St. Mary's English School - IT Club Platform
 * Design System, School Branding & UI/UX Foundation Showcase
 * 
 * PROMPT 5: Interactive Design System Test Bench
 * 
 * Demonstrates:
 * - Official School Color Tokens (Crimson #9B1B1B, Deep Navy #0B192C, Neutrals)
 * - School Crest / Logo in multiple variants
 * - Typography scale & hierarchy
 * - Buttons, Badges & Content Lifecycle States (Published, Draft, Archived, Upcoming, Leadership)
 * - Form Controls (Input, Textarea, Select, Checkbox, Switch)
 * - Navigation Primitives (Breadcrumbs, Tabs)
 * - Alerts & Feedback states
 * - Priority-Column Responsive Table
 */

import React, { useState } from 'react';
import { DESIGN_TOKENS } from '../../constants/tokens';
import { SCHOOL_BRAND } from '../../constants/branding';
import { SchoolLogo } from '../ui/SchoolLogo';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Switch } from '../ui/Switch';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Tabs } from '../ui/Tabs';
import { Alert } from '../ui/Alert';
import { Table, Column } from '../ui/Table';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { Modal } from '../ui/Modal';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('brand');
  const [switchVal, setSwitchVal] = useState(true);
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoConfirmOpen, setDemoConfirmOpen] = useState(false);

  // Table sample data
  const sampleTableData = [
    { id: '1', role: 'President', name: 'Aarav Sharma', classSec: '12-A', status: 'active', priority: 'leadership' },
    { id: '2', role: 'Vice President', name: 'Ananya Deshmukh', classSec: '12-B', status: 'active', priority: 'leadership' },
    { id: '3', role: 'Secretary', name: 'Rohan Sen', classSec: '11-A', status: 'active', priority: 'leadership' },
    { id: '4', role: 'Member', name: 'Priya Mukherjee', classSec: '11-C', status: 'published', priority: 'member' },
  ];

  const columns: Column<typeof sampleTableData[0]>[] = [
    { key: 'name', header: 'Student Name', priority: 'high' },
    {
      key: 'role',
      header: 'Designation',
      priority: 'high',
      render: (r) => (
        <Badge variant={r.priority === 'leadership' ? 'leadership' : 'member'} size="xs">
          {r.role}
        </Badge>
      ),
    },
    { key: 'classSec', header: 'Class & Section', priority: 'medium' },
    {
      key: 'status',
      header: 'System State',
      priority: 'low',
      render: (r) => (
        <Badge variant={r.status as any} size="xs" dot>
          {r.status.toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-600">
          <Layers className="w-4 h-4" />
          <span>Clean Social-Platform-Inspired Design Foundation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
          Design System, School Branding & UI/UX Foundation
        </h1>
        <p className="text-sm text-neutral-600 max-w-3xl leading-relaxed">
          Production-ready school identity tokens, academic typography hierarchy, WCAG AA compliant clean neutral palette with vibrant pink/purple accents, responsive primitives, and accessible interaction patterns for {SCHOOL_BRAND.schoolName} IT Club.
        </p>
      </div>

      {/* Tabs for Showcase Categories */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="enclosed"
        tabs={[
          { id: 'brand', label: '1. School Identity & Palette' },
          { id: 'components', label: '2. UI Primitives & Form Controls' },
          { id: 'states', label: '3. Content Lifecycle & Badges' },
          { id: 'feedback', label: '4. Alerts, Tables & Modals' },
        ]}
      />

      {/* 1. School Identity & Palette */}
      {activeTab === 'brand' && (
        <div className="space-y-8">
          {/* Logo Showcase */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-neutral-900 text-base">Official Logo & Emblem Variations</h3>
            <p className="text-xs text-neutral-500">
              Clean circular emblem featuring St. Mary’s English School crest, deep charcoal ring, and high-contrast typography.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col items-center justify-center space-y-3 text-center">
                <SchoolLogo size="lg" showText />
                <span className="text-xs font-semibold text-neutral-500">Light Container (showText=true)</span>
              </div>
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center space-y-3 text-center">
                <SchoolLogo size="lg" inverted showText />
                <span className="text-xs font-semibold text-neutral-400">Dark Navigation (inverted=true)</span>
              </div>
              <div className="p-6 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex flex-col items-center justify-center space-y-3 text-center">
                <SchoolLogo size="md" showText={false} />
                <span className="text-xs font-semibold text-neutral-500">Compact Circular Icon Only</span>
              </div>
            </div>
          </div>

          {/* Color Palette Swatches */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-neutral-900 text-base">Clean Neutral & Accent Palette</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <div className="h-16 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 shadow-xs flex items-end p-2 text-white text-[11px] font-bold">
                  #DB2777 → #9333EA
                </div>
                <p className="text-xs font-bold text-neutral-800">Gradient Accent</p>
                <p className="text-[11px] text-neutral-500">5-10% Accent Highlights</p>
              </div>
              <div className="space-y-1.5">
                <div className="h-16 rounded-xl bg-neutral-900 shadow-xs flex items-end p-2 text-white text-[11px] font-bold">
                  #171717
                </div>
                <p className="text-xs font-bold text-neutral-800">Deep Charcoal</p>
                <p className="text-[11px] text-neutral-500">15-20% Contrast & Headings</p>
              </div>
              <div className="space-y-1.5">
                <div className="h-16 rounded-xl bg-neutral-100 border border-neutral-200 shadow-xs flex items-end p-2 text-neutral-700 text-[11px] font-bold">
                  #F5F5F5
                </div>
                <p className="text-xs font-bold text-neutral-800">Soft Light Neutral</p>
                <p className="text-[11px] text-neutral-500">70-80% Canvas & Cards</p>
              </div>
              <div className="space-y-1.5">
                <div className="h-16 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-end p-2 text-neutral-700 text-[11px] font-bold">
                  #FFFFFF
                </div>
                <p className="text-xs font-bold text-neutral-800">Pure White</p>
                <p className="text-[11px] text-neutral-500">Primary Card Surfaces</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. UI Primitives & Form Controls */}
      {activeTab === 'components' && (
        <div className="space-y-8">
          {/* Button Matrix */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-neutral-900 text-base">Button Variants (44px Minimum Mobile Touch Target)</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="dark">Dark Charcoal</Button>
              <Button variant="primary">Pink Accent</Button>
              <Button variant="secondary">Secondary Neutral</Button>
              <Button variant="outline">Outline Neutral</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Action</Button>
              <Button variant="dark" isLoading>Loading State</Button>
            </div>
          </div>

          {/* Form Controls */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-6 shadow-2xs">
            <h3 className="font-bold text-neutral-900 text-base">Form Controls & Validation States</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Student Applicant Number"
                placeholder="STU-2026-084"
                requiredIndicator
                helperText="Format: STU-YYYY-XXX"
              />
              <Input
                label="Error State Demonstration"
                defaultValue="InvalidInput"
                error="Please enter a valid format"
              />
              <Select
                label="Academic Class Selection"
                options={[
                  { value: '12', label: 'Class 12 — Senior Secondary CBSE' },
                  { value: '11', label: 'Class 11 — Senior Secondary CBSE' },
                  { value: '10', label: 'Class 10 — Secondary CBSE' },
                ]}
              />
              <div className="space-y-4 pt-1">
                <Switch
                  label="Email Notification Digest"
                  helperText="Send weekly academic bulletin summaries"
                  checked={switchVal}
                  onChange={setSwitchVal}
                />
                <Checkbox
                  label="I agree to the IT Club Laboratory Code of Conduct"
                  checked={checkboxVal}
                  onChange={(e) => setCheckboxVal(e.target.checked)}
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label="Student Bio / Research Statement"
                  placeholder="Share your computing projects..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Content Lifecycle & Badges */}
      {activeTab === 'states' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-6 shadow-2xs">
            <h3 className="font-bold text-neutral-900 text-base">Lifecycle Content States (Section 21)</h3>
            <p className="text-xs text-neutral-500">
              Centralized visual states for all public and administrative content objects.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="published" dot>PUBLISHED</Badge>
              <Badge variant="draft" dot>DRAFT</Badge>
              <Badge variant="archived">ARCHIVED</Badge>
              <Badge variant="active" dot>ACTIVE</Badge>
              <Badge variant="inactive">INACTIVE</Badge>
              <Badge variant="upcoming">UPCOMING EVENT</Badge>
              <Badge variant="completed">COMPLETED</Badge>
            </div>

            <h3 className="font-bold text-neutral-900 text-base pt-4 border-t border-neutral-100">
              Designation Hierarchy (Section 11 & 20)
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="leadership" size="md">President (Council Leader)</Badge>
              <Badge variant="leadership" size="md">Vice President</Badge>
              <Badge variant="leadership" size="md">Secretary</Badge>
              <Badge variant="member" size="md">Senior Member</Badge>
              <Badge variant="member" size="md">Member</Badge>
            </div>
          </div>
        </div>
      )}

      {/* 4. Feedback, Tables & Modals */}
      {activeTab === 'feedback' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-neutral-900 text-base">System Alert Banners</h3>
            <div className="space-y-3">
              <Alert variant="info" title="Examination Schedule Released">
                Model question papers for CBSE Computer Applications Class 10 have been uploaded.
              </Alert>
              <Alert variant="success" title="Passcode Verified">
                Administrative clearance granted for session 2026-27.
              </Alert>
              <Alert variant="warning" title="Maintenance Notice">
                Senior Computer Lab 1 will undergo scheduled operating system updates this Saturday.
              </Alert>
              <Alert variant="error" title="Access Denied">
                Invalid administrative passcode. Please verify your credentials.
              </Alert>
            </div>
          </div>

          {/* Interactive Responsive Table */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-neutral-900 text-base">Priority-Column Responsive Table</h3>
            <p className="text-xs text-neutral-500">
              Columns adapt dynamically across breakpoints (high on mobile, medium on tablet, low on desktop).
            </p>
            <Table
              columns={columns}
              data={sampleTableData}
              keyExtractor={(r) => r.id}
            />
          </div>

          {/* Dialog Launchers */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-4 shadow-2xs">
            <h3 className="font-bold text-neutral-900 text-base">Modal & Dialog Triggers</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setDemoModalOpen(true)}>
                Open Standard Modal
              </Button>
              <Button variant="destructive" onClick={() => setDemoConfirmOpen(true)}>
                Open Confirmation Dialog
              </Button>
            </div>
          </div>

          {/* Standard Modal */}
          <Modal
            isOpen={demoModalOpen}
            onClose={() => setDemoModalOpen(false)}
            title="Standard Dialog Example"
            maxWidth="sm"
          >
            <div className="space-y-4 text-xs text-neutral-600">
              <p>
                Standard modal dialog with accessible keyboard handling, focus trap, and backdrop dismiss.
              </p>
              <div className="flex justify-end pt-2">
                <Button variant="dark" size="sm" onClick={() => setDemoModalOpen(false)}>
                  Got It
                </Button>
              </div>
            </div>
          </Modal>

          {/* Confirmation Dialog */}
          <ConfirmationModal
            isOpen={demoConfirmOpen}
            onClose={() => setDemoConfirmOpen(false)}
            onConfirm={() => {
              setDemoConfirmOpen(false);
            }}
            title="Confirm Action"
            message="Are you sure you want to proceed with this test action?"
            confirmLabel="Confirm"
            variant="destructive"
          />
        </div>
      )}
    </div>
  );
};
