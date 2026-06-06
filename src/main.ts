import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log(process.env.JWT_SECRET);
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:3001",
    credentials: true,
  });

  await app.listen(process.env.PORT || 5000);
}

bootstrap();