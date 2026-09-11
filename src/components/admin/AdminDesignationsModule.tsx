/**
 * St. Mary's English School - IT Club Platform
 * Admin Designations & Hierarchy Module
 */

import React, { useState, useEffect } from 'react';
import { Table, Column } from '../ui/Table';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Modal } from '../ui/Modal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { AuthService } from '../../services/authService';
import { Shield, Plus, Search, Trash2, Edit2 } from 'lucide-react';

interface DesignationItem {
  id: string;
  title: string;
  level: 'leadership' | 'member' | 'alumnus' | 'faculty';
  hierarchyOrder: number;
  description: string;
  isSystem: boolean;
  assignedCount: number;
}

interface AdminDesignationsModuleProps {
  onNotify: (msg: string) => void;
}

export const AdminDesignationsModule: React.FC<AdminDesignationsModuleProps> = ({ onNotify }) => {
  const [designations, setDesignations] = useState<DesignationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    level: 'member' as any,
    hierarchyOrder: 25,
    description: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DesignationItem | null>(null);

  const fetchDesignations = async () => {
    setIsLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/designations', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDesignations(data.data || []);
      }
    } catch {
      onNotify('Failed to fetch designations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setCreateLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/designations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsCreateOpen(false);
        fetchDesignations();
        onNotify(`Designation "${form.title}" registered.`);
      } else {
        onNotify(data.message || 'Failed to add designation.');
      }
    } catch {
      onNotify('Service request error.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/admin/designations/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchDesignations();
        onNotify('Designation deleted.');
        setDeleteTarget(null);
      } else {
        onNotify(data.message || 'Failed to delete designation.');
      }
    } catch {
      onNotify('Failed to delete designation.');
    }
  };

  const columns: Column<DesignationItem>[] = [
    {
      key: 'hierarchyOrder',
      header: 'Hierarchy Rank',
      priority: 'high',
      render: (d) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          Rank {d.hierarchyOrder}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Designation Title',
      priority: 'high',
      render: (d) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">{d.title}</p>
          <p className="text-[11px] text-slate-400">{d.description || 'Club Designation'}</p>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Clearance Tier',
      priority: 'medium',
      render: (d) => (
        <span className="text-xs uppercase tracking-tight font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
          {d.level}
        </span>
      ),
    },
    {
      key: 'assignedCount',
      header: 'Assigned Members',
      priority: 'high',
      render: (d) => (
        <span className="font-bold text-xs text-[#0B192C]">
          {d.assignedCount} active
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      priority: 'high',
      render: (d) => (
        <div className="flex items-center justify-end gap-1.5">
          {!d.isSystem && (
            <button
              type="button"
              onClick={() => setDeleteTarget(d)}
              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Delete designation"
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
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Executive designations control display sorting, badge styling, and administrative eligibility.
        </p>

        <Button
          size="sm"
          className="bg-[#0B192C] text-white shrink-0"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Designation
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <Table
          columns={columns}
          data={designations}
          keyExtractor={(d) => d.id}
          isLoading={isLoading}
        />
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Club Designation"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
          <Input
            label="Designation Title"
            placeholder="e.g., Lead AI Researcher"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tier / Level"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value as any })}
              options={[
                { value: 'leadership', label: 'Council Leadership' },
                { value: 'member', label: 'Club Member' },
                { value: 'faculty', label: 'Faculty Moderator' },
                { value: 'alumnus', label: 'Alumnus' },
              ]}
            />
            <Input
              label="Hierarchy Order (1 = Highest)"
              type="number"
              value={form.hierarchyOrder}
              onChange={(e) => setForm({ ...form, hierarchyOrder: parseInt(e.target.value, 10) })}
              required
            />
          </div>

          <Textarea
            label="Description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0B192C] text-white" isLoading={createLoading}>
              Save Designation
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Designation?"
        message={`Are you sure you want to delete designation "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};
