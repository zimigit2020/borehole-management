import { IsString, IsNumber, IsOptional, IsDateString, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SupportedCurrency {
  USD = 'USD',
  ZAR = 'ZAR',
  ZWG = 'ZWG',
}

export class CreateExchangeRateDto {
  @ApiProperty({ enum: SupportedCurrency })
  @IsEnum(SupportedCurrency)
  fromCurrency: SupportedCurrency;

  @ApiProperty({ enum: SupportedCurrency })
  @IsEnum(SupportedCurrency)
  toCurrency: SupportedCurrency;

  @ApiProperty()
  @IsNumber()
  @Min(0.000001)
  rate: number;

  @ApiProperty()
  @IsDateString()
  effectiveDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateExchangeRateDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.000001)
  rate: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConvertCurrencyDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: SupportedCurrency })
  @IsEnum(SupportedCurrency)
  fromCurrency: SupportedCurrency;

  @ApiProperty({ enum: SupportedCurrency })
  @IsEnum(SupportedCurrency)
  toCurrency: SupportedCurrency;
}