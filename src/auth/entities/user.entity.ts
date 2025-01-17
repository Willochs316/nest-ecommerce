import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/roles/role.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ type: 'date', nullable: true })
  birthday?: Date;

  @Column({ nullable: true })
  occupation?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  nationality?: string;

  @Column({ type: 'enum', enum: Role, default: Role.Customer })
  role: Role;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      } catch (error) {
        throw new Error('Failed to hash password');
      }
    }
  }

  // Separate method for hashing new passwords
  async hashNewPassword(newPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(newPassword, salt);
  }

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  location?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  profileComplete: boolean; // Indicates if the user has completed their profile

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpires?: Date;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  checkProfileComplete(): boolean {
    const requiredFields = [
      'email',
      'isEmailVerified',
      'firstname',
      'lastname',
      'phone',
      'address',
      'city',
      'state',
      'postalCode',
      'birthday',
      'occupation',
      'nationality',
    ];

    return requiredFields.every((field) => !!this[field]);
  }
}
