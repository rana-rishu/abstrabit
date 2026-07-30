import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { DocumentUploadZone } from '../../components/documents/DocumentUploadZone';
import { useWorkspace } from '../../store/WorkspaceContext';
import { apiClient } from '../../services/api.service';

export interface DocumentItem {
  id: string;
  filename: string;
  file_hash: string;
  doc_type: string;
  size_bytes: number;
  chunk_count: number;
  status: string;
  created_at: string;
}

export const DocumentsPage: React.FC = () => {
  const { activeWorkspace } = useWorkspace();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!activeWorkspace) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/workspaces/${activeWorkspace.id}/documents`);
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load workspace documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeWorkspace]);

  const handleDelete = async () => {
    if (!deleteDocId || !activeWorkspace) return;
    try {
      await apiClient.delete(`/api/v1/workspaces/${activeWorkspace.id}/documents/${deleteDocId}`);
      setDeleteDocId(null);
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-txt-primary">Document Management</h1>
          <p className="text-xs text-txt-secondary">
            Upload and ingest workspace documents into pgvector vector store
          </p>
        </div>

        <div className="w-64">
          <Input
            placeholder="Search documents by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Upload Zone */}
      <DocumentUploadZone onSuccess={fetchDocuments} />

      {/* Document Table List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-txt-primary">Ingested Workspace Files</h2>
          <span className="text-2xs text-txt-muted font-mono">{filteredDocs.length} Total Documents</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-txt-muted">Loading documents...</div>
        ) : filteredDocs.length === 0 ? (
          <EmptyState
            title="No Documents Uploaded"
            description="Ingest PDFs above to begin asking grounded questions."
          />
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle bg-bg-hover/40 text-txt-secondary font-mono">
                    <th className="p-3">Filename</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Chunks</th>
                    <th className="p-3">SHA-256 Hash</th>
                    <th className="p-3">Uploaded</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-border-subtle last:border-b-0 hover:bg-bg-hover/30 transition-colors">
                      <td className="p-3 font-semibold text-txt-primary">{doc.filename}</td>
                      <td className="p-3">
                        <Badge variant="outline">{doc.doc_type}</Badge>
                      </td>
                      <td className="p-3 text-txt-secondary font-mono">{(doc.size_bytes / 1024).toFixed(1)} KB</td>
                      <td className="p-3 text-txt-secondary font-mono">{doc.chunk_count}</td>
                      <td className="p-3 text-txt-muted font-mono truncate max-w-xs">{doc.file_hash.substring(0, 16)}...</td>
                      <td className="p-3 text-txt-muted font-mono">{new Date(doc.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setDeleteDocId(doc.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDocId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-subtle rounded-lg p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
            <h3 className="text-sm font-bold text-txt-primary">Confirm Delete Document</h3>
            <p className="text-xs text-txt-secondary leading-relaxed">
              This action will soft-delete the document and remove its associated vector chunks from the database.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteDocId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
