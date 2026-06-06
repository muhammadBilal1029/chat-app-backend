import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { SocketGateway } from './socket.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/user.schema';
@Module({
  imports: [ChatModule,
     MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        
      },
     
    ]),
  ],
  providers: [SocketGateway],
})
export class SocketModule {}