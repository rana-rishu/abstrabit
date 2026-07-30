# Abstrabit System & Pipeline Architecture Specifications

## 1. System Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                               REACT FRONTEND                                  |
| (Vite + TailwindCSS Cal.com Design System + Axios Silent 401 Refresh Queue)  |
+-------------------------------------------------------------------------------+
                                      │
                                      │ REST API (HTTPS + JWT Bearer + X-Request-ID)
                                      ▼
+-------------------------------------------------------------------------------+
|                              EXPRESS BACKEND                                  |
| CorrelationId ──> RateLimiter ──> AuthGuard ──> WorkspaceGuard ──> Controllers |
+-------------------------------------------------------------------------------+
       │                              │                              │
       ▼                              ▼                              ▼
 [ IngestionService ]        [ RagOrchestrator ]            [ ToolExecutor ]
       │                              │                              │
       ├─> ExtractorFactory           ├─> QueryProcessor             ├─> SaveTaskTool
       ├─> SemanticChunker            ├─> HybridRetriever            ├─> SendWebhookTool
       └─> GeminiEmbedder             ├─> RrfReranker                └─> CalculateStatsTool
                                      ├─> ContextCompressor
                                      ├─> PromptBuilder
                                      └─> CitationMapper
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
|                       POSTGRESQL + PGVECTOR DATABASE                          |
|  - doc_chunks: embedding vector(768) + HNSW Index                            |
|  - Enforced Tenant Isolation: WHERE workspace_id = $2                         |
+-------------------------------------------------------------------------------+
```

## 2. Ingestion Pipeline
1. **Upload**: Multer memory storage (10MB limit) & extension whitelist validation.
2. **SHA-256 Checksum**: Computes buffer SHA-256 hash; skips extraction if identical document exists in workspace.
3. **Extraction & Normalization**: `ExtractorFactory` parses PDF, Markdown, TXT, or JSON. Performs NFC Unicode normalization.
4. **Structure-Aware Chunker**: `SemanticChunker` preserves Markdown headers, code blocks, and tables (~500 chars, ~100 char overlap).
5. **Vector Embedding**: `EmbeddingProviderFactory` generates 768-dim embeddings with `InMemoryEmbeddingCache` deduplication.
6. **Atomic Transaction**: Inserts document record and chunks inside `runInTransaction`.

## 3. Grounded Retrieval Pipeline
1. **Query Preprocessing**: `QueryProcessor` normalizes query text and extracts keywords.
2. **Hybrid Search**: Parallel vector search (`ChunkRepository.searchVector`) + full-text keyword search (`tsvector` `ts_rank`).
3. **RRF Reranking**: `RrfReranker` calculates `score = 1.0 / (60 + vectorRank) + 1.0 / (60 + keywordRank)`.
4. **Context Compression**: Deduplicates checksums and enforces 3,500 token limit.
5. **Prompt Injection Defense**: Encapsulates evidence in `<retrieved_data>` tags passed via Gemini API `systemInstruction` parameters.
6. **LLM Completion**: `GeminiClient` generates grounded answer with honest refusal fallback.
7. **Citation Mapping**: `CitationMapper` maps chunks to verifiable inline citation references.
