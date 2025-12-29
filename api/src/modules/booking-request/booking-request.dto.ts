import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateBookingRequestDto {
  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['phone', 'whatsapp', 'telegram'])
  contact_method: string;

  @IsString()
  @IsNotEmpty()
  contact_details: string;

  @IsString()
  @IsNotEmpty()
  pickup_location: string;
}

export class UpdateBookingRequestDto {
  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'])
  status?: string;

  @IsString()
  @IsOptional()
  admin_notes?: string;
}
