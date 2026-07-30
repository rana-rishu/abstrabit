import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TasksPage } from '../pages/dashboard/TasksPage';
import { DebuggerPage } from '../pages/dashboard/DebuggerPage';
import { ToolLogsPage } from '../pages/dashboard/ToolLogsPage';
import { WorkspaceProvider } from '../store/WorkspaceContext';
import { AuthProvider } from '../store/AuthContext';

describe('TasksPage Unit Tests', () => {
  it('should render task board header and create task input', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <TasksPage />
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText(/workspace task board/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/new task title/i)).toBeInTheDocument();
  });
});

describe('DebuggerPage Unit Tests', () => {
  it('should render developer retrieval debugger header and inspect button', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <DebuggerPage />
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText(/developer retrieval debugger/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inspect pipeline/i })).toBeInTheDocument();
  });
});

describe('ToolLogsPage Unit Tests', () => {
  it('should render tool audit logs header and search filter', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <ToolLogsPage />
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText(/tool execution audit logs/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by tool name or request id/i)).toBeInTheDocument();
  });
});
