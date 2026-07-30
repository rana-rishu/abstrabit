import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useWorkspace } from '../../store/WorkspaceContext';
import { useAuth } from '../../store/AuthContext';

export const SettingsPage: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'workspace' | 'profile'>('workspace');
  const [wsName, setWsName] = useState(activeWorkspace?.name || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Profile State
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border-subtle pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-txt-primary">Workspace & Account Settings</h1>
        <p className="text-xs text-txt-secondary">
          Manage general workspace settings, delete workspaces, and update profile credentials
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
        {(['workspace', 'profile'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-bg-hover text-txt-primary font-semibold border border-border-subtle'
                : 'text-txt-muted hover:text-txt-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Workspace Tab */}
      {activeTab === 'workspace' && (
        <div className="flex flex-col gap-6 max-w-xl">
          <Card className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-txt-primary">General Workspace Details</h2>
            <Input
              label="Workspace Name"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <span className="text-2xs text-txt-muted font-mono">Workspace Slug</span>
              <span className="text-xs font-mono text-txt-secondary">{activeWorkspace?.slug}</span>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm">
                Save Workspace Details
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="flex flex-col gap-3 border-red-900/40 bg-red-950/10">
            <h3 className="text-xs font-bold text-red-300">Danger Zone</h3>
            <p className="text-xs text-red-400/90 leading-relaxed">
              Deleting this workspace will permanently soft-delete all ingested documents and vector chunks.
            </p>
            <div className="flex justify-start">
              <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                Delete Workspace
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-6 max-w-xl">
          <Card className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-txt-primary">Personal User Profile</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <Input label="Email Address" value={user?.email || ''} disabled />
            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm">
                Update Profile
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Workspace Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-subtle rounded-lg p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
            <h3 className="text-sm font-bold text-red-300">Confirm Workspace Deletion</h3>
            <p className="text-xs text-txt-secondary leading-relaxed">
              Type <code className="text-txt-primary font-mono">{activeWorkspace?.name}</code> to confirm workspace deletion.
            </p>
            <Input
              placeholder="Type workspace name..."
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={deleteConfirmText !== activeWorkspace?.name}
                onClick={() => {
                  setShowDeleteModal(false);
                  alert('Workspace soft-deleted successfully.');
                }}
              >
                Delete Workspace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
