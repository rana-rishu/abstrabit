import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../services/api.service';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
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
      await apiClient.post('/api/v1/auth/forgot-password', { email, password });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-txt-primary">Reset Password</h2>
        <p className="text-xs text-txt-secondary">
          Enter your registered email and a new password to update it directly
        </p>
      </div>

      {success ? (
        <div className="flex flex-col gap-4 text-center">
          <div className="p-3 bg-neutral-900 border border-border-subtle rounded text-xs text-txt-secondary">
            Your password has been changed successfully. You can now use your new password to sign in.
          </div>
          <Link to="/login" className="text-xs text-accent-primary underline hover:text-white">
            Return to sign in
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
              label="Email Address"
              type="email"
              placeholder="demo@abstrabit.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

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

          <div className="text-center text-xs text-txt-muted">
            Remember your password?{' '}
            <Link to="/login" className="text-txt-primary underline hover:text-white">
              Sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
