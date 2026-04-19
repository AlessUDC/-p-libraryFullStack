import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async findByFaculty(facultyId: string) {
    return this.prisma.school.findMany({
      where: { facultyId },
      orderBy: { title: 'asc' }
    });
  }
}
