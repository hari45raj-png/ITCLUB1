/**
 * St. Mary's English School - IT Club Platform
 * Admin Question Papers & Resources Module
 */

import React, { useState, useEffect } from 'react';
import { Table, Column } from '../ui/Table';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { AuthService } from '../../services/authService';
import { BookOpen, Plus, Search, Trash2, FileText, Download } from 'lucide-react';

interface QuestionPaperItem {
  id: string;
  title: string;
  classGrade: string;
  subject: string;
  academicYear: string;
  examType: string;
  description: string;
  filePath: string;
  downloadCount: number;
}

interface ResourceItem {
  id: string;
  title: string;
  subject: string;
  classGrade: string;
  academicYear: string;
  documentType: string;
  filePath: string;
}

interface AdminResourcesModuleProps {
  onNotify: (msg: string) => void;
}

export const AdminResourcesModule: React.FC<AdminResourcesModuleProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<'papers' | 'materials'>('papers');
  const [papers, setPapers] = useState<QuestionPaperItem[]>([]);
  const [materials, setMaterials] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreatePaperOpen, setIsCreatePaperOpen] = useState(false);
  const [paperForm, setPaperForm] = useState({
    title: '',
    classGrade: '10',
    subject: 'Information Technology (Code 402)',
    academicYear: '2026-2027',
    examType: 'Pre-Board Examination',
    description: 'Official CBSE IT 402 Sample Paper',
    filePath: 'exams/it402-sample-paper-2026.pdf',
  });
  const [createLoading, setCreateLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; type: 'paper' | 'material' } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [resPapers, resMaterials] = await Promise.all([
        fetch('/api/admin/question-papers', { headers }),
        fetch('/api/admin/resources', { headers }),
      ]);

      const dataPapers = await resPapers.json();
      const dataMaterials = await resMaterials.json();

      if (resPapers.ok && dataPapers.success) setPapers(dataPapers.data || []);
      if (resMaterials.ok && dataMaterials.success) setMaterials(dataMaterials.data || []);
    } catch {
      onNotify('Failed to retrieve academic repository data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paperForm.title.trim()) return;

    setCreateLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/question-papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(paperForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsCreatePaperOpen(false);
        fetchData();
        onNotify('Question paper registered successfully.');
      } else {
        onNotify(data.message || 'Failed to add question paper.');
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
      const endpoint = deleteTarget.type === 'paper' ? 'question-papers' : 'resources';
      const res = await fetch(`/api/admin/${endpoint}/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        fetchData();
        onNotify('Academic record removed.');
        setDeleteTarget(null);
      }
    } catch {
      onNotify('Failed to delete item.');
    }
  };

  const paperColumns: Column<QuestionPaperItem>[] = [
    {
      key: 'title',
      header: 'Paper Title / Subject',
      priority: 'high',
      render: (p) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">{p.title}</p>
          <p className="text-[11px] text-slate-400">{p.subject} • Class {p.classGrade}</p>
        </div>
      ),
    },
    {
      key: 'examType',
      header: 'Exam Type',
      priority: 'medium',
      render: (p) => (
        <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium border border-purple-200">
          {p.examType}
        </span>
      ),
    },
    {
      key: 'academicYear',
      header: 'Academic Session',
      priority: 'medium',
      render: (p) => <span className="font-mono text-xs text-slate-600">{p.academicYear}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      priority: 'high',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setDeleteTarget({ id: p.id, title: p.title, type: 'paper' })}
            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            title="Delete paper"
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('papers')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'papers'
                ? 'bg-[#0B192C] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Question Papers ({papers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-[#0B192C] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Study Materials ({materials.length})
          </button>
        </div>

        <Button
          size="sm"
          className="bg-[#0B192C] text-white"
          onClick={() => setIsCreatePaperOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Question Paper
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <Table
          columns={paperColumns}
          data={papers}
          keyExtractor={(p) => p.id}
          isLoading={isLoading}
          emptyState={<div className="text-center text-slate-500 py-6">No question papers uploaded.</div>}
        />
      </div>

      <Modal
        isOpen={isCreatePaperOpen}
        onClose={() => setIsCreatePaperOpen(false)}
        title="Upload / Register Official Question Paper"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePaper} className="space-y-4 py-2">
          <Input
            label="Title"
            placeholder="e.g., Class 10 Pre-Board IT 402 Paper"
            value={paperForm.title}
            onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Subject"
              value={paperForm.subject}
              onChange={(e) => setPaperForm({ ...paperForm, subject: e.target.value })}
              required
            />
            <Input
              label="Class Grade"
              value={paperForm.classGrade}
              onChange={(e) => setPaperForm({ ...paperForm, classGrade: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Academic Session"
              value={paperForm.academicYear}
              onChange={(e) => setPaperForm({ ...paperForm, academicYear: e.target.value })}
              required
            />
            <Input
              label="Exam Type"
              value={paperForm.examType}
              onChange={(e) => setPaperForm({ ...paperForm, examType: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreatePaperOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0B192C] text-white" isLoading={createLoading}>
              Save Paper
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Academic Record?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};
