import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log(process.env.JWT_SECRET);
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  });
  //creating get route

  await app.listen(process.env.PORT || 5000 , '0.0.0.0');
}

bootstrap();