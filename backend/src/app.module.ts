import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';
import { LibrariansModule } from './librarians/librarians.module';
import { AuthModule } from './auth/auth.module';
import { FacultiesModule } from './faculties/faculties.module';
import { SchoolsModule } from './schools/schools.module';
import { LocationsModule } from './locations/locations.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    StudentsModule,
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
        from: '"Nexus Platform" <noreply@nexus.com>',
      },
    }),
  ],
})
export class AppModule {}
