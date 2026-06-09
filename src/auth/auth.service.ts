import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.schema';
import { RegisterDto, LoginDto } from './dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userModel.findOne({ email: dto.email });

    if (exists) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      emailVerificationToken: otp,
      emailVerificationTokenExpires: otpExpires,
    });

    await this.emailService.sendWelcomeEmail(dto.email, dto.name, otp);

    return this.createToken(user);
  }

  async verifyEmail(otp: string, email: string) {
    const user = await this.userModel.findOne({
      email,
      emailVerificationToken: otp,
      emailVerificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto) {
    console.log("login call:",dto)
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Invalid email or password');
    }

    return this.createToken(user);
  }

  createToken(user: any) {
    const token = this.jwtService.sign({
      userId: user._id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
  async getUsers() {
  return this.userModel
    .find()
    .select('_id name email avatar isOnline socketId');
}
}