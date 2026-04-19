"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BooksService = class BooksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.book.findMany({
                include: {
                    categories: { include: { category: true } },
                    publisher: true,
                    authors: { include: { author: true } },
                    copies: true,
                },
            });
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.book.findUnique({
                where: { bookId: id },
                include: {
                    categories: { include: { category: true } },
                    publisher: true,
                    authors: { include: { author: true } },
                    copies: true,
                },
            });
        });
    }
    search(term) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.book.findMany({
                where: {
                    OR: [
                        { title: { contains: term, mode: 'insensitive' } },
                        { isbn: { contains: term, mode: 'insensitive' } },
                        {
                            authors: {
                                some: {
                                    author: {
                                        OR: [
                                            { firstName: { contains: term, mode: 'insensitive' } },
                                            { lastName: { contains: term, mode: 'insensitive' } },
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                },
                include: {
                    categories: { include: { category: true } },
                    publisher: true,
                    authors: { include: { author: true } },
                    copies: true,
                },
            });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                let publisher = yield tx.publisher.findFirst({ where: { title: data.publisherTitle } });
                if (!publisher) {
                    publisher = yield tx.publisher.create({ data: { title: data.publisherTitle } });
                }
                const authorIds = [];
                for (const a of data.authors) {
                    let author = yield tx.author.findFirst({
                        where: { firstName: a.firstName, lastName: a.lastName, middleName: a.middleName || null },
                    });
                    if (!author) {
                        author = yield tx.author.create({
                            data: { firstName: a.firstName, lastName: a.lastName, middleName: a.middleName },
                        });
                    }
                    authorIds.push(author.authorId);
                }
                const book = yield tx.book.create({
                    data: {
                        title: data.title,
                        isbn: data.isbn,
                        publicationYear: data.publicationYear,
                        edition: data.edition,
                        language: data.language,
                        pageCount: data.pageCount,
                        publisherId: publisher.publisherId,
                        authors: {
                            create: authorIds.map(id => ({ authorId: id })),
                        },
                        categories: {
                            create: data.categoriesIds.map(id => ({ categoryId: id })),
                        },
                    },
                });
                if (data.initialCopyCount > 0) {
                    const copiesData = Array.from({ length: data.initialCopyCount }).map((_, idx) => ({
                        bookId: book.bookId,
                        status: 'AVAILABLE',
                        location: data.initialLocation,
                        barcode: `LIB-${Date.now()}-${idx}-${Math.floor(Math.random() * 10000)}`,
                    }));
                    yield tx.copy.createMany({ data: copiesData });
                    yield tx.stockHistory.create({
                        data: {
                            bookId: book.bookId,
                            movementType: 'INCREMENT',
                            previousQuantity: 0,
                            newQuantity: data.initialCopyCount,
                        }
                    });
                }
                return book;
            }));
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const updateData = {
                    title: data.title,
                    isbn: data.isbn,
                    publicationYear: data.publicationYear,
                    edition: data.edition,
                    language: data.language,
                    pageCount: data.pageCount,
                };
                if (data.publisherTitle) {
                    let publisher = yield tx.publisher.findFirst({ where: { title: data.publisherTitle } });
                    if (!publisher) {
                        publisher = yield tx.publisher.create({ data: { title: data.publisherTitle } });
                    }
                    updateData.publisherId = publisher.publisherId;
                }
                const book = yield tx.book.update({
                    where: { bookId: id },
                    data: updateData,
                });
                if (data.authors && data.authors.length > 0) {
                    yield tx.bookAuthor.deleteMany({ where: { bookId: id } });
                    const authorIds = [];
                    for (const a of data.authors) {
                        let author = yield tx.author.findFirst({
                            where: { firstName: a.firstName, lastName: a.lastName, middleName: a.middleName || null },
                        });
                        if (!author) {
                            author = yield tx.author.create({
                                data: { firstName: a.firstName, lastName: a.lastName, middleName: a.middleName },
                            });
                        }
                        authorIds.push(author.authorId);
                    }
                    yield tx.bookAuthor.createMany({
                        data: authorIds.map(aid => ({ bookId: id, authorId: aid })),
                    });
                }
                if (data.categoriesIds && data.categoriesIds.length > 0) {
                    yield tx.bookCategory.deleteMany({ where: { bookId: id } });
                    yield tx.bookCategory.createMany({
                        data: data.categoriesIds.map(cid => ({ bookId: id, categoryId: cid })),
                    });
                }
                return book;
            }));
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const copies = yield tx.copy.findMany({ where: { bookId: id, status: 'BORROWED' } });
                if (copies.length > 0) {
                    throw new common_1.BadRequestException("No se puede eliminar un libro con ejemplares prestados.");
                }
                const copiesIds = (yield tx.copy.findMany({ select: { copyId: true }, where: { bookId: id } })).map(c => c.copyId);
                if (copiesIds.length > 0) {
                    yield tx.lending.deleteMany({ where: { copyId: { in: copiesIds } } });
                }
                yield tx.copy.deleteMany({ where: { bookId: id } });
                yield tx.stockHistory.deleteMany({ where: { bookId: id } });
                yield tx.bookAuthor.deleteMany({ where: { bookId: id } });
                yield tx.bookCategory.deleteMany({ where: { bookId: id } });
                yield tx.bookGenre.deleteMany({ where: { bookId: id } });
                yield tx.reservation.deleteMany({ where: { bookId: id } });
                return tx.book.delete({ where: { bookId: id } });
            }));
        });
    }
};
exports.BooksService = BooksService;
exports.BooksService = BooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BooksService);
