# ADR 0002: Layered Clean Architecture & Dependency Boundaries

## Context
As backend projects grow, unstructured database queries in controllers and direct coupling between services lead to high maintenance costs, untestable code, and circular dependency bugs.

## Decision
We enforce a strict 4-tier Clean Architecture:
`Controllers -> Validators -> Services -> Repositories -> Database`.

### Boundary Guarantees
- Controllers handle HTTP transport (Request/Response DTO mapping) only.
- Repositories encapsulate 100% of PostgreSQL DDL and DML queries.
- Business logic resides exclusively in Service classes.
- Leaf utility modules (Logger, Config, DTOs, Errors) have zero upstream dependencies.

## Consequences
- Highly testable unit and integration test suite.
- Clean separation of concerns preventing circular imports.
