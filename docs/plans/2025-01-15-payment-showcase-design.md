# Payment Processing Showcase - Design Document

**Date:** 2025-01-15
**Author:** Portfolio Project
**Status:** Design

---

## Overview

This document outlines the design for a Payment Processing feature implemented using Domain-Driven Design (DDD) patterns. The purpose is to demonstrate clean architecture, CQRS, and professional backend engineering practices.

**Goal:** Create a minimal but impressive showcase that highlights DDD skills for recruiter review via GitHub.

---

## Scope

**Minimal Viable Showcase** - One complete feature with full documentation:
- Create payment charge
- Get payment by ID
- List payments with pagination

**Out of Scope:** Capture, refund, webhooks, idempotency (can be added later)

---

## API Design

### REST Endpoints

```
POST   /api/v1/payments       # Create payment (charge)
GET    /api/v1/payments/:id   # Get payment by ID
GET    /api/v1/payments       # List payments with pagination
```

### API Contract Examples

**POST /api/v1/payments**

```typescript
// Request
{
  "amount": 100.50,
  "currency": "USD",
  "customerId": "cust_123",
  "description": "Order #1234"
}

// Response 201 Created
{
  "id": "pay_uuid",
  "status": "COMPLETED",
  "amount": 100.50,
  "currency": "USD",
  "customerId": "cust_123",
  "description": "Order #1234",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

### API Design Principles

1. **Proper status codes** - 201, 200, 400, 404
2. **Request validation** - Using `class-validator`
3. **OpenAPI specification** - Auto-generated Swagger docs
4. **URI versioning** - `/api/v1/` for future compatibility

### Payment Status Flow

`PENDING` → `COMPLETED` or `FAILED`

---

## Domain Model

### Payment Aggregate Root

```typescript
class Payment extends DomainEntity {
  id: string;                    // UUID
  amount: Money;                 // Value Object
  status: PaymentStatus;         // PENDING | COMPLETED | FAILED
  customerId: string;
  description?: string;
  metadata?: PaymentMetadata;    // Value Object
  createdAt: Date;
  updatedAt: Date;
}
```

### Value Objects

**Money**
- Encapsulates amount + currency
- Validation: amount > 0, valid ISO 4217 currency
- Immutable

**PaymentMetadata**
- Optional key-value data for extensibility
- Immutable

### Domain Events (for future extensibility)

- `PaymentCreated`
- `PaymentCompleted`
- `PaymentFailed`

---

## File Structure

```
src/modules/payment/
├── domain/
│   ├── entities/
│   │   └── payment.entity.ts
│   ├── value-objects/
│   │   ├── money.vo.ts
│   │   └── payment-metadata.vo.ts
│   ├── enums/
│   │   └── payment-status.enum.ts
│   └── repositories/
│       └── payment-repository.interface.ts
├── infrastructure/
│   └── persistence/
│       ├── entities/
│       │   └── payment-persistence.entity.ts
│       ├── mappers/
│       │   └── payment.mapper.ts
│       └── repositories/
│           └── payment.repository.ts
├── application/
│   ├── commands/
│   │   └── create-payment.command.ts
│   ├── queries/
│   │   ├── get-payment.query.ts
│   │   └── list-payments.query.ts
│   └── handlers/
│       ├── create-payment.handler.ts
│       ├── get-payment.handler.ts
│       └── list-payments.handler.ts
├── presentation/
│   ├── controllers/
│   │   └── payment.controller.ts
│   ├── dtos/
│   │   ├── create-payment.dto.ts
│   │   └── payment-response.dto.ts
│   └── mappers/
│       └── payment-response.mapper.ts
└── payment.module.ts
```

### Base Classes (from `modules/shared/`)

- `DomainEntity` → `modules/shared/domain/base/domain-entity.base.ts`
- `DomainValueObject` → `modules/shared/domain/base/domain-value-object.base.ts`
- `PersistenceRepository` → `modules/shared/infrastructure/persistence/base/persistence-repository.base.ts`
- `PersistenceMapper` → `modules/shared/infrastructure/persistence/base/persistence-mapper.base.ts`
- `PresentationMapper` → `modules/shared/presentation/base/presentation-mapper.base.ts`

---

## Architecture Layers

### 1. Domain Layer
- **Pure business logic** - No external dependencies
- **Entities:** Payment aggregate root
- **Value Objects:** Money, PaymentMetadata
- **Interfaces:** IPaymentRepository
- **Enforces invariants:** Amount must be positive, status transitions are valid

### 2. Application Layer (CQRS)
- **Commands:** CreatePaymentCommand
- **Queries:** GetPaymentQuery, ListPaymentsQuery
- **Handlers:** Orchestrate domain logic without business rules
- **Uses NestJS CQRS module** for command/query bus dispatch

### 3. Infrastructure Layer
- **PersistenceEntity:** TypeORM entity with UUID primary key
- **Repository:** PostgreSQL implementation extending PersistenceRepository
- **Mapper:** Bidirectional domain ↔ persistence transformation

### 4. Presentation Layer
- **Controller:** REST endpoints with OpenAPI decorators
- **DTOs:** Request validation with class-validator
- **ResponseMapper:** Domain → DTO transformation

---

## Architecture Decision Records (ADRs)

| ADR | Decision |
|-----|----------|
| `001-use-ddd.md` | Adopt Domain-Driven Design |
| `002-cqrs-pattern.md` | Separate Commands from Queries |
| `003-value-objects.md` | Use Value Objects for Money |
| `004-repository-pattern.md` | Abstract persistence with interfaces |
| `005-restful-versioning.md` | URI versioning (`/api/v1/`) |
| `006-openapi-spec.md` | Auto-generate docs with Swagger |

Each ADR includes:
- Status
- Context (problem)
- Decision (solution)
- Consequences (trade-offs)
- References

---

## Documentation Deliverables

### Repository Structure

```
docs/
├── adr/                           # Architecture Decision Records
│   ├── 001-use-ddd.md
│   ├── 002-cqrs-pattern.md
│   ├── 003-value-objects.md
│   ├── 004-repository-pattern.md
│   ├── 005-restful-versioning.md
│   └── 006-openapi-spec.md
├── api/
│   └── README.md                  # API documentation with curl examples
└── plans/
    └── 2025-01-15-payment-showcase-design.md    # This document
