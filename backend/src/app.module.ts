import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BooksModule } from './books/books.module';
import { StudentsModule } from './students/students.module';
import { LoansModule } from './loans/loans.module';
import { LibrariansModule } from './librarians/librarians.module';
import { AuthModule } from './auth/auth.module';
import { FacultiesModule } from './faculties/faculties.module';
import { SchoolsModule } from './schools/schools.module';
import { LocationsModule } from './locations/locations.module';

import { MailerModule } from '@nestjs-modules/mailer';
import { CopiesModule } from './copies/copies.module';
import { CategoriesModule } from './categories/categories.module';
import { PublishersModule } from './publishers/publishers.module';

@Module({
  imports: [
    PrismaModule, 
    BooksModule, 
    StudentsModule, 
    LoansModule, 
    LibrariansModule, 
    AuthModule,
    FacultiesModule,
    SchoolsModule,
    LocationsModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER || 'test@gmail.com',
          pass: process.env.EMAIL_PASS || 'defaultpass',
        },
      },
      defaults: {
        from: '"Nexus Biblioteca" <noreply@nexus.com>',
      },
    }),
    CopiesModule,
    CategoriesModule,
    PublishersModule,
  ]
})
export class AppModule {}
