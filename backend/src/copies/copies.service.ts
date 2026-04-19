import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateQuantityDto } from './dto/update-quantity.dto';

@Injectable()
export class CopiesService {
  constructor(private prisma: PrismaService) {}

  async updateQuantity(bookId: string, dto: UpdateQuantityDto) {
    return this.prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { bookId } });
      if (!book) throw new BadRequestException('El libro no existe.');

      const copies = await tx.copy.findMany({ where: { bookId } });
      const currentQuantity = copies.length;

      if (dto.quantity === currentQuantity) return { success: true };

      let movementType: 'INCREMENT' | 'DECREMENT' = 'INCREMENT';

      if (dto.quantity > currentQuantity) {
        const toGenerate = dto.quantity - currentQuantity;
        const newCopies = Array.from({ length: toGenerate }).map((_, idx) => ({
          bookId,
          status: 'AVAILABLE' as any,
          location: dto.location,
          barcode: `LIB-${Date.now()}-${idx}-${Math.floor(Math.random() * 10000)}`,
        }));
        await tx.copy.createMany({ data: newCopies });
      } else {
        const toRemove = currentQuantity - dto.quantity;
        movementType = 'DECREMENT';
        
        const availableCopies = copies.filter(c => c.status === 'AVAILABLE');
        if (availableCopies.length < toRemove) {
           throw new BadRequestException(`No hay suficientes copias disponibles para remover. Copias disponibles: ${availableCopies.length}`);
        }

        const idsToRemove = availableCopies.slice(0, toRemove).map(c => c.copyId);
        await tx.copy.deleteMany({ where: { copyId: { in: idsToRemove } } });
      }

      await tx.stockHistory.create({
        data: {
          bookId,
          movementType,
          previousQuantity: currentQuantity,
          newQuantity: dto.quantity,
          userId: null,
        }
      });

      return { success: true };
    });
  }

  async getHistory(bookId: string) {
    return this.prisma.stockHistory.findMany({
      where: { bookId },
      orderBy: { date: 'desc' },
      include: { user: { include: { userData: true } } }
    }).then(histories => histories.map(h => ({
      historyId: h.historyId,
      date: h.date,
      movementType: h.movementType,
      previousQuantity: h.previousQuantity,
      newQuantity: h.newQuantity,
      user: h.user ? `${h.user.userData.firstName} ${h.user.userData.paternalLastName}` : 'SYSTEM',
    })));
  }

  async getBookCopies(bookId: string) {
    return this.prisma.copy.findMany({
      where: { bookId },
      orderBy: { location: 'asc' },
    });
  }
}
