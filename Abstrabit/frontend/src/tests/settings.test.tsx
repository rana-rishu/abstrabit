import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SettingsPage } from '../pages/dashboard/SettingsPage';
import { WorkspaceProvider } from '../store/WorkspaceContext';
import { AuthProvider } from '../store/AuthContext';

describe('SettingsPage Unit Tests', () => {
  it('should render settings tabs (Workspace, Profile, Team, API Keys)', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <SettingsPage />
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText(/workspace & account settings/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /team/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /api keys/i })).toBeInTheDocument();
  });
});
