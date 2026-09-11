/**
 * St. Mary's English School - IT Club Platform
 * Member Login UI Foundation
 * 
 * PROMPT 5: Academic Member Login Model
 * 
 * Strict Specification Rules:
 * 1. Member login must NOT use email.
 * 2. Requires Applicant Number + Member Password.
 *    - Applicant Number: System-generated member ID (e.g. 1, 1042).
 *    - Member Password format: Birth Year + Class + Section (e.g. 2012XC or 201210C, no spaces).
 * 3. Never expose or create public self-registration UI.
 * 4. School-branded, accessible, responsive dialog.
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User, Lock, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { SCHOOL_BRAND } from '../../constants/branding';
import { useAuth } from './AuthProvider';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSwitchToAdmin?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToAdmin,
}) => {
  const { signInWithApplicantNumber } = useAuth();
  const [applicantNumber, setApplicantNumber] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanApplicantNo = applicantNumber.trim();
    const cleanPassword = memberPassword.trim();

    if (!cleanApplicantNo) {
      setError('Please enter your assigned Applicant Number.');
      return;
    }

    if (!cleanPassword) {
      setError('Member Password is required.');
      return;
    }

    if (cleanPassword.length < 4) {
      setError('Please enter a valid member password or initial credential.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signInWithApplicantNumber(cleanApplicantNo, cleanPassword);

      setIsSubmitting(false);

      if (result.success) {
        setApplicantNumber('');
        setMemberPassword('');
        onClose();
        onSuccess?.();
      } else {
        // Human-readable academic feedback
        setError(
          result.error ||
            'Invalid Applicant Number or Member Password. Please verify your student records.'
        );
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${SCHOOL_BRAND.shortName} Member Portal`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Academic Guidance Note */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-600 space-y-1.5">
          <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-pink-600" />
            <span>Student Member Authentication</span>
          </div>
          <p className="leading-relaxed">
            Enter your official <strong>Applicant Number</strong> (<code className="bg-neutral-200/70 px-1 py-0.5 rounded text-neutral-800 font-mono text-[11px]">IT@N</code>) and your <strong>School Admission Number</strong> as your password.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Applicant Number (Format: IT@N) */}
        <Input
          label="Applicant Number"
          type="text"
          placeholder="e.g. IT@1 or IT@25"
          value={applicantNumber}
          onChange={(e) => setApplicantNumber(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          helperText="Format: IT@N (e.g., IT@1, IT@25)"
          required
          autoComplete="username"
        />

        {/* 2. Password: School Admission Number */}
        <Input
          label="Password"
          type="password"
          placeholder="e.g. School Admission Number (e.g. 6756)"
          value={memberPassword}
          onChange={(e) => setMemberPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          helperText="Your official School Admission Number"
          required
          autoComplete="current-password"
        />

        {/* Action Button */}
        <div className="pt-2 space-y-2.5">
          <Button
            type="submit"
            variant="dark"
            className="w-full py-2.5 shadow-xs"
            isLoading={isSubmitting}
          >
            Sign In to Member Portal
          </Button>

          {onSwitchToAdmin && (
            <div className="text-center pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="text-xs text-neutral-500 hover:text-pink-600 font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorized Faculty / Admin Verification &rarr;</span>
              </button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
