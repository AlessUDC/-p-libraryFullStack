import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.book.findMany({
      include: {
        categories: { include: { category: true } },
        publisher: true,
        authors: { include: { author: true } },
        copies: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.book.findUnique({
      where: { bookId: id },
      include: {
        categories: { include: { category: true } },
        publisher: true,
        authors: { include: { author: true } },
        copies: true,
      },
    });
  }

  async search(term: string) {
    return this.prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { isbn: { contains: term, mode: 'insensitive' } },
        ],
      },
      include: {
        categories: { include: { category: true } },
        publisher: true,
        authors: { include: { author: true } },
        copies: true,
      },
    });
  }
}
