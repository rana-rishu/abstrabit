import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useWorkspace } from '../../store/WorkspaceContext';
import { apiClient } from '../../services/api.service';

export interface WorkspaceSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceSwitcherModal: React.FC<WorkspaceSwitcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { workspaces, activeWorkspace, setActiveWorkspaceId, refreshWorkspaces } = useWorkspace();
  const [newWsName, setNewWsName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setIsCreating(true);
    try {
      const res = await apiClient.post('/api/v1/auth/workspaces', { name: newWsName });
      await refreshWorkspaces();
      setActiveWorkspaceId(res.data.data.id);
      setNewWsName('');
      onClose();
    } catch (err) {
      console.error('Failed to create workspace', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <h3 className="text-sm font-bold text-txt-primary">Switch Workspace</h3>
          <button onClick={onClose} className="text-xs text-txt-muted hover:text-txt-primary">
            ✕
          </button>
        </div>

        {/* Existing Workspaces List */}
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => {
                setActiveWorkspaceId(ws.id);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs text-left transition-colors border ${
                activeWorkspace?.id === ws.id
                  ? 'bg-bg-hover border-border-strong text-txt-primary font-semibold'
                  : 'border-border-subtle text-txt-secondary hover:bg-bg-hover/50'
              }`}
            >
              <div className="flex flex-col">
                <span>{ws.name}</span>
                <span className="text-2xs text-txt-muted font-mono">{ws.slug}</span>
              </div>
              {activeWorkspace?.id === ws.id && <span className="text-xs text-accent-primary">✓</span>}
            </button>
          ))}
        </div>

        {/* Create New Workspace Form */}
        <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-3 border-t border-border-subtle pt-4">
          <span className="text-xs font-medium text-txt-secondary">Create New Workspace</span>
          <div className="flex gap-2">
            <Input
              placeholder="Workspace Name (e.g. Engineering)"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              className="flex-1"
            />
            <Button variant="primary" type="submit" isLoading={isCreating}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
