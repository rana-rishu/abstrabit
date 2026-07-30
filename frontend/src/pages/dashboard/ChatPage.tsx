import React, { useState, useEffect, useRef } from 'react';
import { ChatMessageItem } from '../../components/chat/ChatMessageItem';
import { ChatComposer } from '../../components/chat/ChatComposer';
import { CitationItem, ChatMessage } from '../../types/chat.types';
import { PdfViewerModal } from '../../components/documents/PdfViewerModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useWorkspace } from '../../store/WorkspaceContext';
import { apiClient } from '../../services/api.service';

export const ChatPage: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfModalProps, setPdfModalProps] = useState<{
    documentId?: string;
    filename?: string;
    pageNumber: number;
    charStart?: number;
    charEnd?: number;
    highlightText?: string;
  }>({ pageNumber: 1 });

  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!activeWorkspace) {
        setMessages([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/api/v1/workspaces/${activeWorkspace.id}/chat/history?limit=100`);
        setMessages(res.data.data || []);
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadChatHistory();
  }, [activeWorkspace]);

  const handleSendMessage = async (queryText: string, includeDebug: boolean) => {
    if (!activeWorkspace) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await apiClient.post(`/api/v1/workspaces/${activeWorkspace.id}/chat`, {
        message: queryText,
        includeDebug,
      });

      const data = res.data.data;
      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        executedTools: data.executedTools || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const apiErrMessage = err.response?.data?.error?.message || "I don't know based on the documents in this workspace.";
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${apiErrMessage}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationClick = (citation: CitationItem) => {
    setPdfModalProps({
      documentId: citation.document_id,
      filename: citation.filename,
      pageNumber: citation.page_number || 1,
      charStart: citation.char_start,
      charEnd: citation.char_end,
      highlightText: citation.content,
    });
    setIsPdfModalOpen(true);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg-app text-txt-primary">
      {/* Main Chat Stream Container */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-4xl w-full mx-auto">
          {messages.length === 0 ? (
            <div className="my-auto">
              <EmptyState
                title="Workspace AI Document Assistant"
                description="Ask questions grounded in your ingested workspace documents. Every answer includes verifiable inline citations and zero hallucination refusals."
              />
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} onCitationClick={handleCitationClick} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sticky Composer Area */}
        <div className="p-4 border-t border-border-subtle bg-bg-sidebar/80 backdrop-blur-xs max-w-4xl w-full mx-auto">
          <ChatComposer onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>

      {/* Interactive PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        documentId={pdfModalProps.documentId}
        filename={pdfModalProps.filename}
        pageNumber={pdfModalProps.pageNumber}
        charStart={pdfModalProps.charStart}
        charEnd={pdfModalProps.charEnd}
        highlightText={pdfModalProps.highlightText}
      />
    </div>
  );
};
