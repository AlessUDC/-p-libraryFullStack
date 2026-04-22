"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const qrcode = __importStar(require("qrcode"));
const schedule_1 = require("@nestjs/schedule");
const notifications_service_1 = require("../notifications/notifications.service");
const library_gateway_1 = require("../notifications/library.gateway");
const RESERVATION_LIMITS = {
    STUDENT: 4,
    TEACHER: 8,
};
const RESERVATION_DURATION_MINUTES = {
    STUDENT: 15,
    TEACHER: 30,
};
const LENDING_MAX_DAYS = {
    IN_LIBRARY: 1,
    HOME_STUDENT: 7,
    HOME_TEACHER: 14,
};
let ReservationsService = class ReservationsService {
    constructor(prisma, notifications, libraryGateway) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.libraryGateway = libraryGateway;
    }
    create(userId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: { userId },
                include: { student: true, teacher: true, penalties: true, blocks: true },
            });
            if (!user)
                throw new common_1.NotFoundException('Usuario no encontrado');
            // Check role
            const isStudent = user.role === 'STUDENT';
            const isTeacher = user.role === 'TEACHER';
            if (!isStudent && !isTeacher) {
                throw new common_1.ForbiddenException('Solo estudiantes y docentes pueden hacer reservas');
            }
            // Check for active system blocks
            const activeBlock = user.blocks.find((b) => b.endDate === null || b.endDate > new Date());
            if (activeBlock) {
                throw new common_1.ForbiddenException(`Tu cuenta está bloqueada${activeBlock.endDate ? ` hasta el ${activeBlock.endDate.toLocaleDateString('es-PE')}` : ' permanentemente'}.`);
            }
            // Check active penalties that block lending
            const hasActiveMildPenalty = user.penalties.some((p) => p.status === 'ACTIVE' && p.type === 'MILD');
            const hasActiveSeverePenalty = user.penalties.some((p) => p.status === 'ACTIVE' &&
                (p.type === 'SEVERE' || p.type === 'VERY_SEVERE'));
            // Also check for any overdue loans (even if penalty not yet applied by cron)
            const activeOverdueLoans = yield this.prisma.lending.count({
                where: { borrowerUserId: userId, status: 'OVERDUE' },
            });
            if (hasActiveMildPenalty || hasActiveSeverePenalty || activeOverdueLoans > 0) {
                throw new common_1.ForbiddenException('Tienes sanciones activas o préstamos vencidos que impiden realizar nuevas reservas. Regulariza tu situación primero.');
            }
            // Count active pending reservations
            const activeReservations = yield this.prisma.reservation.count({
                where: { userId, status: 'PENDING' },
            });
            const limit = isStudent
                ? RESERVATION_LIMITS.STUDENT
                : RESERVATION_LIMITS.TEACHER;
            // Count active lendings too
            const activeLendings = yield this.prisma.lending.count({
                where: { borrowerUserId: userId, status: 'IN_PROGRESS' },
            });
            if (activeReservations + activeLendings >= limit) {
                throw new common_1.BadRequestException(`Has alcanzado el límite de ${limit} ${isStudent ? 'ejemplares' : 'ejemplares para docentes'} (reservas + préstamos activos).`);
            }
            // Check copy availability
            const copy = yield this.prisma.copy.findUnique({
                where: { copyId: dto.copyId },
                include: { book: true },
            });
            if (!copy)
                throw new common_1.NotFoundException('Ejemplar no encontrado');
            if (copy.status !== 'AVAILABLE') {
                throw new common_1.BadRequestException('El ejemplar no está disponible en este momento.');
            }
            // Validate requested pickup (in minutes) and return dates
            const plannedPickupDate = new Date(Date.now() + dto.pickupMinutes * 60000);
            const requestedReturnDate = new Date(dto.returnDate);
            // Validate minutes limits
            const maxMinutes = isTeacher ? 60 : 30;
            if (dto.pickupMinutes > maxMinutes) {
                throw new common_1.BadRequestException(`El tiempo máximo de reserva para ${isTeacher ? 'docentes' : 'estudiantes'} es de ${maxMinutes} minutos.`);
            }
            if (isNaN(requestedReturnDate.getTime())) {
                throw new common_1.BadRequestException('Fecha de devolución inválida.');
            }
            if (requestedReturnDate <= plannedPickupDate) {
                throw new common_1.BadRequestException('La fecha de devolución debe ser posterior al recojo.');
            }
            // The reservation expires at the exact time planned for pickup
            const expiresAt = plannedPickupDate;
            const qrToken = Math.floor(100000 + Math.random() * 900000).toString();
            const maxDays = dto.lendingType === 'IN_LIBRARY'
                ? LENDING_MAX_DAYS.IN_LIBRARY
                : (isTeacher ? LENDING_MAX_DAYS.HOME_TEACHER : LENDING_MAX_DAYS.HOME_STUDENT);
            const maxAllowedDate = new Date(plannedPickupDate);
            maxAllowedDate.setDate(maxAllowedDate.getDate() + maxDays);
            // Add a small buffer (e.g. end of the day or just slightly more)
            maxAllowedDate.setHours(23, 59, 59, 999);
            if (requestedReturnDate > maxAllowedDate) {
                throw new common_1.BadRequestException(`La fecha de devolución seleccionada excede el máximo permitido para este tipo de préstamo (${maxDays} días). Máximo permitido: ${maxAllowedDate.toLocaleString('es-PE')}`);
            }
            // Generate QR image
            const qrPayload = JSON.stringify({
                token: qrToken,
                reservationId: 'pending',
                userId,
                copyId: copy.copyId,
                bookId: copy.bookId,
            });
            const qrImageData = yield qrcode.toDataURL(qrPayload);
            // Create reservation + mark copy as RESERVED in transaction
            const reservation = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.copy.update({
                    where: { copyId: copy.copyId },
                    data: { status: 'RESERVED' },
                });
                const res = yield tx.reservation.create({
                    data: {
                        userId,
                        copyId: copy.copyId,
                        bookId: copy.bookId,
                        lendingType: dto.lendingType,
                        expiresAt,
                        plannedPickupDate,
                        requestedReturnDate,
                        status: 'PENDING',
                        qrToken,
                        qrImageData,
                    },
                    include: {
                        book: true,
                        copy: true,
                    },
                });
                // Update qrPayload to include the real reservationId
                const updatedQrPayload = JSON.stringify({
                    token: qrToken,
                    reservationId: res.reservationId,
                    userId,
                    copyId: copy.copyId,
                    bookId: copy.bookId,
                });
                const updatedQrImage = yield qrcode.toDataURL(updatedQrPayload);
                return tx.reservation.update({
                    where: { reservationId: res.reservationId },
                    data: { qrImageData: updatedQrImage },
                    include: {
                        book: true,
                        copy: true,
                        user: { include: { userData: true } },
                    },
                });
            }));
            const durationRemainingMinutes = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60)));
            // Send notification (non-blocking)
            const userName = `${reservation.user.userData.firstName} ${reservation.user.userData.paternalLastName}`;
            if (reservation.user.userData.email) {
                this.notifications.sendReservationConfirmation(reservation.user.userData.email, userName, reservation.book.title, expiresAt, durationRemainingMinutes);
            }
            this.libraryGateway.emitUpdate('library-updated');
            return {
                reservation,
                qrImageData: reservation.qrImageData,
                expiresAt,
                serverTime: new Date(),
                secondsRemaining: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
                durationMinutes: durationRemainingMinutes,
                message: `Reserva exitosa. Tienes hasta el ${expiresAt.toLocaleString('es-PE')} para recoger tu ejemplar.`,
            };
        });
    }
    getMyReservations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.reservation.findMany({
                where: { userId },
                orderBy: { reservationDate: 'desc' },
                include: {
                    book: {
                        include: {
                            authors: { include: { author: true } },
                            copies: true,
                        },
                    },
                    copy: true,
                },
            });
        });
    }
    cancel(reservationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservation = yield this.prisma.reservation.findUnique({
                where: { reservationId },
            });
            if (!reservation)
                throw new common_1.NotFoundException('Reserva no encontrada');
            if (reservation.userId !== userId) {
                throw new common_1.ForbiddenException('No puedes cancelar una reserva que no es tuya');
            }
            if (reservation.status !== 'PENDING') {
                throw new common_1.BadRequestException('Solo se pueden cancelar reservas pendientes');
            }
            yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.copy.update({
                    where: { copyId: reservation.copyId },
                    data: { status: 'AVAILABLE' },
                });
                yield tx.reservation.update({
                    where: { reservationId },
                    data: { status: 'CANCELED' },
                });
            }));
            yield this.libraryGateway.emitUpdate('library-updated');
            return { message: 'Reserva cancelada exitosamente' };
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.reservation.findMany({
                orderBy: { reservationDate: 'desc' },
                include: {
                    book: {
                        include: {
                            authors: { include: { author: true } },
                        },
                    },
                    copy: true,
                    user: {
                        include: {
                            userData: true,
                            student: true,
                            teacher: true,
                        },
                    },
                },
            });
        });
    }
    // Cron: Run every 30 seconds to expire stale reservations promptly
    expireStaleReservations() {
        return __awaiter(this, void 0, void 0, function* () {
            const expired = yield this.prisma.reservation.findMany({
                where: {
                    status: 'PENDING',
                    expiresAt: { lt: new Date() },
                },
                select: { reservationId: true, copyId: true },
            });
            if (expired.length === 0)
                return;
            yield this.prisma.$transaction([
                this.prisma.copy.updateMany({
                    where: { copyId: { in: expired.map((e) => e.copyId) } },
                    data: { status: 'AVAILABLE' },
                }),
                this.prisma.reservation.updateMany({
                    where: { reservationId: { in: expired.map((e) => e.reservationId) } },
                    data: {
                        status: 'EXPIRED',
                        qrToken: null // Clear token
                    },
                }),
            ]);
            this.libraryGateway.emitUpdate('library-updated');
            // Emit specific expiry events for targeted UI reactivity
            expired.forEach(res => {
                this.libraryGateway.emitUpdate('reservation-expired', {
                    reservationId: res.reservationId
                });
            });
            console.log(`[Reservations CRON] Expired ${expired.length} stale reservations.`);
        });
    }
};
exports.ReservationsService = ReservationsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsService.prototype, "expireStaleReservations", null);
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        library_gateway_1.LibraryGateway])
], ReservationsService);
