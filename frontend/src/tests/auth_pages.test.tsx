import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from '../pages/marketing/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { AuthProvider } from '../store/AuthContext';

describe('LandingPage Unit Tests', () => {
  it('should render main headline, CTAs, and feature matrix', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Enterprise Multi-Workspace/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start free trial/i })).toBeInTheDocument();
    expect(screen.getByText(/Tenant-Isolated Vector Search/i)).toBeInTheDocument();
  });
});

describe('LoginPage Unit Tests', () => {
  it('should render login email, password inputs, and sign in button', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
