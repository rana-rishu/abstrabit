# AI Collaboration & Architecture Notes (AI_NOTES.md)

This document outlines the division of work between the developer and AI systems, details critical architectural decisions, recounts the resolution of a major session-restoration bug, and suggests future improvements.

---

## 🤖 AI Tools & Workspace Collaboration
- **AI Tooling**: Gemini 3.5 Flash was utilized throughout the implementation and revision stages.
- **Task Division**:
  - **AI**: Handled the scaffolding of structural models (schemas, interfaces), database queries, components matching specific layouts (Tailwind CSS styling), and boilerplate setup (Express routing, Axios request interceptors).
  - **Developer**: Governed structural logic, verified zero-trust workspace security guards, tested token refresh operations manually, reviewed code quality against OWASP guidelines, and managed Docker configurations.

---

## 📐 Key Architectural Decisions

### 1. Unified Vector Store with Tenancy Partitioning
We chose to hold all text embeddings inside a single `doc_chunks` table with a `workspace_id` column.
- **Rationale**: Creating a separate table or index per workspace adds significant database overhead and violates standard enterprise SaaS practices. Partitioning at the query level (`WHERE workspace_id = $2`) ensures strict isolation while maintaining database efficiency. We also backed this with a unique index constraint (`workspace_id`, `file_hash`) to ensure document uploads remain idempotent.

### 2. Page-Scoped, Structure-Aware Semantic Chunker
Instead of standard character-based chunking that breaks sections randomly, we built a custom markdown and text chunker.
- **Rationale**: Keeping code blocks and tables atomic (non-splittable) prevents context fragmentation. Retaining metadata such as starting/ending offsets, exact page numbers, and section headers directly inside the database allows clean citation rendering in the UI.

### 3. Zod-Validated, State-Restricted Tool Executor
We created a base tool class (`BaseTool`) wrapping schemas and executors.
- **Rationale**: Intercepting and validating all arguments with Zod schemas before running tool code protects the system from malformed LLM outputs. Restricting the executor to the active `workspaceId` ensures tools cannot modify data in other workspaces.

---

## 🐛 Resolution of the Session Restore Bug

### The Problem
During development, users would be redirected back to the login screen immediately upon refreshing the page, despite having active tokens stored in `localStorage`. 

### The Investigation
We checked the client routing and saw `GuestRoute` and `ProtectedRoute` checking the global context `isLoading` state. We traced the session recovery network call `GET /api/v1/auth/me` on the server and verified that:
1. The server successfully validated the access token header.
2. The server retrieved the user model and returned it wrapped in `ApiResponse.success(user)`.
3. The response JSON had the structure `{ success: true, data: { id, email, first_name, ... } }`.

On the frontend, however, `AuthContext.tsx` was doing:
```typescript
const res = await apiClient.get('/api/v1/auth/me');
setUser(res.data.data.user);
```
Since the backend returned the user object directly inside the success data block (`res.data.data`), `res.data.data.user` resolved to `undefined`. This set the global user state to `undefined` and triggered a redirect back to `/login`.

### The Fix
We updated the frontend context to set the user state using `res.data.data` directly:
```typescript
const res = await apiClient.get('/api/v1/auth/me');
setUser(res.data.data);
```
This restored session persistence upon page refresh.

---

## 🚀 Future Enhancements
With more time, we would implement:
1. **Response Streaming**: Incorporate Server-Sent Events (SSE) to stream the assistant's tokens in real-time.
2. **Recursive Multi-Step Tool Calling**: Allow the model to call tools, view output, and invoke additional tools sequentially.
3. **Cross-Workspace Document Bridge**: Build an opt-in document sharing table allowing specific files to be accessed across workspace boundaries.
