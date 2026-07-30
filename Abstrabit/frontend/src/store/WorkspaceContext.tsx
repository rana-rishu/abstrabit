import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace } from '../types/workspace.types';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/api.service';

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  setActiveWorkspaceId: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkspaces = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/v1/workspaces');
      const wsList: Workspace[] = res.data.data || [];
      setWorkspaces(wsList);

      const savedId = localStorage.getItem('activeWorkspaceId');
      const matching = wsList.find((w) => w.id === savedId);

      if (matching) {
        setActiveWorkspace(matching);
      } else if (wsList.length > 0) {
        setActiveWorkspace(wsList[0]);
        localStorage.setItem('activeWorkspaceId', wsList[0].id);
      }
    } catch (err) {
      console.error('Failed to load workspaces', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setActiveWorkspace(null);
    }
  }, [isAuthenticated]);

  const setActiveWorkspaceId = (workspaceId: string) => {
    const found = workspaces.find((w) => w.id === workspaceId);
    if (found) {
      setActiveWorkspace(found);
      localStorage.setItem('activeWorkspaceId', found.id);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        workspaces,
        isLoading,
        setActiveWorkspaceId,
        refreshWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
