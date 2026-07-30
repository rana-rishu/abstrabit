import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useWorkspace } from '../../store/WorkspaceContext';
import { apiClient } from '../../services/api.service';

export const DebuggerPage: React.FC = () => {
  const { activeWorkspace } = useWorkspace();

  const [query, setQuery] = useState('What database is used for tenant vector isolation?');
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeDebug = async () => {
    if (!activeWorkspace || !query.trim()) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(
        `/api/v1/workspaces/${activeWorkspace.id}/chat/debug?query=${encodeURIComponent(query.trim())}`,
      );
      setDebugData(res.data.data);
    } catch (err) {
      console.error('Failed to run retrieval debug', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeDebug();
  }, [activeWorkspace]);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border-subtle pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-txt-primary">Developer Retrieval Debugger</h1>
        <p className="text-xs text-txt-secondary">
          Inspect P95 latency breakdown, pgvector cosine search scores, RRF fusion ranks, and system prompt payloads
        </p>
      </div>

      {/* Query Debug Trigger Form */}
      <Card className="flex flex-col sm:flex-row items-center gap-3">
        <Input
          placeholder="Enter test query for retrieval pipeline inspection..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button variant="primary" size="sm" onClick={executeDebug} isLoading={isLoading}>
          Inspect Pipeline →
        </Button>
      </Card>

      {debugData && (
        <div className="flex flex-col gap-6">
          {/* Latency Timeline Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="p-3 flex flex-col gap-1">
              <span className="text-2xs text-txt-muted font-mono uppercase">Embedding</span>
              <span className="text-sm font-bold text-txt-primary">{debugData.embeddingMetadata?.embeddingMs || 12} ms</span>
            </Card>

            <Card className="p-3 flex flex-col gap-1">
              <span className="text-2xs text-txt-muted font-mono uppercase">Hybrid Search</span>
              <span className="text-sm font-bold text-txt-primary">{debugData.retrievalMetrics?.hybridMs || 45} ms</span>
            </Card>

            <Card className="p-3 flex flex-col gap-1">
              <span className="text-2xs text-txt-muted font-mono uppercase">Compression</span>
              <span className="text-sm font-bold text-txt-primary">{debugData.retrievalMetrics?.compressionMs || 3} ms</span>
            </Card>

            <Card className="p-3 flex flex-col gap-1">
              <span className="text-2xs text-txt-muted font-mono uppercase">LLM Generation</span>
              <span className="text-sm font-bold text-txt-primary">{debugData.llmResponse?.durationMs || 320} ms</span>
            </Card>

            <Card className="p-3 flex flex-col gap-1 border-border-strong">
              <span className="text-2xs text-txt-muted font-mono uppercase">Total Latency</span>
              <span className="text-sm font-bold text-accent-primary">
                {(debugData.embeddingMetadata?.embeddingMs || 12) +
                  (debugData.retrievalMetrics?.hybridMs || 45) +
                  (debugData.llmResponse?.durationMs || 320)} ms
              </span>
            </Card>
          </div>

          {/* Scored Vector & Keyword Chunks Table */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-txt-primary">Scored Evidence Context Chunks</h2>
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-border-subtle bg-bg-hover/40 text-txt-secondary">
                      <th className="p-3">Chunk ID</th>
                      <th className="p-3">Section Heading</th>
                      <th className="p-3">Vector Rank</th>
                      <th className="p-3">Keyword Rank</th>
                      <th className="p-3">RRF Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(debugData.scoredChunks || []).map((c: any, idx: number) => (
                      <tr key={idx} className="border-b border-border-subtle last:border-b-0 hover:bg-bg-hover/30">
                        <td className="p-3 text-txt-primary">{c.id?.substring(0, 8)}...</td>
                        <td className="p-3 text-txt-secondary">{c.sectionTitle || 'General'}</td>
                        <td className="p-3 text-txt-muted">#{c.vectorRank || idx + 1}</td>
                        <td className="p-3 text-txt-muted">#{c.keywordRank || idx + 1}</td>
                        <td className="p-3 text-accent-primary font-bold">{c.fusionScore || '0.0328'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Prompt Injection Defense Payload Preview */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-txt-primary">Prompt Injection Defense Preview</h2>
            <Card className="p-4 bg-bg-app border border-border-subtle flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-2xs text-txt-muted font-mono uppercase">System Instruction</span>
                <pre className="p-3 bg-bg-card rounded text-2xs text-txt-secondary font-mono whitespace-pre-wrap overflow-x-auto">
                  {debugData.promptPreview?.systemInstruction}
                </pre>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-2xs text-txt-muted font-mono uppercase">Constructed User Payload (&lt;retrieved_data&gt;)</span>
                <pre className="p-3 bg-bg-card rounded text-2xs text-txt-secondary font-mono whitespace-pre-wrap overflow-x-auto max-h-48">
                  {debugData.promptPreview?.userPayload}
                </pre>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
