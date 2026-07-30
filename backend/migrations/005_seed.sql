-- Migration 005: Repeatable Development Seed Data

-- Insert Demo User (Password: "Password123!")
-- Hash generated via bcrypt (12 rounds)
INSERT INTO users (id, email, password_hash, first_name, last_name)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@abstrabit.com',
    '$2a$12$ckfXSZIMRWCuvnFCEuFCJugkMtYxL0Red.jLdAZeEfKTDZRvoSzf2',
    'Demo',
    'User'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Demo Workspace
INSERT INTO workspaces (id, user_id, name, description)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Demo Enterprise Workspace',
    'Pre-loaded workspace for testing tenant isolation and RAG tool calling.'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Demo Task created via Tool Call
INSERT INTO tasks (id, workspace_id, title, description, priority, status)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'Review Q3 Architecture Plan',
    'Actionable item created automatically via AI tool call (save_task).',
    'HIGH',
    'PENDING'
)
ON CONFLICT (id) DO NOTHING;
