import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublishersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.publisher.findMany({
      orderBy: { title: 'asc' }
    });
  }
}
