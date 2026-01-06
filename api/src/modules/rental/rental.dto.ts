import { IsNumber, IsNotEmpty, IsDate, IsString, IsOptional } from 'class-validator';

export class CreateRentalDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  bike_id: number;

  //@IsDate()
  @IsNotEmpty()
  start_time: Date;

  //@IsDate()
  @IsNotEmpty()
  end_time: Date;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  qrcode?: string;

  @IsString()
  payment_id?: string;

  @IsString()
  order_id?: string;
}

export class UpdateRentalDto {
  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsNumber()
  @IsOptional()
  bike_id?: number;

  //@IsDate()
  @IsOptional()
  start_time?: Date;

  //@IsDate()
  @IsOptional()
  end_time?: Date;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  qrcode?: string;

  @IsString()
  @IsOptional()
  payment_id?: string;

  @IsString()
  @IsOptional()
  order_id?: string;
}
