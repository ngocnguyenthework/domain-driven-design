import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsISO4217CurrencyCode,
  IsOptional,
  IsObject,
  Min,
  IsNotEmpty,
  IsNotEmptyObject,
  IsUppercase,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty()
  @IsString()
  @IsISO4217CurrencyCode()
  @IsUppercase()
  currency: string;

  @ApiProperty()
  @IsString()
  customerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  @IsNotEmptyObject()
  metadata?: Record<string, unknown>;
}
