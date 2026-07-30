import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../services/api.service';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/api/v1/auth/reset-password', {
        token,
        password,
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to reset password. The link may have expired.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-txt-primary">Invalid Link</h2>
          <p className="text-xs text-txt-secondary">The password reset token is missing or invalid.</p>
        </div>
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
          This link is invalid or has expired. Please request a new password reset link.
        </div>
        <Link to="/forgot-password" className="text-xs text-accent-primary underline hover:text-white">
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-txt-primary">Set New Password</h2>
        <p className="text-xs text-txt-secondary">Please enter your new security credentials</p>
      </div>

      {success ? (
        <div className="flex flex-col gap-4 text-center">
          <div className="p-3 bg-neutral-900 border border-border-subtle rounded text-xs text-txt-secondary">
            Your password has been reset successfully.
          </div>
          <Link to="/login" className="text-xs text-accent-primary underline hover:text-white">
            Click here to sign in
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button variant="primary" type="submit" isLoading={isLoading} className="mt-2 w-full">
              Reset Password
            </Button>
          </form>
        </>
      )}
    </div>
  );
};
