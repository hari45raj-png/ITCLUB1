/**
 * St. Mary's English School - IT Club Platform
 * Mock Data Cleanup Module
 * 
 * PROMPT 9: Authoritative Mock Data Cleanup Mechanism
 * 
 * Capabilities:
 * - Real-time scan of candidate placeholder/demo records.
 * - Soft-Archive action: Hides demo content without permanent data loss.
 * - Permanent Removal action: Purges placeholder content; requires typing "CLEAN MOCK DATA" confirmation phrase.
 * - Authoritative audit logging on every action.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { AuthService } from '../../services/authService';
import {
  Trash2,
  Archive,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Database
} from 'lucide-react';

interface MockScanData {
  totalCandidateCount: number;
  breakdown: {
    posts: number;
    notices: number;
    events: number;
    gallery: number;
    questionPapers: number;
    contactMessages: number;
    resources: number;
  };
}

interface AdminMockDataCleanupModuleProps {
  onNotify: (msg: string) => void;
  onRefreshParentStats?: () => void;
}

export const AdminMockDataCleanupModule: React.FC<AdminMockDataCleanupModuleProps> = ({
  onNotify,
  onRefreshParentStats,
}) => {
  const [scanData, setScanData] = useState<MockScanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchScan = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/mock-data/candidates', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScanData(data.data);
      } else {
        setErrorMessage(data.message || 'Failed to scan mock records.');
      }
    } catch {
      setErrorMessage('Failed to connect to cleanup scanner.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScan();
  }, []);

  const handleArchiveAll = async () => {
    setIsArchiving(true);
    setErrorMessage('');
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/mock-data/archive-all', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onNotify(data.message);
        fetchScan();
        onRefreshParentStats?.();
      } else {
        setErrorMessage(data.message || 'Soft archive failed.');
      }
    } catch {
      setErrorMessage('Communication failure during soft-archive.');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRemoveAll = async () => {
    if (confirmPhrase !== 'CLEAN MOCK DATA') {
      setErrorMessage('Please type the exact phrase "CLEAN MOCK DATA" to confirm.');
      return;
    }

    setIsCleaning(true);
    setErrorMessage('');
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/mock-data/remove-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ confirmPhrase }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onNotify(data.message);
        setConfirmPhrase('');
        fetchScan();
        onRefreshParentStats?.();
      } else {
        setErrorMessage(data.message || 'Removal failed.');
      }
    } catch {
      setErrorMessage('Communication failure during mock cleanup.');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base text-[#0B192C]">
            <Database className="w-5 h-5 text-amber-600" />
            <span>Demonstration & Mock Data Management</span>
          </div>
          <Button
            size="xs"
            variant="outline"
            onClick={fetchScan}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Rescan Collections
          </Button>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          The platform includes seed demonstration items across events, notices, question papers, and articles. 
          Use this panel to safely soft-archive demo items (hiding them from visitors) or permanently clean them once real institutional content is published.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {/* Candidate Scan Results */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Detected Candidate Records Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(scanData?.breakdown || {}).map(([key, count]) => (
            <div key={key} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block capitalize">
                {key}
              </span>
              <span className="text-xl font-black text-[#0B192C]">{isLoading ? '...' : count}</span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Total Detected Candidate Items:</span>
          <span className="font-black text-sm text-[#0B192C]">
            {isLoading ? 'Scanning...' : scanData?.totalCandidateCount ?? 0}
          </span>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action 1: Soft Archive */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0B192C]">
              <Archive className="w-4 h-4 text-amber-600" />
              <span>Action 1: Soft Archive Demo Records</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Updates all identified candidate demo items to <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">archived</code> status. 
              This instantly hides them from public site visitors while preserving them in database tables for reference.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full border-amber-300 text-amber-900 hover:bg-amber-50"
            onClick={handleArchiveAll}
            isLoading={isArchiving}
            disabled={(scanData?.totalCandidateCount ?? 0) === 0}
            leftIcon={<Archive className="w-4 h-4" />}
          >
            Soft Archive All Mock Items
          </Button>
        </div>

        {/* Action 2: Permanent Removal */}
        <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Action 2: Permanent Data Cleanup</span>
            </div>
            <p className="text-xs text-rose-900/80 leading-relaxed">
              Permanently purges detected demo records from active collections. 
              Executive safety confirmation required to prevent accidental erasure.
            </p>

            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Type <span className="font-mono font-bold text-rose-700">CLEAN MOCK DATA</span> to confirm:
              </label>
              <input
                type="text"
                placeholder="CLEAN MOCK DATA"
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full bg-rose-700 hover:bg-rose-800 text-white"
            onClick={handleRemoveAll}
            isLoading={isCleaning}
            disabled={confirmPhrase !== 'CLEAN MOCK DATA' || (scanData?.totalCandidateCount ?? 0) === 0}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Permanently Remove Mock Records
          </Button>
        </div>
      </div>
    </div>
  );
};
