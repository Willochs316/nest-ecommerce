import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { Role } from '../roles/role.enum';

export class AuthPayloadDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  password: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  @Length(5, 100)
  address?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  city?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  state?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  @Length(4, 10)
  postalCode?: string;

  @IsEnum(Role)
  role?: Role;
}
