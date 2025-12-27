import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(10)) limit: number,
  ): Promise<{
    data: PaymentResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const query = new ListPaymentsQuery(Number(page), Number(limit));
    const result = await this.queryBus.execute(query);

    return {
      ...result,
      data: result.data.map((payment) => this.mapper.toDto(payment)),
    };
  }
}
