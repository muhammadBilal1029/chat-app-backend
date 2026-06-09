import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  @Post('create')
  createChat(@Body() body: { user1: string; user2: string }) {
    return this.chatService.createOrGetChat(body.user1, body.user2);
  }

  @Get('messages/:chatId')
  getMessages(@Param('chatId') chatId: string) {
    return this.chatService.getMessages(chatId);
  }

  @Get(':chatId/history')
getHistory(
  @Param('chatId') chatId: string,
) {
  return this.messageModel
  .find({
    chatId,
  })
  .sort({ createdAt: 1 });
}
}