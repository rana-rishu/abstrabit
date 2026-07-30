# Abstrabit — Enterprise Multi-Workspace RAG & Tool Calling Platform

> **Design Philosophy**: Cal.com, Linear, and Vercel inspired quiet, minimal, monochrome enterprise SaaS platform for grounded multi-tenant document intelligence.

---

## 🌟 Architecture Overview

Abstrabit is a production-grade enterprise SaaS application built using Node.js, TypeScript, Express, PostgreSQL, pgvector, React, Vite, and TailwindCSS.

### Core Systems:
1. **Tenant-Isolated Vector Search (`pgvector`)**:
   - Stores 768-dimensional vector embeddings in PostgreSQL using `HNSW` indexing.
   - Enforces zero-trust multi-tenancy: every vector search query strictly includes `WHERE workspace_id = $2`.
2. **Hybrid Retrieval & Reciprocal Rank Fusion (RRF)**:
   - Combines vector search cosine similarity ranks with PostgreSQL `tsvector` full-text keyword ranks using the Reciprocal Rank Fusion formula: `score = 1.0 / (60 + vectorRank) + 1.0 / (60 + keywordRank)`.
3. **Prompt Injection Defense System**:
   - Encapsulates retrieved document evidence inside `<retrieved_data>` tags passed via Gemini API `systemInstruction` parameters.
   - Requires exact refusal output if context lacks evidence: `"I don't know based on the documents in this workspace."`.
4. **Schema-Validated Tool Calling Engine**:
   - Centralized `ToolRegistry` executing Zod schema-validated tools (`SaveTaskTool`, `SendWebhookTool`, `CalculateWorkspaceStatsTool`).
   - Records 100% of tool calls in `tool_logs` database table.
5. **Silent JWT Access Token Refresh Queue**:
   - Frontend Axios client queue handling `401 Unauthorized` responses silently via `/api/v1/auth/refresh`.

---

## 🚀 Local Developer Setup

### Prerequisites
- Node.js >= 18.0.0
- Docker & Docker Compose (for PostgreSQL + pgvector container)

### 1. Database Setup
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd Abstrabit/backend
cp .env.example .env
npm install
npm run migrate
npm run dev
```

### 3. Frontend Setup
```bash
cd Abstrabit/frontend
cp .env.example .env
npm install
npm run dev
```

---

## 📖 OpenAPI 3.1 Specification
Backend REST API documentation is available at `Abstrabit/backend/docs/openapi.json`.

---

## 🛡️ OWASP Security Controls
- **Zero-Trust Workspace Guard**: All workspace endpoints enforce `workspaceGuard` authorization middleware.
- **SHA-256 Refresh Token Rotation**: Hashed refresh tokens with automatic reuse revocation.
- **Rate Limiting & File Size Caps**: 300 requests / 15 min rate limiter, Multer 10MB file upload limits.
