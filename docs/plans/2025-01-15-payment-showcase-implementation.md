# Payment Processing Showcase - Implementation Plan

**Date:** 2025-01-15
**Based on:** [2025-01-15-payment-showcase-design.md](./2025-01-15-payment-showcase-design.md)

---

## Overview

This implementation plan breaks down the Payment Processing feature into detailed, executable tasks. Each task includes file paths, code examples, and verification steps.

**Total Estimated Tasks:** 24
**Order:** Domain → Infrastructure → Application → Presentation → Documentation → Testing

---

## Prerequisites

### 1. Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/payment-implementation
```

### 2. Install Additional Dependencies

```bash
pnpm add @nestjs/swagger
```

---

## Phase 1: Domain Layer

### Task 1.1: Create Payment Status Enum

**File:** `src/modules/payment/domain/enums/payment-status.enum.ts`

```typescript
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
```

**Verify:** TypeScript compiles without errors

---

### Task 1.2: Create Money Value Object

**File:** `src/modules/payment/domain/value-objects/money.vo.ts`

```typescript
import { DomainValueObject } from '@/modules/shared/domain/base/domain-value-object.base';

export class Money extends DomainValueObject<{ amount: number; currency: string }> {
  private constructor(props: { amount: number; currency: string }) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  // ISO 4217 currency codes validation
  private static readonly VALID_CURRENCIES = new Set([
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR',
  ]);

  protected validate(props: { amount: number; currency: string }): void {
    if (props.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (!Money.VALID_CURRENCIES.has(props.currency)) {
      throw new Error(`Invalid currency code: ${props.currency}`);
    }
  }

  public static create(amount: number, currency: string): Money {
    return new Money({ amount, currency });
  }
}
```

**Verify:**
```typescript
// Should pass
new Money({ amount: 100, currency: 'USD' });

// Should throw
new Money({ amount: -10, currency: 'USD' });
new Money({ amount: 100, currency: 'XXX' });
```

---

### Task 1.3: Create PaymentMetadata Value Object

**File:** `src/modules/payment/domain/value-objects/payment-metadata.vo.ts`

```typescript
import { DomainValueObject } from '@/modules/shared/domain/base/domain-value-object.base';

export class PaymentMetadata extends DomainValueObject<Record<string, unknown>> {
  protected validate(_props: Record<string, unknown>): void {
    // No validation needed - flexible metadata
  }

  public static create(data: Record<string, unknown>): PaymentMetadata {
    return new PaymentMetadata(data);
  }
}
```

---

### Task 1.4: Create Payment Entity (Aggregate Root)

**File:** `src/modules/payment/domain/entities/payment.entity.ts`

```typescript
import { DomainEntity } from '@/modules/shared/domain/base/domain-entity.base';
import { Money } from '../value-objects/money.vo';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMetadata } from '../value-objects/payment-metadata.vo';

