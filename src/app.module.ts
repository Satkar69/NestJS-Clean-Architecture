import { Module } from '@nestjs/common';
import { AppController } from './presentation/controllers/app.controller';
import { AppService } from './core/application/use-cases/app.service';
import { DataServicesModule } from './infrastructure/data-services/data-services.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    DataServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
