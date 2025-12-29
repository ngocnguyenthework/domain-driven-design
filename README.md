# Payment Domain-Driven Design

A showcase implementation of **Domain-Driven Design (DDD)** patterns in a NestJS application. This project demonstrates how to structure a backend application using DDD principles, Clean Architecture, and CQRS to build maintainable, scalable enterprise software.

## Overview

This is a payment processing system built with rigorous attention to architectural purity. The codebase serves as a reference implementation for applying DDD concepts in a real-world TypeScript/NestJS context, showing how to separate business logic from infrastructure concerns while maintaining a clean, testable codebase.

## Tech Stack

- **Framework**: NestJS 11 + TypeScript 5.7
- **Database**: PostgreSQL 16 with TypeORM 0.3
- **Architecture**: DDD + Clean Architecture + CQRS
- **API**: REST with Swagger/OpenAPI documentation
- **Containerization**: Docker + Docker Compose

---

## Why Domain-Driven Design?

### The Problem with Traditional Architecture

Most backend applications suffer from common architectural problems:

| Problem                      | Symptom                                                                                 | Root Cause                                       |
| ---------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Business logic scattered** | Same validation rules duplicated across controllers, services, and database constraints | No clear home for business rules                 |
| **Hard to test**             | Unit tests require database, HTTP clients, and complex setup                            | Tight coupling between layers                    |
| **Difficult to maintain**    | Changing a business rule requires touching multiple files                               | Poor separation of concerns                      |
| **Database-driven design**   | Database schema dictates code structure                                                 | Infrastructure concerns leak into business logic |
| **Tight coupling**           | Can't swap ORM without rewriting business logic                                         | Dependencies point outward                       |

### How DDD Solves These Problems

Domain-Driven Design addresses these issues by:

1. **Core Domain Isolation** - Business logic lives independently in the domain layer, free from infrastructure concerns
2. **Ubiquitous Language** - Code structure mirrors business language, making it self-documenting
3. **Bounded Contexts** - Clear boundaries prevent business concepts from bleeding across different parts of the system
4. **Dependency Inversion** - Inner layers never depend on outer layers, making the codebase flexible and testable

---

## Why CQRS?

### What is CQRS?

CQRS (Command Query Responsibility Segregation) is a pattern that separates read and write operations into different models.

### Benefits of CQRS

| Benefit                      | Explanation                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| **Single Responsibility**    | Commands (writes) and Queries (reads) have separate handlers - each does one thing well             |
| **Independent Optimization** | Read models can be optimized for queries, write models for transactions                             |
| **Scalability**              | Read and write operations can be scaled independently                                               |
| **Clear Intent**             | Distinguishing between `CreatePaymentCommand` and `GetPaymentQuery` makes the code self-documenting |
| **Simplified Testing**       | Command handlers and query handlers can be tested in isolation                                      |

---

## Architecture Patterns from Industry Experts

### Clean Architecture

