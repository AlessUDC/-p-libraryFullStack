import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BooksModule } from './books/books.module';
import { StudentsModule } from './students/students.module';
import { LoansModule } from './loans/loans.module';
import { LibrariansModule } from './librarians/librarians.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, BooksModule, StudentsModule, LoansModule, LibrariansModule, AuthModule]
})
export class AppModule {}
