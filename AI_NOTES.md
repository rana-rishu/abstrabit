# AI Collaboration & Architecture Notes (AI_NOTES.md)

This document details the collaboration between the developer and AI tools (Gemini 3.5 Flash & Antigravity Agent), outlines key architectural decisions, explains the resolution of a major production deployment bug, and suggests future improvements.

---

## 🤖 1. AI Tools & Workflow Division

- **AI Tools & Models Used**: Google Gemini 3.5 Flash (via Google AI Studio) and the Antigravity Agentic Assistant.
- **Division of Work**:
  - **AI Assistant**: Handled initial scaffolding of database models, TypeScript interface definitions, Express route boilerplate, Zod validators, Tailwind CSS dark-mode component styling (`.glass-panel`, `.text-shimmer`), and React Query hook integration.
  - **Developer**: Designed the system architecture, established single-table `pgvector` tenant isolation queries (`WHERE workspace_id = $2`), authored Docker/AWS deployment manifests, configured Vercel edge proxy rewrites, and debugged production environment edge cases.

---

## 📐 2. Key Developer Architectural Decisions

### Decision 1: Single-Table Vector Tenancy (`pgvector`)
- **Choice**: Store all workspace text embeddings in a single PostgreSQL `doc_chunks` table indexed with `HNSW`, filtering queries by `workspace_id`.
- **Rationale**: Creating a separate table or index per workspace adds immense schema overhead and breaks down at scale. Enforcing `WHERE workspace_id = $2` inside the vector similarity query (`c.embedding <=> $1`) guarantees zero-trust tenant isolation while maintaining database efficiency. We backed this with a unique index constraint (`workspace_id`, `file_hash`) to guarantee document ingestion is idempotent.

### Decision 2: Page-Scoped & Structure-Aware Semantic Chunker
- **Choice**: Parse Markdown and text documents into structural sections retaining page numbers, starting/ending character offsets, and section titles.
- **Rationale**: Standard fixed-character chunkers break code blocks, tables, and paragraphs arbitrarily. Storing structural metadata directly with vector chunks enables the UI to render verifiable inline citations (`📄 Architecture.md · Page 1 · Sec 1`) and preview exact source excerpts in a PDF viewer modal.

### Decision 3: Zod-Validated, Scope-Guarded Tool Execution Engine
- **Choice**: Wrap all tool calling implementations (`SaveTaskTool`, `CalculateWorkspaceStatsTool`, `SendWebhookTool`) inside a `BaseTool` pattern that validates arguments against Zod schemas before execution.
- **Rationale**: LLMs can produce malformed JSON or invalid arguments. Intercepting and validating arguments with Zod before running tool code prevents runtime crashes. Restricting tool execution parameters to the active `workspaceId` ensures tools cannot modify data across workspace boundaries.

---

## 🐛 3. Hardest Bug & Wrong Turn

### The Bug: Express `trust proxy` & 500 Errors Behind Vercel Edge Proxy
- **What Went Wrong**: During production deployment, Vercel frontend requests to `/api/v1/auth/login` failed with a `500 Internal Server Error` and `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` validation error from Express rate-limiter, alongside PostgreSQL `relation "users" does not exist` errors.
- **How We Noticed**: We inspected the live AWS EC2 container error logs (`sudo docker logs abstrabit-backend`) which surfaced the exact stack trace:
  ```text
  ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false.
  err: relation "users" does not exist
  ```
- **How We Fixed It**:
  1. Updated `src/app.ts` to set `app.set('trust proxy', 1)`, allowing Express and rate-limiting middlewares to accurately recognize headers forwarded by Vercel edge proxies.
  2. Updated `Dockerfile` to automatically execute database migration scripts (`node dist/db/migrate.js`) on container startup before booting the server, ensuring all SQL tables (`users`, `workspaces`, `documents`, `doc_chunks`, `tasks`, `tool_logs`) are created automatically.

---

## 🚀 4. Future Enhancements & Improvements
With more development time, we would implement:
1. **Server-Sent Events (SSE) Response Streaming**: Stream the assistant's grounded answers token-by-token for faster perceived response latency.
2. **Multi-Step Tool Calling Loop**: Enable the LLM to call a tool, inspect its execution output, and decide whether to invoke a second tool sequentially before formulating a final response.
3. **Opt-in Cross-Workspace Document Sharing**: Build a permissions table allowing specific documents to be explicitly shared across workspace boundaries without breaking default tenancy isolation.
