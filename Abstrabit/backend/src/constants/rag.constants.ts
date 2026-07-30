export const RAG_CONFIG = {
  EMBEDDING_MODEL: 'text-embedding-004',
  EMBEDDING_DIMENSION: 768,
  CHAT_MODEL: 'gemini-2.5-flash',
  MAX_TOOL_ITERATIONS: 3,
  DEFAULT_TOP_K: 5,
  CHUNK_SIZE: 500,
  CHUNK_OVERLAP: 50,
  REFUSAL_MESSAGE: "I don't know based on the documents in this workspace.",
} as const;

export const TOOL_NAMES = {
  SAVE_TASK: 'save_task',
  SEND_WEBHOOK: 'send_webhook',
  CALCULATE_STATS: 'calculate_workspace_stats',
} as const;
