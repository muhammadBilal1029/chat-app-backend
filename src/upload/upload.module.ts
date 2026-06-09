import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [ConfigModule, JwtModule.register({})],
  controllers: [UploadController],
})
export class UploadModule {}