/**
 * St. Mary's English School - IT Club Platform
 * Admin Audit Logs Module
 */

import React, { useState, useEffect } from 'react';
import { Table, Column } from '../ui/Table';
import { Button } from '../ui/Button';
import { AuthService } from '../../services/authService';
import { ShieldCheck, RefreshCw, Search, Lock, UserCheck } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  targetId?: string;
  details?: any;
  timestamp: string;
}

interface AdminAuditLogsModuleProps {
  onNotify: (msg: string) => void;
}

export const AdminAuditLogsModule: React.FC<AdminAuditLogsModuleProps> = ({ onNotify }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/audit-logs?limit=100', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.data || []);
      }
    } catch {
      onNotify('Failed to fetch audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      log.targetEntity.toLowerCase().includes(q)
    );
  });

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      priority: 'high',
      render: (l) => (
        <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
          {new Date(l.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actorName',
      header: 'Authoritative Actor',
      priority: 'high',
      render: (l) => (
        <div className="flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-semibold text-xs text-slate-900">{l.actorName}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
            {l.actorRole}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Event Action',
      priority: 'high',
      render: (l) => (
        <span className="font-mono text-xs font-bold text-[#0B192C]">
          {l.action}
        </span>
      ),
    },
    {
      key: 'targetEntity',
      header: 'Target Entity',
      priority: 'medium',
      render: (l) => (
        <span className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          {l.targetEntity} {l.targetId ? `(${l.targetId.slice(0, 10)}...)` : ''}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Context Payload',
      priority: 'low',
      render: (l) => (
        <span className="text-[11px] text-slate-400 truncate max-w-xs block font-mono">
          {l.details ? JSON.stringify(l.details) : '—'}
        </span>
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
            placeholder="Search audit actions, actors, or tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B192C]"
          />
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchLogs}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Audit Trail
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <Table
          columns={columns}
          data={filteredLogs}
          keyExtractor={(l) => l.id}
          isLoading={isLoading}
          emptyState={<div className="text-center text-slate-500 py-6">No audit logs recorded yet.</div>}
        />
      </div>
    </div>
  );
};
