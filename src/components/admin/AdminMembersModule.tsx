/**
 * St. Mary's English School - IT Club Platform
 * Admin Members Management Module
 */

import React, { useState, useEffect } from 'react';
import { Table, Column } from '../ui/Table';
import { Badge, BadgeVariant } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Modal } from '../ui/Modal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { AuthService } from '../../services/authService';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  CheckCircle2,
  KeyRound,
  Shield,
  Eye,
  AlertCircle
} from 'lucide-react';

export interface AdminMemberItem {
  id: string;
  userId: string;
  memberNumber: string;
  admissionNumber?: string;
  fullName: string;
  displayName: string;
  email?: string;
  birthYear: number;
  classGrade: string;
  section: string;
  designation: string;
  designationLevel: string;
  hierarchyOrder: number;
  status: 'active' | 'inactive' | 'archived' | 'suspended';
  publicVisibility: boolean;
  portfolioVisibility: boolean;
  isFeatured: boolean;
  bio?: string;
  skills?: string[];
  role: string;
  roles: string[];
}

interface AdminMembersModuleProps {
  onNotify: (msg: string) => void;
}

export const AdminMembersModule: React.FC<AdminMembersModuleProps> = ({ onNotify }) => {
  const [members, setMembers] = useState<AdminMemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Member State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    admissionNumber: '',
    birthYear: 2011,
    classGrade: '10',
    section: 'A',
    designation: 'Member',
    bio: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdResult, setCreatedResult] = useState<{ applicantNumber: string; admissionNumber?: string } | null>(null);

  // Edit Member State
  const [editingMember, setEditingMember] = useState<AdminMemberItem | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    classGrade: '',
    section: '',
    designation: '',
    bio: '',
    status: 'active' as any,
    publicVisibility: true,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<AdminMemberItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch all members
  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/members', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMembers(data.data || []);
      }
    } catch {
      onNotify('Failed to fetch members roster.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Handle Create Member
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!createForm.fullName.trim()) {
      setCreateError('Full name is required.');
      return;
    }

    setCreateLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/members/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCreatedResult({
          applicantNumber: data.data.applicantNumber,
          admissionNumber: data.data.admissionNumber,
        });
        fetchMembers();
        onNotify(`Member provisioned with Applicant ID: ${data.data.applicantNumber}`);
      } else {
        setCreateError(data.message || 'Failed to provision member.');
      }
    } catch {
      setCreateError('Service request failed. Please retry.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Edit Member
  const handleEditOpen = (member: AdminMemberItem) => {
    setEditingMember(member);
    setEditForm({
      fullName: member.fullName,
      classGrade: member.classGrade,
      section: member.section,
      designation: member.designation,
      bio: member.bio || '',
      status: member.status,
      publicVisibility: member.publicVisibility,
    });
    setEditError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setEditLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/admin/members/${editingMember.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEditingMember(null);
        fetchMembers();
        onNotify(`Member record for ${editingMember.fullName} updated.`);
      } else {
        setEditError(data.message || 'Failed to update member.');
      }
    } catch {
      setEditError('Service request failed.');
    } finally {
      setEditLoading(false);
    }
  };

  // Toggle Archive
  const handleToggleArchive = async (member: AdminMemberItem) => {
    const isArchived = member.status === 'archived';
    const endpoint = isArchived ? 'restore' : 'archive';
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/admin/members/${member.id}/${endpoint}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        fetchMembers();
        onNotify(`Member ${isArchived ? 'restored to active' : 'soft-archived'}.`);
      }
    } catch {
      onNotify('Failed to update member archive status.');
    }
  };

  // Delete Member
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/admin/members/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchMembers();
        onNotify(`Member ${deleteTarget.fullName} deleted.`);
        setDeleteTarget(null);
      } else {
        onNotify(data.message || 'Failed to delete member.');
      }
    } catch {
      onNotify('Service communication failure.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.memberNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.designation.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  const columns: Column<AdminMemberItem>[] = [
    {
      key: 'memberNumber',
      header: 'Applicant #',
      priority: 'high',
      render: (m) => (
        <span className="font-mono text-xs font-bold text-[#0B192C] bg-slate-100 px-2 py-1 rounded">
          {m.memberNumber.startsWith('IT@') ? m.memberNumber : `#${m.memberNumber}`}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Member / Identity',
      priority: 'high',
      render: (m) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">{m.fullName}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Class {m.classGrade}-{m.section}</span>
            <span>•</span>
            <span>Birth: {m.birthYear}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'designation',
      header: 'Designation',
      priority: 'high',
      render: (m) => (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-700">{m.designation}</span>
          {m.designationLevel === 'leadership' && (
            <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" title="Council Leadership" />
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      priority: 'high',
      render: (m) => {
        const variant: BadgeVariant =
          m.status === 'active' ? 'published' : m.status === 'archived' ? 'archived' : 'warning';
        return (
          <Badge variant={variant} size="xs" dot>
            {m.status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      priority: 'high',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleEditOpen(m)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Edit member details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {m.memberNumber !== 'IT@0' && m.memberNumber !== '0' && (
            <button
              type="button"
              onClick={() => handleToggleArchive(m)}
              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
              title={m.status === 'archived' ? 'Restore member' : 'Archive member'}
            >
              {m.status === 'archived' ? (
                <RotateCcw className="w-3.5 h-3.5" />
              ) : (
                <Archive className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {m.memberNumber !== 'IT@0' && m.memberNumber !== '0' && (
            <button
              type="button"
              onClick={() => setDeleteTarget(m)}
              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Delete member"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Action and Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, applicant #, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B192C] focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B192C]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>

        <Button
          size="sm"
          className="bg-[#0B192C] hover:bg-[#1E3E62] text-white shrink-0"
          onClick={() => {
            setCreatedResult(null);
            setCreateError('');
            setIsCreateOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Provision Member
        </Button>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <Table
          columns={columns}
          data={filteredMembers}
          keyExtractor={(m) => m.id}
          isLoading={isLoading}
          emptyState={<div className="text-center text-slate-500 py-6">No members match the selected filters.</div>}
        />
      </div>

      {/* Provision Member Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setCreatedResult(null);
        }}
        title="Provision New Club Member"
        maxWidth="md"
      >
        {createdResult ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Member Officially Provisioned!</span>
              </div>
              <p className="text-xs text-emerald-700">
                Provide these initial credentials to the student for their initial Member Login:
              </p>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-200 space-y-2 font-mono text-xs">
                <div>
                  <span className="text-slate-500 font-sans">Applicant Number: </span>
                  <span className="font-bold text-[#0B192C] text-sm">{createdResult.applicantNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans">Initial Password (School Admission No.): </span>
                  <span className="font-bold text-emerald-700 text-sm">{createdResult.admissionNumber || 'N/A'}</span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-600/90 italic">
                Format: Username is the Applicant Number (IT@N) and the initial password is their School Admission Number. The student will be prompted to set a permanent password upon first login.
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreatedResult(null);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <Input
              label="Student Full Name"
              placeholder="e.g., Aarav Sharma"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              required
            />

            <Input
              label="School Admission Number"
              placeholder="e.g., 6756"
              value={createForm.admissionNumber}
              onChange={(e) => setCreateForm({ ...createForm, admissionNumber: e.target.value.trim() })}
              helperText="Official school admission number used as initial login password"
              required
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Birth Year"
                type="number"
                min={2000}
                max={2025}
                value={createForm.birthYear}
                onChange={(e) => setCreateForm({ ...createForm, birthYear: parseInt(e.target.value, 10) })}
                required
              />
              <Input
                label="Class Grade"
                placeholder="e.g., 10"
                value={createForm.classGrade}
                onChange={(e) => setCreateForm({ ...createForm, classGrade: e.target.value })}
                required
              />
              <Input
                label="Section"
                placeholder="e.g., A"
                value={createForm.section}
                onChange={(e) => setCreateForm({ ...createForm, section: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <Select
              label="Designation"
              value={createForm.designation}
              onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
              options={[
                { value: 'Member', label: 'Member' },
                { value: 'Senior Member', label: 'Senior Member' },
                { value: 'Technical Lead', label: 'Technical Lead' },
                { value: 'Secretary', label: 'Secretary' },
                { value: 'Vice President', label: 'Vice President' },
                { value: 'President', label: 'President' },
              ]}
            />

            <Textarea
              label="Short Bio / Notes (Optional)"
              rows={2}
              placeholder="Brief student background or interests..."
              value={createForm.bio}
              onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0B192C] text-white"
                isLoading={createLoading}
              >
                Generate Credentials & Register
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        title={`Edit Member: ${editingMember?.fullName || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
          {editError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              {editError}
            </div>
          )}

          <Input
            label="Full Name"
            value={editForm.fullName}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Class Grade"
              value={editForm.classGrade}
              onChange={(e) => setEditForm({ ...editForm, classGrade: e.target.value })}
              required
            />
            <Input
              label="Section"
              value={editForm.section}
              onChange={(e) => setEditForm({ ...editForm, section: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Designation"
              value={editForm.designation}
              onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
              options={[
                { value: 'Member', label: 'Member' },
                { value: 'Senior Member', label: 'Senior Member' },
                { value: 'Technical Lead', label: 'Technical Lead' },
                { value: 'Secretary', label: 'Secretary' },
                { value: 'Vice President', label: 'Vice President' },
                { value: 'President', label: 'President' },
              ]}
            />
            <Select
              label="Account Status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>

          <Textarea
            label="Bio / Profile Description"
            rows={3}
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0B192C] text-white" isLoading={editLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Member Permanently?"
        message={`Are you sure you want to delete member ${deleteTarget?.fullName} (Applicant #${deleteTarget?.memberNumber})? This action cannot be undone.`}
        confirmLabel="Delete Member"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};
