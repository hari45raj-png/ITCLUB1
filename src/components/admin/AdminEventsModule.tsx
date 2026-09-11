/**
 * St. Mary's English School - IT Club Platform
 * Admin Events & Workshops Module
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
import { Calendar, Plus, Search, Edit2, Trash2, MapPin, Clock } from 'lucide-react';

export interface AdminEventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  imageUrl?: string;
  isPublic: boolean;
}

interface AdminEventsModuleProps {
  onNotify: (msg: string) => void;
}

export const AdminEventsModule: React.FC<AdminEventsModuleProps> = ({ onNotify }) => {
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 12:30 PM',
    location: 'Senior Computer Lab',
    category: 'Workshop',
    description: '',
    status: 'upcoming' as const,
  });
  const [createLoading, setCreateLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminEventItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/events', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(data.data || []);
      }
    } catch {
      onNotify('Failed to fetch events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.date.trim() || !createForm.location.trim()) {
      return;
    }

    setCreateLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/events', {
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
        fetchEvents();
        onNotify('Event scheduled.');
      } else {
        onNotify(data.message || 'Failed to create event.');
      }
    } catch {
      onNotify('Service request error.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/admin/events/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        fetchEvents();
        onNotify('Event removed.');
        setDeleteTarget(null);
      }
    } catch {
      onNotify('Failed to delete event.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<AdminEventItem>[] = [
    {
      key: 'title',
      header: 'Event Title',
      priority: 'high',
      render: (e) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">{e.title}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {e.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {e.time}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      priority: 'medium',
      render: (e) => (
        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
          {e.category}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Event Date',
      priority: 'high',
      render: (e) => <span className="font-mono text-xs text-slate-700 font-bold">{e.date}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      priority: 'high',
      render: (e) => {
        const variant: BadgeVariant =
          e.status === 'upcoming' ? 'published' : e.status === 'completed' ? 'draft' : 'archived';
        return (
          <Badge variant={variant} size="xs" dot>
            {e.status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      priority: 'high',
      render: (e) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setDeleteTarget(e)}
            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            title="Delete event"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events and workshops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B192C]"
          />
        </div>

        <Button
          size="sm"
          className="bg-[#0B192C] text-white"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Schedule Event
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <Table
          columns={columns}
          data={events.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()))}
          keyExtractor={(e) => e.id}
          isLoading={isLoading}
          emptyState={<div className="text-center text-slate-500 py-6">No events found.</div>}
        />
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule New Event or Workshop"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
          <Input
            label="Event Title"
            placeholder="e.g., Python Bootcamp 2026"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={createForm.date}
              onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
              required
            />
            <Input
              label="Time"
              value={createForm.time}
              onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Location / Lab"
              value={createForm.location}
              onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
              required
            />
            <Select
              label="Category"
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              options={[
                { value: 'Workshop', label: 'Workshop' },
                { value: 'Seminar', label: 'Seminar' },
                { value: 'Hackathon', label: 'Hackathon' },
                { value: 'Competition', label: 'Competition' },
              ]}
            />
          </div>

          <Textarea
            label="Description / Prerequisites"
            rows={3}
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0B192C] text-white" isLoading={createLoading}>
              Publish Schedule
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Event?"
        message={`Are you sure you want to delete event "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};
