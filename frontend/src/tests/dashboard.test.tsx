import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardHome } from '../pages/dashboard/DashboardHome';
import { WorkspaceProvider } from '../store/WorkspaceContext';
import { AuthProvider } from '../store/AuthContext';

describe('DashboardHome Unit Tests', () => {
  it('should render workspace metrics cards and quick shortcut actions', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <DashboardHome />
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText(/documents/i)).toBeInTheDocument();
    expect(screen.getByText(/vector chunks/i)).toBeInTheDocument();
    expect(screen.getByText(/active tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/quick shortcuts/i)).toBeInTheDocument();
    expect(screen.getByText(/upload document/i)).toBeInTheDocument();
  });
});
