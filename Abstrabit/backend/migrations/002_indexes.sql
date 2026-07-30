-- Migration 002: Performance & Search Indexes

-- User Email Search Index
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_active 
ON users(email) 
WHERE deleted_at IS NULL;

-- Refresh Token Hash Index
CREATE UNIQUE INDEX IF NOT EXISTS uq_refresh_tokens_hash 
ON refresh_tokens(token_hash);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id 
ON refresh_tokens(user_id) 
WHERE revoked_at IS NULL;

-- Workspaces User Ownership Index
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id 
ON workspaces(user_id) 
WHERE deleted_at IS NULL;

-- Workspace Members Join Index
CREATE UNIQUE INDEX IF NOT EXISTS uq_workspace_members_user 
ON workspace_members(workspace_id, user_id);

-- Documents Workspace Lookup & Idempotent File Hash Index
CREATE INDEX IF NOT EXISTS idx_documents_workspace_id 
ON documents(workspace_id) 
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_documents_workspace_file_hash 
ON documents(workspace_id, file_hash) 
WHERE deleted_at IS NULL;

-- Document Chunks Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_doc_chunks_workspace_id 
ON doc_chunks(workspace_id);

CREATE INDEX IF NOT EXISTS idx_doc_chunks_document_id 
ON doc_chunks(document_id);

-- Tasks Workspace & Status Filter Index
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id 
ON tasks(workspace_id) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_status 
ON tasks(workspace_id, status) 
WHERE deleted_at IS NULL;

-- Tool Logs Lookup Index
CREATE INDEX IF NOT EXISTS idx_tool_logs_workspace_id 
ON tool_logs(workspace_id, created_at DESC);

-- Chat Messages History Index
CREATE INDEX IF NOT EXISTS idx_chat_messages_workspace_id 
ON chat_messages(workspace_id, created_at ASC);
