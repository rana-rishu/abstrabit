import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { useWorkspace } from '../../store/WorkspaceContext';
import { apiClient } from '../../services/api.service';

export interface ToolLogItem {
  id: string;
  tool_name: string;
  input_args: Record<string, unknown>;
  output_result?: Record<string, unknown>;
  status: 'SUCCESS' | 'FAILED' | 'REJECTED';
  execution_ms: number;
  request_id: string;
  created_at: string;
}

export const ToolLogsPage: React.FC = () => {
  const { activeWorkspace } = useWorkspace();

  const [logs, setLogs] = useState<ToolLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ToolLogItem | null>(null);

  const fetchToolLogs = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/workspaces/${activeWorkspace.id}/tool-logs`);
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load tool logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchToolLogs();
  }, [activeWorkspace]);

  const filteredLogs = logs.filter(
    (l) =>
      l.tool_name.toLowerCase().includes(search.toLowerCase()) ||
      l.request_id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-txt-primary">Tool Execution Audit Logs</h1>
          <p className="text-xs text-txt-secondary">
            Audited history of schema-validated workspace tool invocations, inputs, and execution latencies
          </p>
        </div>

        <div className="w-64">
          <Input
            placeholder="Search by tool name or request ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-txt-muted">Loading audit logs...</div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          title="No Tool Invocations Recorded"
          description="Tool calls executed automatically by AI Chat queries will record detailed audit logs here."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-hover/40 text-txt-secondary font-mono">
                  <th className="p-3">Tool Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Execution Time</th>
                  <th className="p-3">Request Correlation ID</th>
                  <th className="p-3">Executed At</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border-subtle last:border-b-0 hover:bg-bg-hover/30 transition-colors">
                    <td className="p-3 font-semibold text-txt-primary font-mono">{log.tool_name}</td>
                    <td className="p-3">
                      <Badge variant={log.status === 'SUCCESS' ? 'success' : 'error'}>
                        {log.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-txt-secondary font-mono">{log.execution_ms} ms</td>
                    <td className="p-3 text-txt-muted font-mono truncate max-w-xs">{log.request_id}</td>
                    <td className="p-3 text-txt-muted font-mono">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-xs text-accent-primary underline hover:text-white"
                      >
                        Inspect Payload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* JSON Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-subtle rounded-lg p-6 max-w-lg w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-txt-primary font-mono">{selectedLog.tool_name} Payload</h3>
              <button onClick={() => setSelectedLog(null)} className="text-xs text-txt-muted hover:text-txt-primary">
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-2xs text-txt-muted font-mono uppercase">Validated Input Arguments</span>
              <pre className="p-3 bg-bg-app rounded text-2xs text-txt-secondary font-mono overflow-x-auto max-h-36">
                {JSON.stringify(selectedLog.input_args, null, 2)}
              </pre>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-2xs text-txt-muted font-mono uppercase">Execution Output Result</span>
              <pre className="p-3 bg-bg-app rounded text-2xs text-txt-secondary font-mono overflow-x-auto max-h-36">
                {JSON.stringify(selectedLog.output_result || {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
