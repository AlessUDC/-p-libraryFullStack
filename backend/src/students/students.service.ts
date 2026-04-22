import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.student.findMany({
      include: {
        user: {
          include: {
            userData: true,
          }
        },
        school: {
          include: {
            faculty: true,
          }
        }
      }
    });
  }
}
