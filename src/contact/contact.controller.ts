import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('contact')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('add')
  async addContact(@Request() req, @Body() body: { email: string }) {
    const userId = req.user.userId;
    return this.contactService.addContact(userId, body.email);
  }

  @Get()
  async getContacts(@Request() req) {
    console.log("REQ USER:", req.user);
    const userId = req.user.userId;
    return this.contactService.getContacts(userId);
  }
}
