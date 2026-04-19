"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const books_module_1 = require("./books/books.module");
const students_module_1 = require("./students/students.module");
const loans_module_1 = require("./loans/loans.module");
const librarians_module_1 = require("./librarians/librarians.module");
const auth_module_1 = require("./auth/auth.module");
const faculties_module_1 = require("./faculties/faculties.module");
const schools_module_1 = require("./schools/schools.module");
const locations_module_1 = require("./locations/locations.module");
const mailer_1 = require("@nestjs-modules/mailer");
const copies_module_1 = require("./copies/copies.module");
const categories_module_1 = require("./categories/categories.module");
const publishers_module_1 = require("./publishers/publishers.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            books_module_1.BooksModule,
            students_module_1.StudentsModule,
            loans_module_1.LoansModule,
            librarians_module_1.LibrariansModule,
            auth_module_1.AuthModule,
            faculties_module_1.FacultiesModule,
            schools_module_1.SchoolsModule,
            locations_module_1.LocationsModule,
            mailer_1.MailerModule.forRoot({
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
            copies_module_1.CopiesModule,
            categories_module_1.CategoriesModule,
            publishers_module_1.PublishersModule,
        ]
    })
], AppModule);
