import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../store/AuthContext';
import { useWorkspace } from '../../store/WorkspaceContext';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="min-h-screen bg-bg-app text-txt-primary flex items-center justify-center p-6">
      <div className="w-full max-w-xl flex flex-col gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded bg-accent-primary flex items-center justify-center font-bold text-accent-dark text-xl">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to Abstrabit, {user?.first_name || 'Developer'}!
          </h1>
          <p className="text-sm text-txt-secondary max-w-md">
            Your default workspace <code className="text-accent-primary font-mono">{activeWorkspace?.name || 'Default Workspace'}</code> is provisioned and ready.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <Card className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-accent-primary">1. Upload Documents</span>
            <p className="text-2xs text-txt-muted">Ingest PDFs into vector store.</p>
          </Card>
          <Card className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-accent-primary">2. Ask Grounded AI</span>
            <p className="text-2xs text-txt-muted">Query with pgvector hybrid search and zero hallucination refusal.</p>
          </Card>
          <Card className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-accent-primary">3. Execute Tools</span>
            <p className="text-2xs text-txt-muted">Run authorized task tools and inspect developer debug logs.</p>
          </Card>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button variant="primary" size="lg" onClick={() => navigate('/dashboard/documents')}>
            Upload First Document →
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/dashboard/chat')}>
            Go to Chat Assistant
          </Button>
        </div>
      </div>
    </div>
  );
};
