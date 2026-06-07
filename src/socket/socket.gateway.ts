import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat/chat.service';
import { User } from '../auth/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@WebSocketGateway({
  cors: {
    origin: "http://localhost:3001",
    credentials: true,
  },
  transports: ["websocket"],
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async handleConnection(client: Socket) {
    console.log('User connected:', client.id);
  }

  async handleDisconnect(client: Socket) {

  console.log(
    'User disconnected:',
    client.id,
  );

  if (client.data.userId) {

    await this.userModel.findByIdAndUpdate(
      client.data.userId,
      {
        isOnline: false,
        socketId: null,
      },
    );

    this.server.emit(
      'userStatusChanged',
    );
  }
}

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    client.join(data.chatId);
    console.log(
      `Socket ${client.id} joined room ${data.chatId}`,
    );
      const room = this.server.sockets.adapter.rooms.get(
    data.chatId,
  );

  console.log(
    'Users in room:',
    room ? Array.from(room) : [],
  );
    
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: any) {
    console.log('SEND MESSAGE EVENT');
  console.log(data);
  
    const message = await this.chatService.sendMessage(data);
    console.log(
      'Broadcasting to room:',
      data.chatId,
    );

    this.server.to(data.chatId).emit('newMessage', message);
  }
  @SubscribeMessage('registerUser')
  async registerUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {

  client.data.userId = data.userId;

  await this.userModel.findByIdAndUpdate(
    data.userId,
    {
      socketId: client.id,
      isOnline: true,
    },
  );

  console.log(
    `User ${data.userId} registered with socket ${client.id}`,
  );

  this.server.emit('userStatusChanged');
}
  // Audio/Video call request
  @SubscribeMessage('callUser')
  async handleCallUser(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: any,
) {
    console.log('CALL USER EVENT');
  console.log(data);
 await this.chatService.createSystemMessage({
  chatId: data.chatId,
  senderId: data.callerId,
  type: 'audio-call-start',
});
  this.server
    .to(data.receiverSocketId)
    .emit('incomingCall', {
      ...data,
      callerSocketId: client.id,
    });
}

  @SubscribeMessage('answerCall')
  handleAnswerCall(@MessageBody() data: any) {
    this.server.to(data.callerSocketId).emit('callAccepted', data);
  }

  @SubscribeMessage('iceCandidate')
handleIceCandidate(
  @MessageBody() data: any,
) {

  console.log(
    'ICE RELAY',
    data.to,
  );

  this.server
    .to(data.to)
    .emit(
      'iceCandidate',
      data.candidate,
    );
}

  @SubscribeMessage('endCall')
  async handleEndCall(@MessageBody() data: any) {
    await this.chatService.createSystemMessage({
  chatId: data.chatId,
  senderId: data.userId,
  type: 'audio-call-end',
  duration: data.duration,
});
    this.server.to(data.to).emit('callEnded');
  }

  @SubscribeMessage('rejectCall')
async handleRejectCall(@MessageBody() data: any) {
  await this.chatService.sendMessage({
    chatId: data.chatId,
    senderId: data.userId,
    type: 'audio-call-rejected',
  });

  this.server.to(data.to).emit('callRejected', data);
  this.server.to(data.chatId).emit('newMessage', {
    chatId: data.chatId,
    senderId: data.userId,
    type: 'audio-call-rejected',
  });
}

@SubscribeMessage('missedCall')
async handleMissedCall(@MessageBody() data: any) {
  await this.chatService.sendMessage({
    chatId: data.chatId,
    senderId: data.callerId,
    type: 'audio-call-missed',
  });

  this.server.to(data.chatId).emit('newMessage', {
    chatId: data.chatId,
    senderId: data.callerId,
    type: 'audio-call-missed',
  });
}

@SubscribeMessage('typing')
handleTyping(@MessageBody() data: any) {
  this.server.to(data.chatId).emit('userTyping', data);
}

@SubscribeMessage('stopTyping')
handleStopTyping(@MessageBody() data: any) {
  this.server.to(data.chatId).emit('userStopTyping', data);
}

@SubscribeMessage('messageSeen')
async handleMessageSeen(@MessageBody() data: any) {
  await this.chatService.markMessagesSeen(data.chatId, data.userId);
 console.log('MESSAGE SEEN EVENT');
console.log(data);
  this.server.to(data.chatId).emit('messagesSeen', {
    chatId: data.chatId,
    userId: data.userId,
  });
  console.log('EMITTING messagesSeen');
}
}