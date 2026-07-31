import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DbService } from './db.service';

@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly db: DbService) {}

  @Get('health')
  async check() {
    try {
      await this.db.ping();
      this.logger.log('Health check passed');
      return { status: 'up', time: new Date().toISOString() };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Health check failed: ${message}`);
      throw new HttpException(
        { status: 'down', error: message },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
