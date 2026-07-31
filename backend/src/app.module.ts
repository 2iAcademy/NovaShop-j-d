import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { DbService } from './db.service';

@Module({
  imports: [],
  controllers: [AppController, HealthController],
  providers: [AppService, DbService],
})
export class AppModule {}