Source: [The Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

![Clean Architecture](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)

**The Dependency Rule**: Source code dependencies must only point inward, toward high-level policies.

### CQRS Pattern

Source: [Martin Fowler - CQRS](https://martinfowler.com/bliki/CQRS.html)

![CQRS Diagram](https://martinfowler.com/bliki/images/cqrs/cqrs.png)

---

## How I Implemented DDD + CQRS

### Project Structure

```
src/
├── core/                          # Infrastructure layer (lowest level)
│   ├── config/                    # Configuration management
│   └── database/                  # Database setup, TypeORM base entities
│
├── common/                        # Cross-cutting concerns
│
└── modules/                       # Bounded contexts
    └── payment/                   # Payment bounded context
        ├── application/           # CQRS: Commands, Queries, Handlers
        │   ├── commands/          # Write operations (intentions)
        │   ├── queries/           # Read operations (queries)
        │   └── handlers/          # Command/query handlers
        │
        ├── domain/                # ◆ Core business logic (PURE)
        │   ├── entities/          # Rich domain models (aggregates)
        │   ├── value-objects/     # Immutable value objects
        │   ├── enums/             # Domain enums
        │   ├── repositories/      # Repository interfaces (contracts)
        │   └── types/             # Domain type definitions
        │
        ├── infrastructure/        # External concerns
        │   └── persistence/       # TypeORM entities, repos, mappers
        │
        └── presentation/          # API layer
            ├── controllers/       # REST endpoints
            ├── dtos/              # Request/Response DTOs
            └── mappers/           # Domain ↔ DTO mappers
```

### Layer Responsibilities

| Layer              | Responsibility                                                      | Dependencies      |
| ------------------ | ------------------------------------------------------------------- | ----------------- |
| **Domain** ◆       | Pure business logic, entities, value objects, repository interfaces | None              |
| **Application**    | Use case orchestration, CQRS handlers                               | Domain only       |
| **Infrastructure** | Database, external services, technical details                      | Domain interfaces |
| **Presentation**   | HTTP, validation, API contracts                                     | Domain types      |

### The Critical Rule

```
┌────────────────────────────────────────────────────────────┐
│                        Presentation                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Application                       │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │                  Domain ◆                     │  │   │
│  │  │         (Pure Business Logic)                 │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘

```

**Domain has ZERO dependencies** on other layers. It's pure TypeScript with no database, framework, or external concerns.

---

## Benefits of This Structure

### 1. Testability

Domain logic can be tested without database, HTTP, or framework:

```typescript
// Pure unit test - no mocks needed
describe('Payment', () => {
  it('should complete when pending', () => {
    const payment = Payment.create({
      amount: Money.create(100, 'USD'),
      customerId: 'customer-123',
      metadata: PaymentMetadata.create({}),
      description: null,
    });

    payment.complete();

    expect(payment.status).toBe(PaymentStatus.COMPLETED);
  });

  it('should fail when already completed', () => {
    const payment = Payment.create(/* ... */);
    payment.complete();

    expect(() => payment.complete()).toThrow();
  });
});
```

### 2. Maintainability

Business rules live in one place:

```
Want to change payment completion rules?
→ Go to: Payment.complete() in domain layer

Want to add validation to Money?
→ Go to: Money.validate() in domain layer

Want to change database schema?
→ Go to: TypeORM entities in infrastructure layer
→ Update mapper
→ Domain layer unchanged!
```

### 3. Flexibility

Swap implementations without touching business logic:

```typescript
// Current: TypeORM + PostgreSQL
@Injectable()
class PaymentRepository extends BaseRepository<Payment, TypeORMEntity> {}

// Future: MongoDB
@Injectable()
class PaymentRepository extends BaseRepository<Payment, MongoEntity> {}

// Domain layer remains identical
```

### 4. Scalability

CQRS enables independent scaling:

```
Write operations (Commands)  → Can be optimized for ACID guarantees
Read operations (Queries)    → Can be optimized for performance, denormalization

Future: Add read replica for queries
Future: Add event sourcing for commands
```

### 5. Business Alignment

Code structure mirrors business language:

```
Business says: "Create a payment with $100 USD"
Code says:      CreatePaymentCommand(amount: 100, currency: 'USD')

Business says: "Complete the payment"
Code says:      payment.complete()

Business says: "Money cannot be negative"
Code says:      Money.validate() throws if amount <= 0
```

### 6. Onboarding

New developers can understand the system quickly:

```
Where's the business logic? → Domain layer
Where's the database code?  → Infrastructure layer
Where's the API code?       → Presentation layer
Where's the use cases?      → Application layer (handlers)
```

---

## DDD Anti-Patterns Avoided

| Anti-Pattern               | How I Avoided It                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| **Anemic Domain Model**    | Rich entities with behavior (`payment.complete()`, not `paymentService.complete(payment)`) |
| **Primitive Obsession**    | Value Objects for domain concepts (`Money`, `PaymentMetadata`)                             |
| **Tight Coupling**         | Dependency Inversion with Symbol tokens (`PAYMENT_REPOSITORY_TOKEN`)                       |
| **Database-Driven Design** | Persistence Ignorance - domain has no database imports                                     |
| **God Objects**            | Aggregates with clear boundaries (`Payment` is root, contains VOs)                         |
| **Leaky Abstractions**     | Mappers prevent infrastructure concerns from leaking into domain                           |

---

## Key DDD Patterns Implemented

| Pattern                       | File Reference                                                 | Description                        |
| ----------------------------- | -------------------------------------------------------------- | ---------------------------------- |
| **Entities**                  | `src/modules/payment/domain/entities/payment.entity.ts`        | Rich aggregates with behavior      |
| **Value Objects**             | `src/modules/payment/domain/value-objects/`                    | Immutable, self-validating objects |
| **Repository Interface**      | `src/modules/payment/domain/repositories/`                     | Contracts in domain layer          |
| **Repository Implementation** | `src/modules/payment/infrastructure/persistence/repositories/` | Concrete implementations           |
| **Commands**                  | `src/modules/payment/application/commands/`                    | Write operations                   |
| **Queries**                   | `src/modules/payment/application/queries/`                     | Read operations                    |
| **Handlers**                  | `src/modules/payment/application/handlers/`                    | CQRS handlers                      |
| **Mappers**                   | `src/modules/payment/**/mappers/`                              | Layer boundary conversions         |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Docker (for PostgreSQL)

### Installation

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker-compose up -d

# Start development server
pnpm start:dev
```

The API will be available at `http://localhost:3001` with Swagger documentation at `http://localhost:3001/api/docs`.

### API Examples

**Create a Payment**

```bash
curl -X POST http://localhost:3001/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "currency": "USD",
    "customerId": "customer-123",
    "description": "Order payment",
    "metadata": { "orderId": "order-456" }
  }'
```

**Get Payment by ID**

```bash
curl http://localhost:3001/api/v1/payments/{id}
```

**List Payments (with pagination)**

```bash
curl "http://localhost:3001/api/v1/payments?page=1&limit=10"
```

---

## Development

```bash
# Build
pnpm run build

# Development (watch mode)
pnpm run start:dev

# Code quality
pnpm run lint
pnpm run format

# Testing
pnpm run test
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e
```

---

## Learning Resources

### Articles & Blogs

- [The Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern by Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [Microsoft - Domain-Driven Design Fundamentals](<https://docs.microsoft.com/en-us/previous-versions/msp-n-p/jj554200(v=pandp.10)>)

---

## License

MIT