export interface PaymentProps {
  id: string;
  amount: Money;
  status: PaymentStatus;
  customerId: string;
  description?: string;
  metadata?: PaymentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export class Payment extends DomainEntity<PaymentProps> {
  get amount(): Money {
    return this.props.amount;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get metadata(): PaymentMetadata | undefined {
    return this.props.metadata;
  }

  // Domain Logic: Complete payment
  public complete(): void {
    if (this.props.status !== PaymentStatus.PENDING) {
      throw new Error('Can only complete pending payments');
    }
    this.props.status = PaymentStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  // Domain Logic: Fail payment
  public fail(): void {
    if (this.props.status !== PaymentStatus.PENDING) {
      throw new Error('Can only fail pending payments');
    }
    this.props.status = PaymentStatus.FAILED;
    this.props.updatedAt = new Date();
  }

  // Factory Method: Create new payment
  public static create(data: {
    amount: Money;
    customerId: string;
    description?: string;
    metadata?: PaymentMetadata;
  }): Payment {
    const now = new Date();
    return new Payment({
      id: crypto.randomUUID(),
      amount: data.amount,
      status: PaymentStatus.PENDING,
      customerId: data.customerId,
      description: data.description,
      metadata: data.metadata,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Factory Method: Reconstitute from persistence
  public static load(data: PaymentProps): Payment {
    return new Payment(data);
  }
}
```

**Verify:**
```typescript
const payment = Payment.create({
  amount: Money.create(100, 'USD'),
  customerId: 'cust_123',
});
console.log(payment.status); // PENDING
payment.complete();
console.log(payment.status); // COMPLETED
```

---

### Task 1.5: Create IPaymentRepository Interface

**File:** `src/modules/payment/domain/repositories/payment-repository.interface.ts`

```typescript
import { Payment } from '../entities/payment.entity';
import { IBaseRepository, ICreateEntity, IPersistedEntity } from '@/modules/shared/domain/types/domain-repository.type';

export type ICreatePayment = ICreateEntity<{
  amount: { value: number; currency: string };
  status: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, unknown>;
}>;

export type IPersistedPayment = IPersistedEntity<{
  amount: { value: number; currency: string };
  status: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, unknown>;
}>;

export interface IPaymentRepository extends IBaseRepository<Payment> {
  save(payment: Payment): Promise<Payment>;
  findOne(id: string): Promise<Payment | null>;
  find(options?: { offset?: number; limit?: number }): Promise<Payment[]>;
  findWithPagination(offset: number, limit: number): Promise<{ data: Payment[]; total: number }>;
  exists(id: string): Promise<boolean>;
  count(): Promise<number>;
}
```

---

## Phase 2: Infrastructure Layer

### Task 2.1: Create PaymentPersistenceEntity

**File:** `src/modules/payment/infrastructure/persistence/entities/payment-persistence.entity.ts`

```typescript
import { BaseUUIDEntity } from '@/core/database/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('payments')
export class PaymentPersistenceEntity extends BaseUUIDEntity {
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('varchar', { length: 3 })
  currency: string;

  @Column('enum', { enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  status: string;

  @Column('varchar')
  customerId: string;

  @Column('varchar', { nullable: true })
  description: string | null;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, unknown> | null;
}
```

---

### Task 2.2: Create Payment Mapper

**File:** `src/modules/payment/infrastructure/persistence/mappers/payment.mapper.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { Payment } from '../../../domain/entities/payment.entity';
import { Money } from '../../../domain/value-objects/money.vo';
import { PaymentMetadata } from '../../../domain/value-objects/payment-metadata.vo';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { PaymentPersistenceEntity } from '../entities/payment-persistence.entity';
import { PersistenceMapper } from '@/modules/shared/infrastructure/persistence/base/persistence-mapper.base';

@Injectable()
export class PaymentMapper extends PersistenceMapper<Payment, PaymentPersistenceEntity> {
  toDomain(entity: PaymentPersistenceEntity): Payment {
    return Payment.load({
      id: entity.id,
      amount: Money.create(Number(entity.amount), entity.currency),
      status: entity.status as PaymentStatus,
      customerId: entity.customerId,
      description: entity.description || undefined,
      metadata: entity.metadata ? PaymentMetadata.create(entity.metadata) : undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Payment): PaymentPersistenceEntity {
    const entity = new PaymentPersistenceEntity();
    entity.id = domain.id;
    entity.amount = domain.amount.amount;
    entity.currency = domain.amount.currency;
    entity.status = domain.status;
    entity.customerId = domain.customerId;
    entity.description = domain.description || null;
    entity.metadata = domain.metadata?.props || null;
    entity.createdAt = domain.props.createdAt;
    entity.updatedAt = domain.props.updatedAt;
    return entity;
  }
}
```

---

### Task 2.3: Create Payment Repository

**File:** `src/modules/payment/infrastructure/persistence/repositories/payment.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentPersistenceEntity } from '../entities/payment-persistence.entity';
import { PaymentMapper } from '../mappers/payment.mapper';
import { Payment } from '../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../domain/repositories/payment-repository.interface';
import { PersistenceRepository } from '@/modules/shared/infrastructure/persistence/base/persistence-repository.base';

@Injectable()
export class PaymentRepository extends PersistenceRepository<Payment, PaymentPersistenceEntity> implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentPersistenceEntity)
    repository: Repository<PaymentPersistenceEntity>,
    mapper: PaymentMapper,
  ) {
    super(repository, mapper);
  }
}
```

---

## Phase 3: Application Layer (CQRS)

### Task 3.1: Create CreatePaymentCommand

**File:** `src/modules/payment/application/commands/create-payment.command.ts`

```typescript
import { ICommand } from '@nestjs/cqrs';

export class CreatePaymentCommand implements ICommand {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
    public readonly customerId: string,
    public readonly description?: string,
    public readonly metadata?: Record<string, unknown>,
  ) {}
}
```

---

### Task 3.2: Create GetPaymentQuery

**File:** `src/modules/payment/application/queries/get-payment.query.ts`

```typescript
import { IQuery } from '@nestjs/cqrs';

export class GetPaymentQuery implements IQuery {
  constructor(public readonly id: string) {}
}
```

---

### Task 3.3: Create ListPaymentsQuery

**File:** `src/modules/payment/application/queries/list-payments.query.ts`

```typescript
import { IQuery } from '@nestjs/cqrs';

export class ListPaymentsQuery implements IQuery {
  constructor(
    public readonly offset: number = 0,
    public readonly limit: number = 10,
  ) {}
}
```

---

### Task 3.4: Create CreatePaymentHandler

**File:** `src/modules/payment/application/handlers/create-payment.handler.ts`

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePaymentCommand } from '../commands/create-payment.command';
import { Payment } from '../../domain/entities/payment.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { PaymentMetadata } from '../../domain/value-objects/payment-metadata.vo';
import { IPaymentRepository } from '../../domain/repositories/payment-repository.interface';
import { Inject } from '@nestjs/common';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler implements ICommandHandler<CreatePaymentCommand> {
  constructor(
    @Inject('PAYMENT_REPOSITORY_TOKEN')
    private readonly repository: IPaymentRepository,
  ) {}

  async execute(command: CreatePaymentCommand): Promise<Payment> {
    const money = Money.create(command.amount, command.currency);
    const metadata = command.metadata ? PaymentMetadata.create(command.metadata) : undefined;

    const payment = Payment.create({
      amount: money,
      customerId: command.customerId,
      description: command.description,
      metadata,
    });

    // Simulate payment processing
    // In real implementation, this would call a payment gateway
    const isSuccess = Math.random() > 0.1; // 90% success rate

    if (isSuccess) {
      payment.complete();
    } else {
      payment.fail();
    }

    return this.repository.save(payment);
  }
}
```

---

### Task 3.5: Create GetPaymentHandler

**File:** `src/modules/payment/application/handlers/get-payment.handler.ts`

```typescript
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPaymentQuery } from '../queries/get-payment.query';
import { IPaymentRepository } from '../../domain/repositories/payment-repository.interface';
import { Inject } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetPaymentQuery)
export class GetPaymentHandler implements IQueryHandler<GetPaymentQuery> {
  constructor(
    @Inject('PAYMENT_REPOSITORY_TOKEN')
    private readonly repository: IPaymentRepository,
  ) {}

  async execute(query: GetPaymentQuery): Promise<Payment | null> {
    const payment = await this.repository.findOne(query.id);
    if (!payment) {
      throw new NotFoundException(`Payment with id ${query.id} not found`);
    }
    return payment;
  }
}
```

---

### Task 3.6: Create ListPaymentsHandler

**File:** `src/modules/payment/application/handlers/list-payments.handler.ts`

```typescript
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListPaymentsQuery } from '../queries/list-payments.query';
import { IPaymentRepository } from '../../domain/repositories/payment-repository.interface';
import { Inject } from '@nestjs/common';

@QueryHandler(ListPaymentsQuery)
export class ListPaymentsHandler implements IQueryHandler<ListPaymentsQuery> {
  constructor(
    @Inject('PAYMENT_REPOSITORY_TOKEN')
    private readonly repository: IPaymentRepository,
  ) {}

  async execute(query: ListPaymentsQuery) {
    return this.repository.findWithPagination(query.offset, query.limit);
  }
}
```

---

## Phase 4: Presentation Layer

### Task 4.1: Create CreatePaymentDto

**File:** `src/modules/payment/presentation/dtos/create-payment.dto.ts`

```typescript
import { IsNumber, IsString, IsISO4217CurrencyCode, IsOptional, IsObject, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsISO4217CurrencyCode()
  currency: string;

  @IsString()
  customerId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
```

---

### Task 4.2: Create PaymentResponseDto

**File:** `src/modules/payment/presentation/dtos/payment-response.dto.ts`

```typescript
export class PaymentResponseDto {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Task 4.3: Create PaymentResponseMapper

**File:** `src/modules/payment/presentation/mappers/payment-response.mapper.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PresentationMapper } from '@/modules/shared/presentation/base/presentation-mapper.base';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentResponseDto } from '../dtos/payment-response.dto';

@Injectable()
export class PaymentResponseMapper extends PresentationMapper<Payment, PaymentResponseDto> {
  toDto(entity: Payment): PaymentResponseDto {
    return {
      id: entity.id,
      amount: entity.amount.amount,
      currency: entity.amount.currency,
      status: entity.status,
      customerId: entity.customerId,
      description: entity.description,
      metadata: entity.metadata?.props,
      createdAt: entity.props.createdAt,
      updatedAt: entity.props.updatedAt,
    };
  }
}
```

---

### Task 4.4: Create PaymentController

**File:** `src/modules/payment/presentation/controllers/payment.controller.ts`

```typescript
import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentResponseDto } from '../dtos/payment-response.dto';
import { PaymentResponseMapper } from '../mappers/payment-response.mapper';
import { CreatePaymentCommand } from '../../application/commands/create-payment.command';
import { GetPaymentQuery } from '../../application/queries/get-payment.query';
import { ListPaymentsQuery } from '../../application/queries/list-payments.query';

@ApiTags('Payments')
@Controller('api/v1/payments')
export class PaymentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly mapper: PaymentResponseMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a payment' })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  async create(@Body() dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const command = new CreatePaymentCommand(
      dto.amount,
      dto.currency,
      dto.customerId,
      dto.description,
      dto.metadata,
    );
    const payment = await this.commandBus.execute(command);
    return this.mapper.toDto(payment);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async findOne(@Param('id') id: string): Promise<PaymentResponseDto> {
    const query = new GetPaymentQuery(id);
    const payment = await this.queryBus.execute(query);
    return this.mapper.toDto(payment);
  }

