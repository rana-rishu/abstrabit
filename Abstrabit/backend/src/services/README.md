# Service Layer

## Responsibility
Services contain all core business logic, RAG retrieval orchestrations, text chunking pipelines, and tool execution registries.

## Boundary Rules
- MUST NOT reference Express `req` or `res` objects directly.
- MUST delegate all SQL execution to the Repository layer.
- MUST log operational metrics using the structured Pino logger with correlation IDs.
