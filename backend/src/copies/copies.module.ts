import { Module } from '@nestjs/common';
import { CopiesController } from './copies.controller';
import { CopiesService } from './copies.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CopiesController],
  providers: [CopiesService]
})
export class CopiesModule {}
