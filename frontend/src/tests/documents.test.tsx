import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DocumentsPage } from '../pages/dashboard/DocumentsPage';
import { DocumentUploadZone } from '../components/documents/DocumentUploadZone';
import { WorkspaceProvider } from '../store/WorkspaceContext';
import { AuthProvider } from '../store/AuthContext';

describe('DocumentUploadZone Unit Tests', () => {
  it('should render upload zone instructions and supported file formats', () => {
    render(
      <AuthProvider>
        <WorkspaceProvider>
          <DocumentUploadZone onSuccess={() => {}} />
        </WorkspaceProvider>
      </AuthProvider>,
    );

    expect(screen.getByText(/drag & drop document/i)).toBeInTheDocument();
    expect(screen.getByText(/supported formats: pdf, txt, markdown, json/i)).toBeInTheDocument();
  });
});

describe('DocumentsPage Unit Tests', () => {
  it('should render document management header and search filter input', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <DocumentsPage />
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText(/document management/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search documents by filename/i)).toBeInTheDocument();
  });
});
