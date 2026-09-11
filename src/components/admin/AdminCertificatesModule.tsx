/**
 * St. Mary's English School - IT Club Platform
 * Admin Certificates Management Module
 */

import React, { useState, useEffect } from 'react';
import { Table, Column } from '../ui/Table';
import { Badge, BadgeVariant } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Modal } from '../ui/Modal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { AuthService } from '../../services/authService';
import { Award, Plus, Search, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

interface CertificateItem {
  id: string;
  recipientId: string;
  title: string;
  description: string;
  issueDate: string;
  certificateNumber: string;
  verificationCode: string;
  status: 'valid' | 'revoked';
  issuerName: string;
}

interface AdminCertificatesModuleProps {
  onNotify: (msg: string) => void;
}

export const AdminCertificatesModule: React.FC<AdminCertificatesModuleProps> = ({ onNotify }) => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    recipientId: '',
    title: 'Certificate of Technical Excellence',
    description: 'Awarded for outstanding contribution to the IT Club web platform & technical events.',
    issueDate: new Date().toISOString().split('T')[0],
  });
  const [issueLoading, setIssueLoading] = useState(false);

  const [revokeTarget, setRevokeTarget] = useState<CertificateItem | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);

  const fetchCerts = async () => {
    setIsLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/certificates', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCertificates(data.data || []);
      }
    } catch {
      onNotify('Failed to fetch certificates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.recipientId.trim() || !issueForm.title.trim()) return;

    setIssueLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(issueForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsIssueOpen(false);
        fetchCerts();
        onNotify(`Certificate ${data.data.certificateNumber} issued.`);
      } else {
        onNotify(data.message || 'Failed to issue certificate.');
      }
    } catch {
      onNotify('Service request error.');
    } finally {
      setIssueLoading(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokeTarget) return;
    setRevokeLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/admin/certificates/${revokeTarget.id}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: revokeReason }),
      });
      if (res.ok) {
        fetchCerts();
        onNotify(`Certificate ${revokeTarget.certificateNumber} revoked.`);
        setRevokeTarget(null);
        setRevokeReason('');
      }
    } catch {
      onNotify('Failed to revoke certificate.');
    } finally {
      setRevokeLoading(false);
    }
  };

  const columns: Column<CertificateItem>[] = [
    {
      key: 'certificateNumber',
      header: 'Certificate ID',
      priority: 'high',
      render: (c) => (
        <span className="font-mono text-xs font-bold text-[#0B192C]">
          {c.certificateNumber}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Title / Subject',
      priority: 'high',
      render: (c) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">{c.title}</p>
          <p className="text-[11px] text-slate-400">Code: {c.verificationCode}</p>
        </div>
      ),
    },
    {
      key: 'issueDate',
      header: 'Issued Date',
      priority: 'medium',
      render: (c) => <span className="font-mono text-xs text-slate-600">{c.issueDate}</span>,
    },
    {
      key: 'status',
      header: 'Verification Status',
      priority: 'high',
      render: (c) => {
        const isValid = c.status === 'valid';
        return (
          <Badge variant={isValid ? 'published' : 'archived'} size="xs" dot>
            {isValid ? 'VALID' : 'REVOKED'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      priority: 'high',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          {c.status === 'valid' && (
            <button
              type="button"
              onClick={() => setRevokeTarget(c)}
              className="px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 rounded border border-rose-200 font-semibold cursor-pointer"
            >
              Revoke
            </button>
          )}
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
            placeholder="Search certificate number, code, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B192C]"
          />
        </div>

        <Button
          size="sm"
          className="bg-[#0B192C] text-white"
          onClick={() => setIsIssueOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Issue Certificate
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <Table
          columns={columns}
          data={certificates}
          keyExtractor={(c) => c.id}
          isLoading={isLoading}
          emptyState={<div className="text-center text-slate-500 py-6">No certificates registered.</div>}
        />
      </div>

      {/* Issue Modal */}
      <Modal
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        title="Issue Official Institutional Certificate"
        maxWidth="md"
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4 py-2">
          <Input
            label="Recipient Student / Member ID"
            placeholder="e.g., m-1 or student user ID"
            value={issueForm.recipientId}
            onChange={(e) => setIssueForm({ ...issueForm, recipientId: e.target.value })}
            required
          />

          <Input
            label="Certificate Title / Honor"
            value={issueForm.title}
            onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
            required
          />

          <Textarea
            label="Citation / Description"
            rows={3}
            value={issueForm.description}
            onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsIssueOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0B192C] text-white" isLoading={issueLoading}>
              Issue & Cryptographically Sign
            </Button>
          </div>
        </form>
      </Modal>

      {/* Revoke Modal */}
      <Modal
        isOpen={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        title="Revoke Certificate"
        maxWidth="sm"
      >
        <div className="space-y-4 py-2">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
            <p className="font-bold">Administrative Certificate Revocation</p>
            <p>
              Are you sure you want to revoke certificate <strong>{revokeTarget?.certificateNumber}</strong>? The public verification code will be invalidated.
            </p>
          </div>

          <Textarea
            label="Revocation Reason"
            rows={2}
            placeholder="State institutional reason for revoking..."
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRevokeTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-rose-700 hover:bg-rose-800 text-white"
              onClick={handleRevokeConfirm}
              isLoading={revokeLoading}
            >
              Confirm Revocation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