  @Get()
  @ApiOperation({ summary: 'List payments with pagination' })
  @ApiResponse({ status: 200, type: [PaymentResponseDto] })
  async findAll(
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: PaymentResponseDto[]; total: number }> {
    const query = new ListPaymentsQuery(Number(offset), Number(limit));
    const result = await this.queryBus.execute(query);
    return {
      data: result.data.map(p => this.mapper.toDto(p)),
      total: result.total,
    };
  }
}
```

---

### Task 4.5: Create Payment Module

**File:** `src/modules/payment/payment.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './presentation/controllers/payment.controller';
import { PaymentResponseMapper } from './presentation/mappers/payment-response.mapper';
import { PaymentRepository } from './infrastructure/persistence/repositories/payment.repository';
import { PaymentMapper } from './infrastructure/persistence/mappers/payment.mapper';
import { PaymentPersistenceEntity } from './infrastructure/persistence/entities/payment-persistence.entity';
import { CreatePaymentHandler } from './application/handlers/create-payment.handler';
import { GetPaymentHandler } from './application/handlers/get-payment.handler';
import { ListPaymentsHandler } from './application/handlers/list-payments.handler';

const PAYMENT_REPOSITORY_TOKEN = Symbol('PAYMENT_REPOSITORY_TOKEN');

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([PaymentPersistenceEntity])],
  controllers: [PaymentController],
  providers: [
    PaymentRepository,
    PaymentMapper,
    PaymentResponseMapper,
    CreatePaymentHandler,
    GetPaymentHandler,
    ListPaymentsHandler,
    { provide: PAYMENT_REPOSITORY_TOKEN, useExisting: PaymentRepository },
  ],
  exports: [PAYMENT_REPOSITORY_TOKEN],
})
export class PaymentModule {}
```

---

### Task 4.6: Update App Module

**File:** `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from './modules/payment/payment.module';
import { getTypeOrmConfig } from './core/database/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(getTypeOrmConfig()),
    PaymentModule,
  ],
})
export class AppModule {}
```

---

## Phase 5: Documentation

### Task 5.1: Create ADRs

**Files:** `docs/adr/001-use-ddd.md` through `docs/adr/006-openapi-spec.md`

Use the template from the design document. Create each ADR with:
- Status: Accepted
- Context: Problem statement
- Decision: Solution
- Consequences: Trade-offs
- References: External resources

---

### Task 5.2: Create API Documentation

**File:** `docs/api/README.md`

```markdown
# Payment API Documentation