```

### README.md Sections

1. **Why This Project** - Demonstrates DDD, CQRS, Clean Architecture
2. **Architecture Diagram** - Mermaid diagram showing layers
3. **Quick Start** - Get running in < 5 minutes
4. **Documentation Links** - ADRs, API docs
5. **Tech Stack** - NestJS, PostgreSQL, TypeORM
6. **Testing** - Commands and coverage report

---

## Git Workflow

### Feature Branch

```bash
git checkout -b feature/payment-implementation
```

### Commits (Conventional Commits)

Scope = module name (`payment`)

```bash
git commit -m "feat(payment): add Payment aggregate root with Money value object"
git commit -m "feat(payment): define IPaymentRepository interface"
git commit -m "feat(payment): implement Payment persistence layer"
git commit -m "feat(payment): implement CQRS handlers for payments"
git commit -m "feat(payment): add REST API for payments"
git commit -m "docs(payment): add ADRs and API documentation"
git commit -m "test(payment): add unit and integration tests"
git commit -m "chore(payment): finalize payment feature implementation"
```

### Pull Request Template

```markdown
## Description
Implements the Payment Processing feature using DDD patterns.

## Changes
- ✅ Domain layer with Payment aggregate and Money value object
- ✅ Infrastructure layer with PostgreSQL persistence
- ✅ Application layer with CQRS handlers
- ✅ Presentation layer with REST API
- ✅ 6 Architecture Decision Records
- ✅ Unit and integration tests
- ✅ OpenAPI documentation

## Testing
```bash
pnpm run test           # Unit tests: ✅ passing
pnpm run test:e2e       # Integration tests: ✅ passing
pnpm run test:cov       # Coverage: 82%
```
```

---

## Testing Strategy

### Unit Tests
- **Domain layer:** Payment entity business logic, Money validation
- **Value Objects:** Money arithmetic, currency validation
- **Target:** > 80% coverage for domain layer

### Integration Tests
- **API endpoints:** POST/GET payments with database
- **Repository:** CRUD operations
- **CQRS handlers:** Command/query execution

### Commands

```bash
pnpm run test           # Unit tests
pnpm run test:e2e       # Integration tests
pnpm run test:cov       # Coverage report
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 11, TypeScript 5.7 |
| Database | PostgreSQL 16, TypeORM 0.3 |
| Patterns | DDD, CQRS, Repository, Mapper |
| Validation | class-validator, class-transformer |
| Documentation | OpenAPI 3.1, Swagger UI |
| Testing | Jest 30 |

---

## Success Criteria

✅ Domain logic is testable in isolation
✅ Clear separation of concerns across layers
✅ Repository interface enables easy database swapping
✅ API follows RESTful best practices
✅ ADRs document architectural decisions
✅ README impresses recruiters in 30 seconds
✅ Commit history tells a clear story
✅ Tests demonstrate quality mindset
