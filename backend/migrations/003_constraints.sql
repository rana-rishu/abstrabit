-- Migration 003: Foreign Key Constraints & Data Integrity

-- Refresh Tokens -> Users FK
ALTER TABLE refresh_tokens 
DROP CONSTRAINT IF EXISTS fk_refresh_tokens_users,
ADD CONSTRAINT fk_refresh_tokens_users 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Workspaces -> Users FK
ALTER TABLE workspaces 
DROP CONSTRAINT IF EXISTS fk_workspaces_users,
ADD CONSTRAINT fk_workspaces_users 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Workspace Members -> Workspaces & Users FK
ALTER TABLE workspace_members 
DROP CONSTRAINT IF EXISTS fk_wm_workspaces,
ADD CONSTRAINT fk_wm_workspaces 
FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

ALTER TABLE workspace_members 
DROP CONSTRAINT IF EXISTS fk_wm_users,
ADD CONSTRAINT fk_wm_users 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Documents -> Workspaces FK
ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS fk_documents_workspaces,
ADD CONSTRAINT fk_documents_workspaces 
FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Document Chunks -> Workspaces & Documents FK
ALTER TABLE doc_chunks 
DROP CONSTRAINT IF EXISTS fk_chunks_workspaces,
ADD CONSTRAINT fk_chunks_workspaces 
FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

ALTER TABLE doc_chunks 
DROP CONSTRAINT IF EXISTS fk_chunks_documents,
ADD CONSTRAINT fk_chunks_documents 
FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;

-- Tasks -> Workspaces FK
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS fk_tasks_workspaces,
ADD CONSTRAINT fk_tasks_workspaces 
FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Tool Logs -> Workspaces FK
ALTER TABLE tool_logs 
DROP CONSTRAINT IF EXISTS fk_tool_logs_workspaces,
ADD CONSTRAINT fk_tool_logs_workspaces 
FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- Chat Messages -> Workspaces & Users FK
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS fk_chat_workspaces,
ADD CONSTRAINT fk_chat_workspaces 
FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS fk_chat_users,
ADD CONSTRAINT fk_chat_users 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
