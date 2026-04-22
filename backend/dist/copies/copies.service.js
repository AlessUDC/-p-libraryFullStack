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
exports.CopiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CopiesService = class CopiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    updateQuantity(bookId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const book = yield tx.book.findUnique({ where: { bookId } });
                if (!book)
                    throw new common_1.BadRequestException('El libro no existe.');
                const copies = yield tx.copy.findMany({ where: { bookId } });
                const currentQuantity = copies.length;
                if (dto.quantity === currentQuantity)
                    return { success: true };
                let movementType = 'INCREMENT';
                if (dto.quantity > currentQuantity) {
                    const toGenerate = dto.quantity - currentQuantity;
                    const newCopies = Array.from({ length: toGenerate }).map((_, idx) => ({
                        bookId,
                        status: 'AVAILABLE',
                        location: dto.location,
                        barcode: `LIB-${Date.now()}-${idx}-${Math.floor(Math.random() * 10000)}`,
                    }));
                    yield tx.copy.createMany({ data: newCopies });
                }
                else {
                    const toRemove = currentQuantity - dto.quantity;
                    movementType = 'DECREMENT';
                    const availableCopies = copies.filter(c => c.status === 'AVAILABLE');
                    if (availableCopies.length < toRemove) {
                        throw new common_1.BadRequestException(`No hay suficientes copias disponibles para remover. Copias disponibles: ${availableCopies.length}`);
                    }
                    const idsToRemove = availableCopies.slice(0, toRemove).map(c => c.copyId);
                    // Handle relations to avoid foreign key violations
                    if (idsToRemove.length > 0) {
                        // Delete Fines related to Lendings of these copies
                        yield tx.fine.deleteMany({
                            where: { lending: { copyId: { in: idsToRemove } } }
                        });
                        // Delete Lendings
                        yield tx.lending.deleteMany({
                            where: { copyId: { in: idsToRemove } }
                        });
                        // Delete Reservations
                        yield tx.reservation.deleteMany({
                            where: { copyId: { in: idsToRemove } }
                        });
                        // Finally delete the copies
                        yield tx.copy.deleteMany({ where: { copyId: { in: idsToRemove } } });
                    }
                }
                yield tx.stockHistory.create({
                    data: {
                        bookId,
                        movementType,
                        previousQuantity: currentQuantity,
                        newQuantity: dto.quantity,
                        userId: null,
                    }
                });
                return { success: true };
            }));
        });
    }
    getHistory(bookId) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    getBookCopies(bookId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.copy.findMany({
                where: { bookId },
                orderBy: { location: 'asc' },
            });
        });
    }
};
exports.CopiesService = CopiesService;
exports.CopiesService = CopiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CopiesService);
