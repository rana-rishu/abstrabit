import React from 'react';
import { Badge } from '../ui/Badge';
import { CitationItem, ChatMessage } from '../../types/chat.types';

export interface ChatMessageItemProps {
  message: ChatMessage;
  onCitationClick: (citation: CitationItem) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onCitationClick }) => {
  const isUser = message.role === 'user';
  const isRefusal = message.content.includes("I don't know based on the documents in this workspace");

  return (
    <div className={`flex flex-col gap-2 w-full ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 text-2xs text-txt-muted font-mono">
        <span>{isUser ? 'You' : 'Grounded Assistant'}</span>
      </div>

      <div
        className={`max-w-2xl rounded-lg p-4 text-xs leading-relaxed ${
          isUser
            ? 'bg-bg-hover text-txt-primary border border-border-strong'
            : 'bg-bg-card text-txt-primary border border-border-subtle'
        }`}
      >
        {isRefusal ? (
          <div className="flex flex-col gap-3 p-3 bg-amber-950/20 border border-amber-800/40 rounded">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <span className="text-sm">⚠️</span>
              <span>Refusal: Insufficient Grounded Evidence</span>
            </div>
            <p className="text-amber-200/90 leading-normal">
              The workspace documents do not contain sufficient evidence to answer this question accurately.
            </p>
            <div className="flex items-center gap-2 text-2xs text-amber-400">
              <span>Recommendation: Upload relevant PDF files in Document Management.</span>
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap font-sans">{message.content}</div>
        )}

        {/* Executed Tools Badge List */}
        {message.executedTools && message.executedTools.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
            <span className="text-2xs text-txt-muted font-mono">System Tool Executed:</span>
            {message.executedTools.map((t, idx) => (
              <Badge key={idx} variant={t.success ? 'success' : 'error'}>
                {t.toolName}
              </Badge>
            ))}
          </div>
        )}

        {/* Inline Citation Chips */}
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border-subtle">
            <span className="text-2xs text-txt-muted font-mono">Sources:</span>
            {message.citations.map((cite, idx) => (
              <button
                key={idx}
                onClick={() => onCitationClick(cite)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-hover border border-border-subtle hover:border-accent-primary/50 text-2xs font-mono text-txt-secondary hover:text-txt-primary transition-colors shadow-sm"
              >
                <span className="text-accent-primary font-bold">📄 {cite.filename}</span>
                <span className="text-txt-muted">· Page {cite.page_number || 1}</span>
                {cite.section_id && <span className="text-accent-primary/80">· Sec {cite.section_id}</span>}
                <span className="px-1 bg-accent-primary/10 text-accent-primary rounded">#{cite.retrieval_rank || idx + 1}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
