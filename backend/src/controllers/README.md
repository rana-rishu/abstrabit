# Controller Layer

## Responsibility
Controllers handle incoming Express HTTP requests, unpack validated DTOs, delegate operations to the Service layer, and format standard API JSON responses.

## Boundary Rules
- MUST NOT access database pool or write SQL queries directly.
- MUST NOT contain core business logic or RAG algorithms.
- MUST wrap responses using standardized `ApiResponse.success()` and `ApiResponse.error()` DTO mappers.
