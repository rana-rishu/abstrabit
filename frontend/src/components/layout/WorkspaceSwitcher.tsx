import React, { useState } from 'react';
import { useWorkspace } from '../../store/WorkspaceContext';
import { apiClient } from '../../services/api.service';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const WorkspaceSwitcher: React.FC = () => {
  const { activeWorkspace, workspaces, setActiveWorkspaceId, refreshWorkspaces } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!activeWorkspace) return null;

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/api/v1/workspaces', {
        name: newWorkspaceName.trim(),
      });
      
      const newWs = res.data.data;
      setNewWorkspaceName('');
      setIsCreating(false);
      
      // Refresh the workspace list and switch to the new one
      await refreshWorkspaces();
      setActiveWorkspaceId(newWs.id);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to create workspace.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-2">
      {isCreating ? (
        <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-2 p-2 border border-border-subtle rounded bg-bg-card">
          <span className="text-2xs font-semibold text-txt-secondary uppercase tracking-wider">New Workspace</span>
          <Input
            placeholder="Workspace Name"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            required
            className="h-8 text-xs"
            disabled={isLoading}
          />
          {error && <p className="text-2xs text-red-400">{error}</p>}
          <div className="flex gap-1.5 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setError(null);
              }}
              disabled={isLoading}
              className="h-7 px-2 text-2xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              className="h-7 px-3 text-2xs"
            >
              Create
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex gap-1.5 items-center">
          <select
            value={activeWorkspace.id}
            onChange={(e) => setActiveWorkspaceId(e.target.value)}
            className="flex-1 h-9 bg-bg-card border border-border-subtle rounded px-3 py-1.5 text-sm text-txt-primary font-medium focus:border-border-strong focus:outline-none cursor-pointer"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id} className="bg-bg-card text-txt-primary">
                {ws.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsCreating(true)}
            className="h-9 w-9 flex items-center justify-center border border-border-subtle bg-bg-card hover:bg-bg-hover text-txt-secondary hover:text-txt-primary rounded transition-colors cursor-pointer text-base"
            title="Create Workspace"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};
