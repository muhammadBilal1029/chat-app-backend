import { Body, Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { otp: string; email: string }) {
    return this.authService.verifyEmail(body.otp, body.email);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
getUsers() {
  return this.authService.getUsers();
}
}