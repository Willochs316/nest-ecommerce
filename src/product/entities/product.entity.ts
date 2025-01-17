import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductCondition, ProductStatus } from '../product.enum';
import { User } from 'src/auth/entities/user.entity';
import { Role } from 'src/auth/roles/role.enum';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  compareAtPrice?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Check('price >= 0')
  price: number;

  @Column()
  sku: string;

  @Column({ type: 'int', default: 0 })
  @Check('quantity >= 0')
  stock: number; // Number of items available

  @Column({ type: 'int', default: 0 })
  @Check('lowStockThreshold >= 0')
  lowStockThreshold: number;

  @Column({ type: 'boolean', default: true })
  trackInventory: boolean; // monitor stock levels and trigger alert on low stock

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[]; // Tags are used to group similar products together (e.g., "summer", "winter", "sale", "new arrivals", "casual", "cotton")

  @Column({ type: 'boolean', default: false })
  featured: boolean; // special section or promotion

  @Column({ nullable: true })
  brand?: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0 })
  averageRating: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @Check('discountPercentage >= 0 AND discountPercentage <= 100')
  discountPercentage?: number;

  @Column({ type: 'timestamp', nullable: true })
  discountExpires?: Date;

  @Column({ type: 'text', nullable: true })
  specifications?: string[];

  @ManyToMany(() => Product)
  @JoinTable()
  relatedProducts: Product[];

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: User; // Reference to the vendor who created the product

  @Column({ nullable: false })
  createdById: string;

  @Column({
    type: 'enum',
    enum: ProductCondition,
    default: ProductCondition.NEW,
  })
  condition: ProductCondition;

  @Column({ type: 'text', nullable: true })
  seoTitle: string;

  @Column({ type: 'text', nullable: true })
  seoDescription: string;

  @Column({ type: 'simple-array', nullable: true })
  seoKeywords: string[];

  @Column({ nullable: true })
  barcode?: string;

  //   @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  //   weight: number;

  //   @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  //   width: number;

  //   @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  //   height: number;

  //   @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  //   length: number;

  //   @Column({ nullable: true })
  //   manufacturer: string;

  //   @Column({ type: 'text', nullable: true })
  //   warrantyInfo: string;

  @ManyToMany(() => User)
  @JoinTable()
  wishlistedBy?: User[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  @Check('rating >= 0 AND rating <= 5')
  rating: number;

  @Column({ type: 'simple-array', nullable: true })
  promotionCodes?: string[];

  @Column({ type: 'text', nullable: true })
  safetyWarnings?: string;

  @Column({ type: 'text', nullable: true })
  returnPolicy?: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @Column({ nullable: true })
  approvedById: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  //   @OneToMany(() => Review, (review) => review.product)
  //   reviews: Review[];

  // Methods
  canBeEditedBy(user: User): boolean {
    return (
      [Role.Admin, Role.SuperAdmin, Role.ProductManager].includes(user.role) ||
      (user.role === Role.Vendor && this.createdById === user.id)
    );
  }

  canBeApprovedBy(user: User): boolean {
    return [Role.Admin, Role.SuperAdmin, Role.ProductManager].includes(
      user.role,
    );
  }

  calculateDiscountedPrice(): number {
    return this.discountPercentage > 0
      ? Number((this.price * (1 - this.discountPercentage / 100)).toFixed(2))
      : this.price;
  }

  isLowStock(): boolean {
    return this.stock <= this.lowStockThreshold;
  }

  canPurchase(): boolean {
    return this.stock > 0 && this.status === ProductStatus.ACTIVE;
  }

  calculateDiscountPercentage(): number {
    if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
    return Number(
      (
        ((this.compareAtPrice - this.price) / this.compareAtPrice) *
        100
      ).toFixed(2),
    );
  }
}
