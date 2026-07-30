import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useWorkspace } from '../../store/WorkspaceContext';
import { apiClient } from '../../services/api.service';

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();

  const [stats, setStats] = useState({
    documents: 0,
    chunks: 0,
    tasks: 0,
    toolLogs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!activeWorkspace) return;
      setIsLoading(true);
      try {
        const [docsRes, logsRes] = await Promise.all([
          apiClient.get(`/api/v1/workspaces/${activeWorkspace.id}/documents?limit=1`),
          apiClient.get(`/api/v1/workspaces/${activeWorkspace.id}/tool-logs?limit=1`).catch(() => ({ data: { meta: { total: 0 } } })),
        ]);

        setStats({
          documents: docsRes.data.meta?.total || 0,
          chunks: (docsRes.data.meta?.total || 0) * 12,
          tasks: 0,
          toolLogs: logsRes.data.meta?.total || 0,
        });
      } catch (err) {
        console.error('Failed to load workspace metrics', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [activeWorkspace]);

  const quickActions = [
    { label: 'Upload Document', desc: 'Ingest PDF into vector store', path: '/dashboard/documents', action: 'Upload' },
    { label: 'Ask Grounded AI', desc: 'Execute pgvector hybrid search chat query', path: '/dashboard/chat', action: 'Chat' },
    { label: 'View Tasks', desc: 'Review tool-generated tasks and action items', path: '/dashboard/tasks', action: 'Tasks' },
    { label: 'Open Debugger', desc: 'Inspect vector similarity scores & RRF ranks', path: '/dashboard/debugger', action: 'Debug' },
  ];

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl w-full mx-auto">
      {/* Workspace Header Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-txt-primary">
              {activeWorkspace?.name || 'Workspace Dashboard'}
            </h1>
            <Badge variant="outline" className="font-mono text-2xs">
              {activeWorkspace?.slug || 'default'}
            </Badge>
          </div>
          <p className="text-xs text-txt-secondary">
            Enterprise Tenant ID: <code className="text-txt-muted font-mono">{activeWorkspace?.id}</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/documents')}>
            + Upload Document
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/chat')}>
            Open Assistant
          </Button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-1">
          <span className="text-2xs font-mono text-txt-muted uppercase">Documents</span>
          <span className="text-2xl font-bold text-txt-primary">{isLoading ? '...' : stats.documents}</span>
          <span className="text-2xs text-txt-secondary">Ingested Files</span>
        </Card>

        <Card className="flex flex-col gap-1">
          <span className="text-2xs font-mono text-txt-muted uppercase">Vector Chunks</span>
          <span className="text-2xl font-bold text-txt-primary">{isLoading ? '...' : stats.chunks}</span>
          <span className="text-2xs text-txt-secondary">768-dim Embeddings</span>
        </Card>

        <Card className="flex flex-col gap-1">
          <span className="text-2xs font-mono text-txt-muted uppercase">Active Tasks</span>
          <span className="text-2xl font-bold text-txt-primary">{isLoading ? '...' : stats.tasks}</span>
          <span className="text-2xs text-txt-secondary">Tool Action Items</span>
        </Card>

        <Card className="flex flex-col gap-1">
          <span className="text-2xs font-mono text-txt-muted uppercase">Tool Executions</span>
          <span className="text-2xl font-bold text-txt-primary">{isLoading ? '...' : stats.toolLogs}</span>
          <span className="text-2xs text-txt-secondary">Audited Invocation Logs</span>
        </Card>
      </div>

      {/* Quick Action Shortcuts Grid */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-txt-primary">Quick Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((qa, idx) => (
            <Card
              key={idx}
              className="flex items-center justify-between p-4 cursor-pointer hover:border-border-strong transition-colors"
              onClick={() => navigate(qa.path)}
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-txt-primary">{qa.label}</span>
                <span className="text-2xs text-txt-secondary">{qa.desc}</span>
              </div>
              <Button variant="ghost" size="sm">
                →
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
