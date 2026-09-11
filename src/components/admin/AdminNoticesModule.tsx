/**
 * St. Mary's English School - IT Club Platform
 * Admin Notices & Circulars Management Module
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
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  BellRing,
  AlertTriangle,
  Send
} from 'lucide-react';

export interface AdminNoticeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'general' | 'urgent' | 'academic';
  publishedDate: string;
  status: 'published' | 'draft' | 'archived';
  author: string;
  isPublic: boolean;
}

interface AdminNoticesModuleProps {
  onNotify: (msg: string) => void;
}

export const AdminNoticesModule: React.FC<AdminNoticesModuleProps> = ({ onNotify }) => {
  const [notices, setNotices] = useState<AdminNoticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    category: 'Official Notice',
    priority: 'general' as any,
    isPublic: true,
    broadcastNotification: true,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit modal state
  const [editingNotice, setEditingNotice] = useState<AdminNoticeItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    category: '',
    priority: 'general' as any,
    status: 'published' as any,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminNoticeItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/notices', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotices(data.data || []);
      }
    } catch {
      onNotify('Failed to retrieve notices.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.content.trim()) {
      setCreateError('Title and content are required.');
      return;
    }

    setCreateLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsCreateOpen(false);
        setCreateForm({
          title: '',
          content: '',
          category: 'Official Notice',
          priority: 'general',
          isPublic: true,
          broadcastNotification: true,
        });
        fetchNotices();
        onNotify('Notice published successfully.');
      } else {
        setCreateError(data.message || 'Failed to create notice.');
      }
    } catch {
      setCreateError('Service request failed.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditOpen = (item: AdminNoticeItem) => {
    setEditingNotice(item);
    setEditForm({
      title: item.title,
      content: item.content,
      category: item.category,
      priority: item.priority,
      status: item.status,
    });
    setEditError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;

    setEditLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/admin/notices/${editingNotice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEditingNotice(null);
        fetchNotices();
        onNotify('Notice updated successfully.');
      } else {
        setEditError(data.message || 'Failed to update notice.');
      }
    } catch {
      setEditError('Service request failed.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleArchive = async (item: AdminNoticeItem) => {
    const nextStatus = item.status === 'archived' ? 'published' : 'archived';
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/admin/notices/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchNotices();
        onNotify(`Notice status updated to ${nextStatus}.`);
      }
    } catch {
      onNotify('Failed to update notice status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/admin/notices/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        fetchNotices();
        onNotify('Notice deleted.');
        setDeleteTarget(null);
      }
    } catch {
      onNotify('Failed to delete notice.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false;
    return true;
  });

  const columns: Column<AdminNoticeItem>[] = [
    {
      key: 'title',
      header: 'Title / Notice',
      priority: 'high',
      render: (n) => (
        <div className="space-y-0.5 max-w-md">
          <p className="font-semibold text-slate-900">{n.title}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>{n.category}</span>
            <span>•</span>
            <span>By: {n.author}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      priority: 'high',
      render: (n) => {
        const isUrgent = n.priority === 'urgent';
        return (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
              isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isUrgent && <AlertTriangle className="w-3 h-3 text-rose-600" />}
            {n.priority.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      priority: 'high',
      render: (n) => {
        const variant: BadgeVariant =
          n.status === 'published' ? 'published' : n.status === 'archived' ? 'archived' : 'warning';
        return (
          <Badge variant={variant} size="xs" dot>
            {n.status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: 'publishedDate',
      header: 'Date',
      priority: 'medium',
      render: (n) => <span className="font-mono text-xs text-slate-500">{n.publishedDate}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      priority: 'high',
      render: (n) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleEditOpen(n)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Edit notice"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleToggleArchive(n)}
            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
            title={n.status === 'archived' ? 'Restore notice' : 'Archive notice'}
          >
            {n.status === 'archived' ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(n)}
            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            title="Delete notice"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notices and circulars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B192C]"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B192C]"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="general">General</option>
            <option value="academic">Academic</option>
          </select>
        </div>

        <Button
          size="sm"
          className="bg-[#0B192C] hover:bg-[#1E3E62] text-white shrink-0"
          onClick={() => {
            setCreateError('');
            setIsCreateOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Publish Notice
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <Table
          columns={columns}
          data={filteredNotices}
          keyExtractor={(n) => n.id}
          isLoading={isLoading}
          emptyState={<div className="text-center text-slate-500 py-6">No notices match the filter.</div>}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Publish Official Notice / Circular"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
          {createError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              {createError}
            </div>
          )}

          <Input
            label="Notice Title"
            placeholder="e.g., Annual IT Exhibition Registration Open"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              options={[
                { value: 'Official Notice', label: 'Official Notice' },
                { value: 'Academic Circular', label: 'Academic Circular' },
                { value: 'Workshop & Meet', label: 'Workshop & Meet' },
                { value: 'Elections', label: 'Elections' },
              ]}
            />

            <Select
              label="Priority Level"
              value={createForm.priority}
              onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as any })}
              options={[
                { value: 'general', label: 'General' },
                { value: 'urgent', label: 'Urgent (Red Alert)' },
                { value: 'academic', label: 'Academic' },
              ]}
            />
          </div>

          <Textarea
            label="Notice Content / Instructions"
            rows={5}
            placeholder="Enter detailed notice content, dates, and instructions..."
            value={createForm.content}
            onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
            required
          />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <BellRing className="w-4 h-4 text-blue-600" />
              <span>Broadcast notification to all active club members</span>
            </div>
            <input
              type="checkbox"
              checked={createForm.broadcastNotification}
              onChange={(e) => setCreateForm({ ...createForm, broadcastNotification: e.target.checked })}
              className="w-4 h-4 text-[#0B192C] rounded focus:ring-0"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0B192C] text-white" isLoading={createLoading}>
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingNotice)}
        onClose={() => setEditingNotice(null)}
        title="Edit Notice"
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
          {editError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              {editError}
            </div>
          )}

          <Input
            label="Notice Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
              options={[
                { value: 'general', label: 'General' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'academic', label: 'Academic' },
              ]}
            />
            <Select
              label="Status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
              options={[
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>

          <Textarea
            label="Content"
            rows={5}
            value={editForm.content}
            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditingNotice(null)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0B192C] text-white" isLoading={editLoading}>
              Save Notice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Official Notice?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Notice"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};
