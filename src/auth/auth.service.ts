import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthPayloadDto } from './dto/auth.dto';
import { User } from 'src/auth/entities/user.entity';
import { Request } from 'express';
import ShortUniqueId from 'short-unique-id';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly blacklistedTokens: Set<string> = new Set();
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async createUser(authPayload: AuthPayloadDto): Promise<{
    user: Omit<
      User,
      'password' | 'hashPassword' | 'hashNewPassword' | 'checkProfileComplete'
    >;
    token: string;
    verificationToken: string;
  }> {
    try {
      const normalizedEmail = authPayload.email.toLowerCase();

      const existingUser = await this.userRepository.findOne({
        where: [{ email: normalizedEmail }, { phone: authPayload.phone }],
      });

      if (existingUser) {
        throw new ConflictException('Unable to re-register account');
      }

      const user = this.userRepository.create({
        ...authPayload,
        email: normalizedEmail,
        isActive: true,
        isEmailVerified: false,
      });

      const savedUser = await this.userRepository.save(user);

      // Generate verification token
      //  const verificationToken = short.generate();
      const uid = new ShortUniqueId({ length: 24 });
      const verificationToken = uid.randomUUID();

      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = new Date(
        Date.now() + process.env.VERIFICATION_EXPIRATION_TIME,
      );

      await this.userRepository.save(savedUser);

      // Send verification email
      // await this.sendVerificationEmail(savedUser.email, verificationToken);

      // Check profile completion and update if needed
      const profileComplete = savedUser.checkProfileComplete();
      if (profileComplete !== savedUser.profileComplete) {
        savedUser.profileComplete = profileComplete;
        await this.userRepository.save(savedUser);
      }

      // Exclude sensitive data and methods
      const {
        password,
        hashPassword,
        checkProfileComplete,
        ...userWithoutSensitiveData
      } = savedUser;

      const token = this.generateToken(savedUser);

      return { user: userWithoutSensitiveData, token, verificationToken };
    } catch (error) {
      console.error('Error saving user to DB:', error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async verifyEmail(token: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (
      !user ||
      (user.emailVerificationExpires &&
        user.emailVerificationExpires < new Date())
    ) {
      throw new BadRequestException('Invalid token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    user.profileComplete = user.checkProfileComplete();
    await this.userRepository.save(user);

    // Return a Partial<User>
    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      profileComplete: user.profileComplete,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as Partial<User>;
  }

  async login(authPayload: AuthPayloadDto): Promise<{
    user: {
      id: string;
      email: string;
      firstname: string;
      lastname: string;
      avatarUrl?: string;
      role: string;
      isActive: boolean;
      previousLogin?: Date;
      lastLogin?: Date;
      profileComplete: boolean;
    };
    token: string;
  }> {
    try {
      const { email, password } = authPayload;

      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
        select: [
          'id',
          'email',
          'password',
          'firstname',
          'lastname',
          'avatarUrl',
          'role',
          'isActive',
          'lastLogin',
        ],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      //     // Capture IP Address
      //     // const ipAddress = req.ip;
      //     // user.ipAddress = ipAddress;

      //     // const location = await this.fetchLocationFromIP(ipAddress);
      //     // user.location = location;

      const previousLogin = user.lastLogin;
      user.lastLogin = new Date();

      await this.userRepository.save(user);

      const token = this.generateToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          avatarUrl: user.avatarUrl,
          role: user.role,
          isActive: user.isActive,
          previousLogin,
          lastLogin: user.lastLogin,
          profileComplete: user.profileComplete,
        },
        token,
      };
    } catch (error) {
      console.error('Error saving user to DB:', error.message);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  // Request Password Reset
  async requestPasswordReset(email: string): Promise<{ resetToken: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a reset token
    const uid = new ShortUniqueId({ length: 24 });
    const resetToken = uid.randomUUID();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(
      Date.now() + process.env.PASSWORD_RESET_EXPIRATION_TIME,
    );

    await this.userRepository.save(user);

    // Send email with reset token (You need to implement sending email logic here)
    // await this.sendResetPasswordEmail(user.email, resetToken);

    return { resetToken };
  }

  async validateResetToken(token: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          passwordResetToken: token,
        },
        select: [
          'id',
          'password',
          'passwordResetToken',
          'passwordResetExpires',
        ],
      });

      if (!user || !user.passwordResetExpires) {
        throw new BadRequestException('Invalid token');
      }

      const isExpired = user.passwordResetExpires < new Date();
      if (isExpired) {
        throw new BadRequestException('Token has expired');
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  // Reset Password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const user = await this.validateResetToken(token);

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from the old password',
        );
      }

      user.password = await user.hashNewPassword(newPassword);

      // Clear the reset token and expiration
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      const isTokenValid = this.jwtService.verify(token, {
        ignoreExpiration: true,
      });
      if (!isTokenValid) {
        throw new NotFoundException('Invalid token');
      }

      // Blacklist the token by adding it to the set
      this.blacklistedTokens.add(token);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  private generateToken(user: User): string {
    const payload = { id: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }

  // Sending Reset Emails
  // async sendPasswordResetEmail(email: string, token: string): Promise<void> {
  //   // Implement your email sending logic here
  //   const resetUrl = `http://your-frontend-url/reset-password?token=${token}`;
  //   // Send email to the user with the resetUrl
  // }

  private async fetchLocationFromIP(ip: string) {}

  // private async fetchLocationFromIP(ip: string): Promise<string> {
  //   // Use an external API to fetch location based on IP
  //   const response = await fetch(`https://ipinfo.io/${ip}?token=YOUR_TOKEN`);
  //   const data = await response.json();
  //   return data.city ? `${data.city}, ${data.region}, ${data.country}` : 'Unknown';
  // }
}