## Base URL
```
http://localhost:3001/api/v1
```

## Endpoints

### Create Payment
```
POST /payments
```

### Get Payment
```
GET /payments/:id
```

### List Payments
```
GET /payments?offset=0&limit=10
```

## Examples

See Swagger UI at http://localhost:3001/api/docs
```

---

### Task 5.3: Update Main.ts for Swagger

**File:** `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Payment API')
    .setDescription('Payment processing API using DDD patterns')
    .setVersion('1.0')
    .addTag('payments')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
```

---

## Phase 6: Testing

### Task 6.1: Create Domain Unit Tests

**File:** `test/modules/payment/domain/entities/payment.entity.spec.ts`

```typescript
import { Payment } from '@/modules/payment/domain/entities/payment.entity';
import { Money } from '@/modules/payment/domain/value-objects/money.vo';
import { PaymentStatus } from '@/modules/payment/domain/enums/payment-status.enum';

describe('Payment Entity', () => {
  it('should create a pending payment', () => {
    const payment = Payment.create({
      amount: Money.create(100, 'USD'),
      customerId: 'cust_123',
    });

    expect(payment.status).toBe(PaymentStatus.PENDING);
  });

  it('should complete a pending payment', () => {
    const payment = Payment.create({
      amount: Money.create(100, 'USD'),
      customerId: 'cust_123',
    });

    payment.complete();
    expect(payment.status).toBe(PaymentStatus.COMPLETED);
  });

  it('should fail a pending payment', () => {
    const payment = Payment.create({
      amount: Money.create(100, 'USD'),
      customerId: 'cust_123',
    });

    payment.fail();
    expect(payment.status).toBe(PaymentStatus.FAILED);
  });

  it('should not complete an already completed payment', () => {
    const payment = Payment.create({
      amount: Money.create(100, 'USD'),
      customerId: 'cust_123',
    });
    payment.complete();

    expect(() => payment.complete()).toThrow();
  });
});
```

---

### Task 6.2: Create Value Object Tests

**File:** `test/modules/payment/domain/value-objects/money.vo.spec.ts`

```typescript
import { Money } from '@/modules/payment/domain/value-objects/money.vo';

