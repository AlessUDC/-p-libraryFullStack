import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { CopiesService } from './copies.service';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('copies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CopiesController {
  constructor(private readonly copiesService: CopiesService) {}

  @Patch('update-quantity/:id')
  @Roles(UserRole.LIBRARIAN, UserRole.ADMINISTRATOR)
  updateQuantity(@Param('id') bookId: string, @Body() updateQuantityDto: UpdateQuantityDto) {
    return this.copiesService.updateQuantity(bookId, updateQuantityDto);
  }

  @Get('history/:id')
  @Roles(UserRole.LIBRARIAN, UserRole.ADMINISTRATOR)
  getHistory(@Param('id') bookId: string) {
    return this.copiesService.getHistory(bookId);
  }

  @Get('book/:id')
  @Roles(UserRole.LIBRARIAN, UserRole.ADMINISTRATOR)
  getGivenBookCopies(@Param('id') bookId: string) {
    return this.copiesService.getBookCopies(bookId);
  }
}
