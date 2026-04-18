import { Module } from '@nestjs/common';
import { LibrariansController } from './librarians.controller';
import { LibrariansService } from './librarians.service';

@Module({
  controllers: [LibrariansController],
  providers: [LibrariansService]
})
export class LibrariansModule {}
