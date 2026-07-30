import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { WorkspaceSwitcher } from '../components/layout/WorkspaceSwitcher';
import { CommandPalette } from '../components/ui/CommandPalette';
import { useAuth } from '../store/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const navItems = [
    { label: 'Overview', path: '/dashboard/home' },
    { label: 'Chat Assistant', path: '/dashboard/chat' },
    { label: 'Documents', path: '/dashboard/documents' },
    { label: 'Task Board', path: '/dashboard/tasks' },
    { label: 'Retrieval Debugger', path: '/dashboard/debugger' },
    { label: 'Tool Audit Logs', path: '/dashboard/tool-logs' },
    { label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-app text-txt-primary">
      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Sidebar */}
      <aside className="w-64 border-r border-border-subtle bg-bg-sidebar flex flex-col justify-between p-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-accent-primary flex items-center justify-center font-bold text-accent-dark text-xs">
                A
              </div>
              <span className="font-semibold text-sm tracking-wide">Abstrabit</span>
            </div>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="text-2xs font-mono text-txt-muted hover:text-txt-primary border border-border-subtle rounded px-1.5 py-0.5 bg-bg-hover cursor-pointer"
              title="Open Command Palette (Cmd+K)"
            >
              ⌘K
            </button>
          </div>

          <WorkspaceSwitcher />

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? 'bg-bg-hover text-txt-primary font-semibold'
                      : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-hover/50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Footer */}
        <div className="border-t border-border-subtle pt-4 flex items-center justify-between px-2">
          <div className="flex flex-col truncate">
            <span className="text-xs font-medium truncate">{user?.first_name || user?.email}</span>
            <span className="text-2xs text-txt-muted truncate">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="text-2xs text-txt-muted hover:text-txt-primary transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
