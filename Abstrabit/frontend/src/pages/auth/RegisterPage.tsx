import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../store/AuthContext';
import { apiClient } from '../../services/api.service';
import { ApiResponseSuccess } from '../../types/api.types';
import { LoginResponse } from '../../types/auth.types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<ApiResponseSuccess<LoginResponse>>('/api/v1/auth/register', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      const { user, tokens } = response.data.data;
      login(tokens.accessToken, tokens.refreshToken, user);
      navigate('/onboarding');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Email may already be in use.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-txt-primary">Create Your Account</h2>
        <p className="text-xs text-txt-secondary">Set up your workspace in less than 2 minutes</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password (min 8 chars)"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button variant="primary" type="submit" isLoading={isLoading} className="mt-2 w-full">
          Create Account →
        </Button>
      </form>

      <div className="text-center text-xs text-txt-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-txt-primary underline hover:text-white">
          Sign In
        </Link>
      </div>
    </div>
  );
};
