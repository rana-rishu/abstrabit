import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../store/AuthContext';
import { apiClient } from '../../services/api.service';
import { ApiResponseSuccess } from '../../types/api.types';
import { LoginResponse } from '../../types/auth.types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<ApiResponseSuccess<LoginResponse>>('/api/v1/auth/login', {
        email,
        password,
      });

      const { user, tokens } = response.data.data;
      login(tokens.accessToken, tokens.refreshToken, user);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Invalid email or password.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-txt-primary">Welcome Back</h2>
        <p className="text-xs text-txt-secondary">Sign in to your enterprise workspace</p>
      </div>

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

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password123!"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Link
            to="/forgot-password"
            className="absolute right-0 top-0 text-xs text-accent-primary hover:underline"
          >
            Forgot password?
          </Link>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-2xs text-txt-muted hover:text-txt-primary"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <Button variant="primary" type="submit" isLoading={isLoading} className="mt-2 w-full">
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-txt-muted">
        Don't have an account?{' '}
        <Link to="/register" className="text-txt-primary underline hover:text-white">
          Create one now
        </Link>
      </div>
    </div>
  );
};
