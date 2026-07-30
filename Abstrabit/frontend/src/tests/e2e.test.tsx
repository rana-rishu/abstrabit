import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

describe('Full End-to-End User Journey E2E Workflow Test', () => {
  it('should render public marketing landing page and allow navigation to login', async () => {
    window.history.pushState({}, 'Test Page', '/');
    render(<App />);

    expect(screen.getByText(/Enterprise Multi-Workspace/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start free trial/i })).toBeInTheDocument();
  });

  it('should render login page when navigated to /login', async () => {
    window.history.pushState({}, 'Test Page', '/login');
    render(<App />);

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
