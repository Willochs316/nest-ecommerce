import {
    BadRequestException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Product } from './entities/product.entity';
  import { Category } from './entities/category.entity';
  import { ProductDto } from './dto/product.dto';
  import { User } from 'src/auth/entities/user.entity';
  
  @Injectable()
  export class ProductService {
    constructor(
      @InjectRepository(Product)
      private productRepository: Repository<Product>,
      @InjectRepository(Category)
      private categoryRepository: Repository<Category>,
    ) {}
  
    async createProduct(createProductDto: ProductDto): Promise<Product> {
      const category = await this.categoryRepository.findOne({
        where: { id: createProductDto.categoryId },
      });
  
      if (!category) {
        throw new NotFoundException(`Category not found`);
      }
  
      // Handle related products if provided
      let relatedProducts: Product[] = [];
      if (createProductDto.relatedProducts?.length) {
        relatedProducts = await this.productRepository.findByIds(
          createProductDto.relatedProducts,
        );
      }
  
      // Create new product instance
      const product = this.productRepository.create({
        ...createProductDto,
        category,
        relatedProducts,
      });
  
      return await this.productRepository.save(product);
    }
  
    async getAllProducts(): Promise<Product[]> {
      return this.productRepository.find({
        relations: ['category', 'relatedProducts', 'createdBy'],
      });
    }
  
    async getProductById(id: string): Promise<Product> {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['category', 'relatedProducts', 'createdBy'],
      });
  
      if (!product) {
        throw new NotFoundException(`Product not found`);
      }
  
      return product;
    }
  
    async updateProduct(
      id: string,
      productDto: ProductDto,
      user: User,
    ): Promise<Product> {
      const product = await this.getProductById(id);
  
      if (!product.canBeEditedBy(user)) {
        throw new BadRequestException(
          'You do not have permission to edit this product',
        );
      }
  
      // Handle category update
      if (productDto.categoryId) {
        const category = await this.categoryRepository.findOne({
          where: { id: productDto.categoryId },
        });
        if (!category) {
          throw new NotFoundException(`Category not found`);
        }
  
        product.category = category;
      }
  
      // Handle related products update
      if (productDto.relatedProducts?.length) {
        product.relatedProducts = await this.productRepository.findByIds(
          productDto.relatedProducts,
        );
      }
  
      Object.assign(product, productDto);
  
      return this.productRepository.save(product);
    }
  
    async softDeleteProduct(id: string, user: User): Promise<void> {
      const product = await this.getProductById(id);
  
      // Check if user has permission to delete
      if (!product.canBeEditedBy(user)) {
        throw new BadRequestException(
          'You do not have permission to delete this product',
        );
      }
  
      product.isDeleted = true;
      await this.productRepository.save(product);
    }
  
    async hardDeleteProduct(id: string): Promise<void> {
      const result = await this.productRepository.delete(id);
  
      if (result.affected === 0) {
        throw new NotFoundException(`Product with ID "${id}" not found`);
      }
    }
  }
  