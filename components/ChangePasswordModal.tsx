'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/lib/services';
import { useAuthStore } from '@/lib/stores/authStore';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { user, accessToken } = useAuthStore();

  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({ old_password: '', new_password: '', new_password_confirm: '' });
    setShowPasswords({ old: false, new: false, confirm: false });
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): string | null => {
    if (!formData.old_password) return 'Please enter your current password.';
    if (!formData.new_password) return 'Please enter a new password.';
    if (formData.new_password.length < 6) return 'New password must be at least 6 characters.';
    if (!formData.new_password_confirm) return 'Please confirm your new password.';
    if (formData.new_password !== formData.new_password_confirm)
      return 'New password and confirmation do not match.';
    if (formData.old_password === formData.new_password)
      return 'New password must be different from the current password.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user?.email || !accessToken) {
      setError('You must be logged in to change your password.');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.changePassword(accessToken, {
        email: user.email,
        old_password: formData.old_password,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm,
      });
      setSuccess('Password changed successfully!');
      setFormData({ old_password: '', new_password: '', new_password_confirm: '' });

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      // Handle structured API errors
      const message =
        err?.message ||
        err?.detail ||
        'An unexpected error occurred. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-amber-700/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-700/10 bg-gradient-to-r from-[#145434] to-[#1a6b43]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Change Password</h2>
              <p className="text-sm text-white/70">Update your account password</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error alert */}
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success alert */}
          {success && (
            <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                value={formData.old_password}
                onChange={(e) =>
                  setFormData({ ...formData, old_password: e.target.value })
                }
                className="w-full px-3 py-2.5 pr-10 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 bg-white/50 text-black placeholder:text-stone-400"
                placeholder="Enter current password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, old: !showPasswords.old })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700"
              >
                {showPasswords.old ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) =>
                  setFormData({ ...formData, new_password: e.target.value })
                }
                className="w-full px-3 py-2.5 pr-10 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 bg-white/50 text-black placeholder:text-stone-400"
                placeholder="Enter new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {formData.new_password && formData.new_password.length < 6 && (
              <p className="text-xs text-amber-600 mt-1">
                Must be at least 6 characters
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.new_password_confirm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    new_password_confirm: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 pr-10 border border-amber-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 bg-white/50 text-black placeholder:text-stone-400"
                placeholder="Re-enter new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    confirm: !showPasswords.confirm,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {formData.new_password_confirm &&
              formData.new_password !== formData.new_password_confirm && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border-amber-700/30 text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#145434] hover:bg-[#1a6b43] text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Changing...
                </div>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
