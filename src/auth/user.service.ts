import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthPayloadDto } from './dto/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async create(authPayload: AuthPayloadDto): Promise<User> {
    const user = this.userRepository.create(authPayload);
    return this.userRepository.save(user);
  }

  async updateUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}