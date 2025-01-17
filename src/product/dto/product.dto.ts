import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ProductCondition, ProductStatus } from '../product.enum';

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  @Min(0)
  price: number;

  @IsNumber()
  @IsPositive()
  @Min(0)
  @IsOptional()
  compareAtPrice?: number;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  lowStockThreshold: number;

  @IsBoolean()
  trackInventory: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  averageRating: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercentage?: number;

  @IsDate()
  @IsOptional()
  discountExpires?: Date;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  specifications?: string[];

  @IsOptional()
  @IsArray()
  relatedProducts?: string[];

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsEnum(ProductCondition)
  condition: ProductCondition;

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  seoKeywords?: string[];

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  promotionCodes?: string[];

  @IsString()
  @IsOptional()
  safetyWarnings?: string;

  @IsString()
  @IsOptional()
  returnPolicy?: string;

  @IsString()
  @IsNotEmpty()
  createdById: string;
}
