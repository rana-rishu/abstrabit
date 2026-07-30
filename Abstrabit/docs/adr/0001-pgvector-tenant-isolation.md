# ADR 0001: PostgreSQL + pgvector Tenant Isolation Strategy

## Context
Multi-workspace RAG applications require strict data isolation so that chunks from Workspace A are never retrieved, cited, or exposed to Workspace B queries, even when sharing a single vector store.

## Decision
We chose a **Single Shared Vector Store Table (`doc_chunks`) with `workspace_id` Filter** in PostgreSQL using `pgvector` HNSW indexing.

### SQL Query Specification
```sql
SELECT id, document_id, chunk_index, content, section_title, page_number,
       1 - (embedding <=> $1::vector) AS similarity
FROM doc_chunks
WHERE workspace_id = $2
ORDER BY embedding <=> $1::vector
LIMIT $3;
```

## Consequences
- **Security**: The `WHERE workspace_id = $2` clause is evaluated directly inside PostgreSQL during vector search execution, preventing any cross-tenant vector data leakage.
- **Performance**: HNSW index (`m = 16, ef_construction = 64`) provides fast cosine similarity recall without requiring per-workspace table creation overhead.
- **Operability**: Simplified database migrations and lower connection pool management overhead.
