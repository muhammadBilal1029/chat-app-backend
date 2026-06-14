import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from './chat.schema';
import { Message } from './message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async createOrGetChat(user1: string, user2: string) {
     const u1 = new Types.ObjectId(user1);
  const u2 = new Types.ObjectId(user2);
    let chat = await this.chatModel.findOne({
      participants: { $all: [u1, u2] },
    });

    if (!chat) {
      chat = await this.chatModel.create({
        participants: [u1, u2],
      });
    }
    console.log("chat",chat)
    return chat;
  }

  async sendMessage(data: {
    chatId: string;
    senderId: string;
    text?: string;
    fileUrl?: string;
    type?: any;
  }) {
    return this.messageModel.create(data);
  }

  async getMessages(chatId: string) {
    return this.messageModel
      .find({ chatId: new Types.ObjectId(chatId) })
      .sort({ createdAt: 1 });
  }

  async createSystemMessage(data: any) {
  return this.messageModel.create({
    chatId: data.chatId,
    senderId: data.senderId,
    type: data.type,
    duration: data.duration,
  });
}


async markMessagesSeen(chatId: string, userId: string) {
  return this.messageModel.updateMany(
    {
      chatId,
      senderId: { $ne: userId },
    },
    {
      status: 'seen',
    },
  );
}
}