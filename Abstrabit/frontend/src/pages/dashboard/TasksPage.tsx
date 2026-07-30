import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { useWorkspace } from '../../store/WorkspaceContext';
import { apiClient } from '../../services/api.service';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  created_at: string;
}

export const TasksPage: React.FC = () => {
  const { activeWorkspace } = useWorkspace();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchTasks = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/workspaces/${activeWorkspace.id}/tasks?limit=100`);
      setTasks(res.data.data || []);
    } catch (err) {
      console.error('Failed to load workspace tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeWorkspace]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !activeWorkspace) return;

    setIsCreating(true);
    try {
      const res = await apiClient.post(`/api/v1/workspaces/${activeWorkspace.id}/tasks`, {
        title: newTitle.trim(),
        priority: newPriority,
        status: 'PENDING',
      });
      const createdTask = res.data.data;
      setTasks((prev) => [createdTask, ...prev]);
      setNewTitle('');
    } catch (err) {
      console.error('Failed to create task', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (!activeWorkspace) return;
    try {
      await apiClient.patch(`/api/v1/workspaces/${activeWorkspace.id}/tasks/${taskId}/status`, {
        status: newStatus,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!activeWorkspace) return;
    try {
      await apiClient.delete(`/api/v1/workspaces/${activeWorkspace.id}/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-txt-primary">Workspace Task Board</h1>
          <p className="text-xs text-txt-secondary">
            Manage actionable tasks created manually or automatically by AI tool calls
          </p>
        </div>

        <div className="w-64">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Create Task Form */}
      <Card className="flex flex-col sm:flex-row items-center gap-3">
        <Input
          placeholder="New Task Title (e.g. Audit vector search performance)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1"
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as any)}
          className="h-9 bg-bg-input border border-border-subtle rounded px-3 py-1 text-xs text-txt-primary focus:outline-none"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>
        <Button variant="primary" size="sm" onClick={handleCreateTask} isLoading={isCreating}>
          + Create Task
        </Button>
      </Card>

      {/* Task List Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-txt-primary">Active Workspace Action Items</h2>
          <span className="text-2xs text-txt-muted font-mono">{filteredTasks.length} Tasks</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-txt-muted">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title="No Active Tasks"
            description="Create a task above or ask the AI Chat Assistant to save a task automatically."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((t) => (
              <Card key={t.id} className="flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-txt-primary">{t.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={t.priority === 'HIGH' || t.priority === 'URGENT' ? 'error' : 'default'}>
                        {t.priority}
                      </Badge>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="text-red-400 hover:text-red-300 text-2xs cursor-pointer hover:underline transition-all"
                        title="Delete Task"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {t.description && <p className="text-xs text-txt-secondary">{t.description}</p>}
                </div>

                <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                  <select
                    value={t.status}
                    onChange={(e) => handleUpdateStatus(t.id, e.target.value as any)}
                    className="h-7 bg-bg-card border border-border-subtle rounded px-2 py-0.5 text-2xs font-semibold text-txt-primary focus:outline-none cursor-pointer hover:bg-bg-hover"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                  <span className="text-2xs text-txt-muted font-mono">{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
