import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Chat' })
  chatId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  senderId: Types.ObjectId;

  @Prop()
  text?: string;

  @Prop()
  fileUrl?: string;

  @Prop({ default: 'text' })
  type: 'text' | 'image' | 'audio' | 'video' | 'file' | 'audio-call-start' | 'audio-call-end' |'audio-call-rejected' | 'audio-call-missed' |
'video-call-start' | 'video-call-end' | 'video-call-rejected' | 'video-call-missed' ;
  

  @Prop({ default: 'sent' })
status: 'sent' | 'delivered' | 'seen';

  @Prop()
  duration?: number;
}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);