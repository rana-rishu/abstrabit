# Repository Layer

## Responsibility
Repositories encapsulate 100% of PostgreSQL queries, transactions, soft delete filters (`WHERE deleted_at IS NULL`), and vector similarity searches (`pgvector`).

## Boundary Rules
- MUST NOT use `SELECT *`. All queries MUST specify explicit column lists.
- MUST enforce `WHERE workspace_id = $2` on all vector chunk operations.
- MUST accept database client/transaction handles for atomic operations.
