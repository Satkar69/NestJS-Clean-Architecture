import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './presentation/filters';
import { ValidationPipe } from './presentation/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // -- Cors setup
  app.enableCors({
    origin: ['*'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Server is running on port: ${process.env.PORT}`);
}
bootstrap();
