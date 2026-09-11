/**
 * St. Mary's English School - IT Club Platform
 * Admin Settings & Information Module
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AuthService } from '../../services/authService';
import { SCHOOL_BRAND } from '../../constants/branding';
import { Settings, Save, Shield, School, Mail, Phone, Calendar } from 'lucide-react';

interface AdminSettingsModuleProps {
  onNotify: (msg: string) => void;
}

export const AdminSettingsModule: React.FC<AdminSettingsModuleProps> = ({ onNotify }) => {
  const [form, setForm] = useState({
    tagline: '',
    contactEmail: '',
    contactPhone: '',
    academicSession: '',
    maintenanceMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const { session } = await AuthService.getSession();
        const token = session?.access_token;
        const res = await fetch('/api/admin/settings', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setForm({
            tagline: data.data.tagline || SCHOOL_BRAND.motto,
            contactEmail: data.data.contactEmail || 'contact@stmarysbarbigha.edu.in',
            contactPhone: data.data.contactPhone || '+91 6341 222333',
            academicSession: data.data.academicSession || '2026-2027',
            maintenanceMode: Boolean(data.data.maintenanceMode),
          });
        }
      } catch {
        onNotify('Failed to fetch settings.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [onNotify]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { session } = await AuthService.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onNotify('Institutional settings saved successfully.');
      } else {
        onNotify(data.message || 'Failed to update settings.');
      }
    } catch {
      onNotify('Service request failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 font-bold text-base text-[#0B192C]">
            <School className="w-5 h-5 text-blue-700" />
            <span>School Institutional Configuration</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global institution parameters for {SCHOOL_BRAND.schoolName}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Club Motto / Tagline"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            leftIcon={<Settings className="w-4 h-4" />}
            required
          />

          <Input
            label="Current Academic Session"
            value={form.academicSession}
            onChange={(e) => setForm({ ...form, academicSession: e.target.value })}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />

          <Input
            label="Official Contact Email"
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Official Telephone"
            value={form.contactPhone}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900">Maintenance Mode</span>
            <p className="text-[11px] text-slate-500">
              When enabled, a maintenance indicator will appear for public visitors.
            </p>
          </div>
          <input
            type="checkbox"
            checked={form.maintenanceMode}
            onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
            className="w-4 h-4 text-[#0B192C] rounded focus:ring-0"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="bg-[#0B192C] text-white"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Institutional Settings
          </Button>
        </div>
      </div>
    </form>
  );
};