describe('Money Value Object', () => {
  it('should create valid money', () => {
    const money = Money.create(100, 'USD');
    expect(money.amount).toBe(100);
    expect(money.currency).toBe('USD');
  });

  it('should reject negative amount', () => {
    expect(() => Money.create(-10, 'USD')).toThrow('Amount must be greater than zero');
  });

  it('should reject invalid currency', () => {
    expect(() => Money.create(100, 'XXX')).toThrow('Invalid currency code');
  });
});
```

---

### Task 6.3: Create API Integration Tests

**File:** `test/modules/payment/e2e/payments.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app.module';

describe('Payments API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/payments (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        customerId: 'cust_123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBeOneOf(['COMPLETED', 'FAILED']);
  });

  it('/api/v1/payments/:id (GET)', async () => {
    // First create a payment
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/payments')
      .send({
        amount: 50,
        currency: 'EUR',
        customerId: 'cust_456',
      });

    const paymentId = createResponse.body.id;

    // Then get it
    const getResponse = await request(app.getHttpServer())
      .get(`/api/v1/payments/${paymentId}`)
      .expect(200);

    expect(getResponse.body.id).toBe(paymentId);
  });
});
```

---

## Phase 7: Final Polish

### Task 7.1: Update README.md

Update the root README.md with the architecture diagram, quick start, and links to documentation.

---

### Task 7.2: Run All Checks

```bash
pnpm run lint           # Should pass
pnpm run format         # Should pass
pnpm run test           # Should pass
pnpm run build          # Should pass
```

---

### Task 7.3: Commit and Push

```bash
git add .
git commit -m "feat(payment): implement payment processing feature"
git push origin feature/payment-implementation
```

---

### Task 7.4: Create Pull Request

Create a PR with the template from the design document.

---

## Verification Checklist

Before creating the PR, verify:

- [ ] All TypeScript files compile without errors
- [ ] All tests pass (unit + e2e)
- [ ] Linting passes
- [ ] Swagger UI accessible at `/api/docs`
- [ ] Can create payment via POST /api/v1/payments
- [ ] Can get payment via GET /api/v1/payments/:id
- [ ] Can list payments via GET /api/v1/payments
- [ ] All ADRs are created
- [ ] README is updated
- [ ] API documentation exists

---

## Success Metrics

- Domain layer has >80% test coverage
- All commits follow conventional commits format
- Repository has 6 ADRs documenting decisions
- README includes architecture diagram
- Swagger UI fully documents the API
- Code follows existing patterns and style guide
