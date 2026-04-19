import { Controller, Get, UseGuards } from '@nestjs/common';
import { PublishersService } from './publishers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('publishers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @Get()
  @Roles(UserRole.LIBRARIAN, UserRole.ADMINISTRATOR)
  findAll() {
    return this.publishersService.findAll();
  }
}
