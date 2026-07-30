import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { useWorkspace } from '../../store/WorkspaceContext';
import { apiClient } from '../../services/api.service';
import { ApiResponseSuccess } from '../../types/api.types';

export interface DocumentUploadZoneProps {
  onSuccess: () => void;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({ onSuccess }) => {
  const { activeWorkspace } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const allowedExts = ['pdf'];

  const validateFile = (selectedFile: File): boolean => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExts.includes(ext)) {
      setError(`Unsupported file type '.${ext}'. Supported formats: PDF.`);
      return false;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds maximum limit of 10 MB.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (validateFile(dropped)) {
        setFile(dropped);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (validateFile(selected)) {
        setFile(selected);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!activeWorkspace) {
      setError('No active workspace selected. Please select or create a workspace first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setError(null);
    setNotice(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      setUploadProgress(60);
      const res = await apiClient.post<ApiResponseSuccess<{ isDuplicate: boolean; document: any }>>(
        `/api/v1/workspaces/${activeWorkspace.id}/documents/upload`,
        formData,
      );

      setUploadProgress(100);
      if (res.data.data?.isDuplicate) {
        setNotice('Identical document SHA-256 already exists in workspace (Idempotency match).');
      }

      setFile(null);
      onSuccess();
    } catch (err: any) {
      console.error('Upload Error:', err);
      const msg = err.response?.data?.error?.message || err.message || 'Failed to upload document.';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
          {error}
        </div>
      )}

      {notice && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded text-xs text-amber-300">
          {notice}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center ${
          isDragging
            ? 'border-accent-primary bg-bg-hover'
            : 'border-border-subtle bg-bg-card/40 hover:border-border-strong'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="w-10 h-10 rounded-full bg-bg-hover flex items-center justify-center mb-3 text-txt-secondary text-sm">
          ↑
        </div>

        {file ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-txt-primary">{file.name}</span>
            <span className="text-2xs text-txt-muted">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-txt-primary">
              Drag & Drop document or <span className="underline">browse</span>
            </span>
            <span className="text-2xs text-txt-muted">Supported formats: PDF (Max 10MB)</span>
          </div>
        )}
      </div>

      {file && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 bg-bg-hover h-2 rounded overflow-hidden">
            <div
              className="bg-accent-primary h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleUpload();
            }}
            isLoading={isUploading}
          >
            Upload & Ingest →
          </Button>
        </div>
      )}
    </div>
  );
};
