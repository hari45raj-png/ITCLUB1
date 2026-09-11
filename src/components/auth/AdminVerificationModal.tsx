/**
 * St. Mary's English School - IT Club Platform
 * Administrative Verification Modal
 * 
 * PROMPT 5: Multi-Stage Admin Verification Pattern
 * 
 * Specification:
 * - Flow: Visitor -> Member Authentication -> Admin Verification -> Admin Control Center
 * - Password-only verification at the administrative stage.
 * - CRITICAL: Never hard-code administrative credentials in frontend code!
 * - Verification is routed to a secure backend endpoint (/api/auth/verify-admin).
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ShieldAlert, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SCHOOL_BRAND } from '../../constants/branding';
import { useAuth } from './AuthProvider';
import { AuthService } from '../../services/authService';

interface AdminVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminVerificationModal: React.FC<AdminVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [adminPasscode, setAdminPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passcode = adminPasscode.trim();
    if (!passcode) {
      setError('Please enter the administrative security passcode.');
      return;
    }

    setIsVerifying(true);

    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;

      // Secure server-side verification with Authorization header & rate-limiting
      const response = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ passcode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsVerified(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('smes_admin_clearance_token', data.adminToken || 'verified');
          sessionStorage.setItem('smes_admin_verified_at', String(Date.now()));
        }
        setTimeout(() => {
          setIsVerified(false);
          setAdminPasscode('');
          onSuccess();
          onClose();
        }, 500);
      } else {
        setError(data.message || 'Invalid administrative security passcode.');
      }
    } catch (err: any) {
      setError('Failed to reach administrative verification service. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Administrative Security Verification"
      maxWidth="sm"
    >
      <form onSubmit={handleVerify} className="space-y-4">
        {/* Security Warning Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-800">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>Restricted Access Boundary</span>
          </div>
          <p className="leading-relaxed text-amber-800/90">
            You are entering the <strong>{SCHOOL_BRAND.shortName} Admin Control Center</strong>. All actions are cryptographically signed and logged for institutional auditing.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isVerified && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">Administrative clearance granted. Launching Control Center...</span>
          </div>
        )}

        <Input
          label="Administrative Passcode"
          type="password"
          placeholder="Enter authorized key"
          value={adminPasscode}
          onChange={(e) => setAdminPasscode(e.target.value)}
          leftIcon={<KeyRound className="w-4 h-4" />}
          helperText="Single-stage passcode verified securely via server-side secrets"
          required
          autoComplete="off"
          disabled={isVerifying || isVerified}
        />

        <div className="pt-2 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isVerifying || isVerified}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="dark"
            isLoading={isVerifying}
            disabled={isVerified}
          >
            Verify Administrative Clearance
          </Button>
        </div>
      </form>
    </Modal>
  );
};
