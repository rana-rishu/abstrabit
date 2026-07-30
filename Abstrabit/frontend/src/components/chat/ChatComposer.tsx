import React, { useState } from 'react';
import { Button } from '../ui/Button';

export interface ChatComposerProps {
  onSend: (message: string, includeDebug: boolean) => void;
  isLoading: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [includeDebug, setIncludeDebug] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;

    onSend(text.trim(), includeDebug);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isTaskCommand = /^@task\b/i.test(text);

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-2 w-full border rounded-lg p-3 shadow-md transition-all duration-300 ${
        isTaskCommand
          ? 'border-border-strong bg-bg-hover/30'
          : 'border-border-subtle bg-bg-card'
      }`}
    >
      {isTaskCommand && (
        <div className="flex items-center gap-1.5 self-start px-2 py-0.5 border border-border-subtle bg-bg-input text-txt-secondary text-[9px] font-mono uppercase tracking-widest rounded-sm select-none">
          Task Mode
        </div>
      )}
      <textarea
        rows={2}
        placeholder="Type @task to create a task (e.g. @task Audit vector search)..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-xs text-txt-primary placeholder:text-txt-muted resize-none focus:outline-none"
      />

      <div className="flex items-center justify-between border-t border-border-subtle pt-2">
        <label className="flex items-center gap-1.5 cursor-pointer text-2xs text-txt-muted hover:text-txt-secondary">
          <input
            type="checkbox"
            checked={includeDebug}
            onChange={(e) => setIncludeDebug(e.target.checked)}
            className="rounded bg-bg-input border-border-subtle text-accent-primary focus:ring-0 cursor-pointer"
          />
          <span>Include Developer Retrieval Debug Payload</span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-2xs text-txt-muted font-mono hidden sm:inline">Enter ↵ to send</span>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading} disabled={!text.trim()}>
            Send Query →
          </Button>
        </div>
      </div>
    </form>
  );
};
