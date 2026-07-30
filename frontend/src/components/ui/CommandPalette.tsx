import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Open Chat Assistant', path: '/dashboard/chat', category: 'Navigation' },
    { label: 'Upload & Manage Documents', path: '/dashboard/documents', category: 'Documents' },
    { label: 'Workspace Task Board', path: '/dashboard/tasks', category: 'Tasks' },
    { label: 'Developer Retrieval Debugger', path: '/dashboard/debugger', category: 'DevTools' },
    { label: 'Tool Execution Audit Logs', path: '/dashboard/tool-logs', category: 'Audit' },
    { label: 'Workspace & User Settings', path: '/dashboard/settings', category: 'Settings' },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-24 p-4">
      <div className="w-full max-w-lg bg-bg-card border border-border-subtle rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-3 border-b border-border-subtle flex items-center gap-2">
          <span className="text-txt-muted text-xs font-mono">⌘K</span>
          <input
            type="text"
            placeholder="Type a command or search workspace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-txt-primary placeholder:text-txt-muted focus:outline-none"
            autoFocus
          />
        </div>

        {/* Command List */}
        <div className="max-h-72 overflow-y-auto p-2 flex flex-col gap-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-txt-muted">No commands found matching '{search}'</div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-xs text-txt-primary hover:bg-bg-hover transition-colors text-left"
              >
                <span>{item.label}</span>
                <span className="text-2xs text-txt-muted font-mono">{item.category}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
