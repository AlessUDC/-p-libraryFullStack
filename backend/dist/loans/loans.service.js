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
exports.LoansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const qrcode = __importStar(require("qrcode"));
const library_1 = require("@prisma/client/runtime/library");
const library_gateway_1 = require("../notifications/library.gateway");
const FINE_RATE_PER_DAY = 5; // S/ 5.00 per day
const IN_LIBRARY_MAX_DAYS = 1;
const HOME_MAX_DAYS_STUDENT = 7;
const HOME_MAX_DAYS_TEACHER = 14;
let LoansService = class LoansService {
    constructor(prisma, libraryGateway) {
        this.prisma = prisma;
        this.libraryGateway = libraryGateway;
        // In-memory store for pending pickup data (keyed by qrToken, TTL ~20 min)
        this.pendingPickupStore = new Map();
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.lending.findMany({
                orderBy: { lendingDate: 'desc' },
                include: {
                    copy: { include: { book: { include: { authors: { include: { author: true } } } } } },
                    borrower: { include: { userData: true, student: true, teacher: true } },
                    librarian: { include: { userData: true } },
                    policy: true,
                    fine: true,
                },
            });
        });
    }
    getMyLoans(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.lending.findMany({
                where: { borrowerUserId: userId },
                orderBy: { lendingDate: 'desc' },
                include: {
                    copy: { include: { book: { include: { authors: { include: { author: true } } } } } },
                    policy: true,
                    fine: true,
                },
            });
        });
    }
    getActiveOverdueLoans() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            return this.prisma.lending.findMany({
                where: {
                    status: { in: ['IN_PROGRESS', 'OVERDUE'] },
                    expectedReturnDate: { lt: now },
                },
                include: {
                    copy: { include: { book: true } },
                    borrower: { include: { userData: true, student: true, teacher: true } },
                    fine: true,
                },
            });
        });
    }
    /**
     * STEP 1 (Librarian): Validate QR token from reservation, register cash deposit, create lending.
     */
    confirmPickup(librarianUserId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const reservation = yield this.prisma.reservation.findUnique({
                where: { reservationId: dto.reservationId },
                include: {
                    copy: { include: { book: true } },
                    user: { include: { userData: true } },
                },
            });
            if (!reservation)
                throw new common_1.NotFoundException('Reserva no encontrada');
            if (reservation.status !== 'PENDING') {
                throw new common_1.BadRequestException(`La reserva ya fue procesada (estado: ${reservation.status})`);
            }
            if (reservation.expiresAt < new Date()) {
                // Expire it
                yield this.prisma.reservation.update({
                    where: { reservationId: dto.reservationId },
                    data: { status: 'EXPIRED' },
                });
                yield this.prisma.copy.update({
                    where: { copyId: reservation.copyId },
                    data: { status: 'AVAILABLE' },
                });
                this.libraryGateway.emitUpdate('library-updated');
                this.libraryGateway.emitUpdate('reservation-expired', {
                    reservationId: dto.reservationId
                });
                throw new common_1.BadRequestException('La reserva ha expirado. El usuario debe realizar una nueva reserva.');
            }
            const book = (_a = reservation === null || reservation === void 0 ? void 0 : reservation.copy) === null || _a === void 0 ? void 0 : _a.book;
            if (!book)
                throw new common_1.BadRequestException('Error al cargar la información del libro.');
            if (!book.price || Number(book.price) === 0) {
                throw new common_1.BadRequestException('El libro no tiene precio configurado. Por favor actualiza el precio antes de procesar el préstamo.');
            }
            const expectedDeposit = Number(book.price) * 2;
            if (dto.depositAmountPaid < expectedDeposit) {
                throw new common_1.BadRequestException(`El depósito recibido (S/ ${dto.depositAmountPaid}) es menor al requerido (S/ ${expectedDeposit}).`);
            }
            // Determine lending policy
            const userRole = (_b = reservation.user) === null || _b === void 0 ? void 0 : _b.role;
            if (!userRole)
                throw new common_1.BadRequestException('El usuario no tiene un rol definido.');
            const isTeacher = userRole === 'TEACHER';
            const maxDays = reservation.lendingType === 'IN_LIBRARY'
                ? IN_LIBRARY_MAX_DAYS
                : isTeacher ? HOME_MAX_DAYS_TEACHER : HOME_MAX_DAYS_STUDENT;
            // Use user-requested return date if present, otherwise default to policy max
            let expectedReturnDate = null;
            if (reservation.lendingType === 'HOME') {
                expectedReturnDate = reservation.requestedReturnDate || new Date();
                if (!reservation.requestedReturnDate) {
                    expectedReturnDate.setDate(expectedReturnDate.getDate() + maxDays);
                }
                else {
                    // Security check: ensure user didn't bypass frontend validation
                    const maxAllowedDate = new Date();
                    maxAllowedDate.setDate(maxAllowedDate.getDate() + maxDays);
                    maxAllowedDate.setHours(23, 59, 59, 999);
                    if (expectedReturnDate > maxAllowedDate) {
                        expectedReturnDate = maxAllowedDate;
                    }
                }
            }
            // Find or create policy
            let policy = yield this.prisma.lendingPolicy.findFirst({
                where: {
                    type: reservation.lendingType,
                    userType: { name: userRole },
                },
            });
            if (!policy) {
                // Create UserType if needed
                let userType = yield this.prisma.userType.findUnique({ where: { name: userRole } });
                if (!userType) {
                    userType = yield this.prisma.userType.create({ data: { name: userRole } });
                }
                policy = yield this.prisma.lendingPolicy.create({
                    data: {
                        userTypeId: userType.userTypeId,
                        type: reservation.lendingType,
                        maxDays,
                        maxItems: isTeacher ? 8 : 4,
                    },
                });
            }
            // Generate QR token for pickup scan (user scans this to confirm receipt and CREATE the lending)
            const qrToken = Math.floor(100000 + Math.random() * 900000).toString();
            const qrPayload = JSON.stringify({
                token: qrToken,
                action: 'CONFIRM_PICKUP',
                reservationId: reservation.reservationId,
                // Store pickup params so scanPickupQr can create the lending
                librarianUserId,
                depositAmountPaid: dto.depositAmountPaid,
                lendingPolicyId: policy.lendingPolicyId,
                expectedReturnDate: expectedReturnDate ? expectedReturnDate.toISOString() : null,
                lendingType: reservation.lendingType,
            });
            const qrImageData = yield qrcode.toDataURL(qrPayload);
            // Save token to reservation (do NOT create lending yet — user must scan first)
            yield this.prisma.reservation.update({
                where: { reservationId: dto.reservationId },
                data: { qrToken, qrImageData },
            });
            // Store pickup context in memory (TTL: exactly until reservation expires)
            const tokenExpiresAt = reservation.expiresAt;
            this.pendingPickupStore.set(qrToken, {
                librarianUserId,
                depositAmountPaid: dto.depositAmountPaid,
                policyId: policy.lendingPolicyId,
                expiresAt: tokenExpiresAt,
            });
            return {
                qrImageData,
                qrToken,
                tokenExpiresAt,
                message: 'Token generado. El usuario tiene hasta la expiración de la reserva para escanear el código QR.',
            };
        });
    }
    /**
     * STEP 1b (Student/Teacher): Scan or type the pickup token — THIS creates the Lending.
     */
    scanPickupQr(userId, qrToken, reservationId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Look up the reservation by qrToken (and optionally reservationId for strict matching)
            const reservation = yield this.prisma.reservation.findFirst({
                where: Object.assign({ qrToken, status: 'PENDING' }, (reservationId ? { reservationId } : {})),
                include: {
                    copy: { include: { book: true } },
                    user: { include: { userData: true } },
                },
            });
            if (!reservation) {
                if (reservationId) {
                    throw new common_1.NotFoundException('El código QR o token no corresponde a esta reserva específica.');
                }
                throw new common_1.NotFoundException('Código QR inválido, ya utilizado o reserva no encontrada.');
            }
            if (reservation.userId !== userId) {
                throw new common_1.ForbiddenException('Este código QR no corresponde a tu reserva.');
            }
            if (reservation.expiresAt < new Date()) {
                throw new common_1.BadRequestException('La reserva ha expirado. Solicita una nueva al bibliotecario.');
            }
            // Determine lending policy
            const userRole = reservation.user.role;
            const isTeacher = userRole === 'TEACHER';
            const maxDays = reservation.lendingType === 'IN_LIBRARY'
                ? IN_LIBRARY_MAX_DAYS
                : isTeacher ? HOME_MAX_DAYS_TEACHER : HOME_MAX_DAYS_STUDENT;
            // Use user-requested return date if present, otherwise default to policy max
            let expectedReturnDate = null;
            if (reservation.lendingType === 'HOME') {
                if (reservation.requestedReturnDate) {
                    expectedReturnDate = new Date(reservation.requestedReturnDate);
                    // Security cap: don't exceed maxDays from now
                    const maxAllowedDate = new Date();
                    maxAllowedDate.setDate(maxAllowedDate.getDate() + maxDays);
                    maxAllowedDate.setHours(23, 59, 59, 999);
                    if (expectedReturnDate > maxAllowedDate) {
                        expectedReturnDate = maxAllowedDate;
                    }
                }
                else {
                    expectedReturnDate = new Date();
                    expectedReturnDate.setDate(expectedReturnDate.getDate() + maxDays);
                }
            }
            // Find or create policy
            let policy = yield this.prisma.lendingPolicy.findFirst({
                where: { type: reservation.lendingType, userType: { name: userRole } },
            });
            if (!policy) {
                let userType = yield this.prisma.userType.findUnique({ where: { name: userRole } });
                if (!userType) {
                    userType = yield this.prisma.userType.create({ data: { name: userRole } });
                }
                policy = yield this.prisma.lendingPolicy.create({
                    data: {
                        userTypeId: userType.userTypeId,
                        type: reservation.lendingType,
                        maxDays,
                        maxItems: isTeacher ? 8 : 4,
                    },
                });
            }
            // Look up pickup context from in-memory store (set by librarian in confirmPickup)
            const pickupCtx = this.pendingPickupStore.get(qrToken);
            let librarianUserId;
            let depositAmount = 0;
            let resolvedPolicyId = policy.lendingPolicyId;
            if (pickupCtx && pickupCtx.expiresAt > new Date()) {
                librarianUserId = pickupCtx.librarianUserId;
                depositAmount = pickupCtx.depositAmountPaid;
                resolvedPolicyId = pickupCtx.policyId;
                this.pendingPickupStore.delete(qrToken); // consume it
            }
            else {
                // Fallback: use first available librarian (edge case when server restarts)
                const librarianRecord = yield this.prisma.librarian.findFirst();
                if (!librarianRecord)
                    throw new common_1.BadRequestException('No se encontró un bibliotecario en el sistema.');
                librarianUserId = librarianRecord.userId;
            }
            const lending = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Mark reservation as completed
                yield tx.reservation.update({
                    where: { reservationId: reservation.reservationId },
                    data: {
                        status: 'COMPLETED',
                        qrToken: null // Clear token after successful pickup
                    },
                });
                // Mark copy as BORROWED
                yield tx.copy.update({
                    where: { copyId: reservation.copyId },
                    data: { status: 'BORROWED' },
                });
                // Create lending NOW
                const newLending = yield tx.lending.create({
                    data: {
                        copyId: reservation.copyId,
                        librarianUserId,
                        borrowerUserId: reservation.userId,
                        lendingPolicyId: resolvedPolicyId,
                        lendingType: reservation.lendingType,
                        status: 'IN_PROGRESS',
                        expectedReturnDate,
                        depositAmount: new library_1.Decimal(depositAmount),
                        refundStatus: 'PENDING',
                        isQrScannedPickup: true,
                    },
                    include: {
                        copy: { include: { book: true } },
                        borrower: { include: { userData: true } },
                    },
                });
                return newLending;
            }));
            this.libraryGateway.emitUpdate('library-updated');
            this.libraryGateway.emitUpdate('pickup-confirmed', {
                lendingId: lending.lendingId,
                reservationId: reservation.reservationId
            });
            return {
                message: lending.expectedReturnDate
                    ? `¡Préstamo confirmado! Debes devolver "${lending.copy.book.title}" antes del ${lending.expectedReturnDate.toLocaleDateString('es-PE')}.`
                    : `¡Préstamo confirmado! Disfruta de "${lending.copy.book.title}" en sala.`,
                lending,
            };
        });
    }
    /**
     * STEP 2 (Librarian): Initiate return process — student arrives, librarian generates return QR.
     */
    initiateReturn(librarianUserId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const lending = yield this.prisma.lending.findUnique({
                where: { lendingId: dto.lendingId },
                include: {
                    copy: { include: { book: true } },
                    borrower: { include: { userData: true } },
                    fine: true,
                },
            });
            if (!lending)
                throw new common_1.NotFoundException('Préstamo no encontrado');
            if (lending.status !== 'IN_PROGRESS' && lending.status !== 'OVERDUE') {
                throw new common_1.BadRequestException(`El préstamo no está activo (estado: ${lending.status})`);
            }
            // Generate return QR (expires in 30 minutes)
            const returnQrToken = Math.floor(100000 + Math.random() * 900000).toString();
            const returnQrExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
            const qrPayload = JSON.stringify({
                token: returnQrToken,
                action: 'CONFIRM_RETURN',
                lendingId: lending.lendingId,
            });
            const returnQrImageData = yield qrcode.toDataURL(qrPayload);
            yield this.prisma.lending.update({
                where: { lendingId: dto.lendingId },
                data: {
                    returnQrToken,
                    returnQrImageData,
                    returnQrExpiresAt,
                },
            });
            this.libraryGateway.emitUpdate('library-updated');
            const daysOverdue = lending.daysOverdue;
            const fine = lending.fine;
            return {
                returnQrImageData,
                returnQrToken,
                returnQrExpiresAt,
                daysOverdue,
                totalFineAmount: (_a = fine === null || fine === void 0 ? void 0 : fine.accumulatedAmount) !== null && _a !== void 0 ? _a : 0,
                depositAmount: lending.depositAmount,
                message: 'Código QR de devolución generado. El usuario debe escanearlo para completar la devolución.',
            };
        });
    }
    /**
     * STEP 3 (Student): Scan return QR — completes the return and processes refund/fines.
     * For returns after 9 days, this is done manually by librarian via confirmManualReturn.
     */
    confirmReturn(userId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let lending = null;
            if (dto.lendingId) {
                // Lookup by lendingId — verify provided token matches
                lending = yield this.prisma.lending.findUnique({
                    where: { lendingId: dto.lendingId },
                    include: {
                        copy: { include: { book: true } },
                        fine: true,
                        borrower: { include: { userData: true, student: true, teacher: true } },
                    },
                });
            }
            else if (dto.returnQrToken) {
                // Lookup directly by token (QR scan or manual entry without lendingId)
                lending = yield this.prisma.lending.findUnique({
                    where: { returnQrToken: dto.returnQrToken },
                    include: {
                        copy: { include: { book: true } },
                        fine: true,
                        borrower: { include: { userData: true, student: true, teacher: true } },
                    },
                });
            }
            if (!lending) {
                throw new common_1.NotFoundException('Préstamo no encontrado. Verifica que el token sea correcto.');
            }
            if (lending.borrowerUserId !== userId) {
                throw new common_1.ForbiddenException('Este préstamo no te pertenece.');
            }
            if (lending.status !== 'IN_PROGRESS' && lending.status !== 'OVERDUE') {
                throw new common_1.BadRequestException('El préstamo ya fue cerrado.');
            }
            if (lending.returnQrExpiresAt) {
                const now = new Date();
                if (lending.returnQrExpiresAt < now) {
                    throw new common_1.BadRequestException(`El código de devolución ha expirado. Expiró: ${lending.returnQrExpiresAt.toLocaleTimeString()}, Hora servidor: ${now.toLocaleTimeString()}. Solicita uno nuevo.`);
                }
            }
            // If searched by lendingId, verify the token matches
            if (dto.lendingId && dto.returnQrToken && lending.returnQrToken !== dto.returnQrToken) {
                throw new common_1.BadRequestException('El código ingresado no coincide con el generado para este libro.');
            }
            // Recalculate daysOverdue from actual dates (DB value may be stale)
            const now = new Date();
            let realDaysOverdue = 0;
            if (lending.expectedReturnDate) {
                const expectedReturn = new Date(lending.expectedReturnDate);
                realDaysOverdue = Math.max(0, Math.floor((now.getTime() - expectedReturn.getTime()) / (1000 * 60 * 60 * 24)));
            }
            if (realDaysOverdue >= 9) {
                throw new common_1.ForbiddenException('Tu retraso supera los 9 días. No puedes devolver por QR. Acércate al mostrador con el bibliotecario.');
            }
            const isLate = realDaysOverdue > 0;
            const bookLost = (_a = dto.bookLost) !== null && _a !== void 0 ? _a : false;
            // Calculate refund
            const shouldRefund = !bookLost;
            const returnStatus = isLate ? 'RETURNED_LATE' : 'RETURNED_ON_TIME';
            yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                // Update lending status
                yield tx.lending.update({
                    where: { lendingId: lending.lendingId },
                    data: {
                        status: returnStatus,
                        actualReturnDate: now,
                        isQrScannedReturn: true,
                        returnedBookLost: bookLost,
                        refundStatus: shouldRefund ? 'REFUNDED' : 'FORFEITED',
                        returnQrToken: null,
                        returnQrImageData: null,
                    },
                });
                // Update copy status
                yield tx.copy.update({
                    where: { copyId: lending.copyId },
                    data: { status: bookLost ? 'LOST' : 'AVAILABLE' },
                });
                // Mark fine as PAID (assuming payment at counter) if any
                if (lending.fine && lending.fine.status === 'PENDING') {
                    yield tx.fine.update({
                        where: { fineId: lending.fine.fineId },
                        data: {
                            status: 'PAID',
                            paymentDate: now,
                            paymentMethod: 'CASH'
                        },
                    });
                }
                // Update student/teacher consecutive returns
                const isStudent = lending.borrower.role === 'STUDENT';
                const isTeacher = lending.borrower.role === 'TEACHER';
                if (!isLate) {
                    // On-time return — increment counter and possibly reduce penalties
                    if (isStudent && lending.borrower.student) {
                        const student = lending.borrower.student;
                        const newCount = ((_a = student.consecutiveOnTimeReturns) !== null && _a !== void 0 ? _a : 0) + 1;
                        yield tx.student.update({
                            where: { userId: lending.borrowerUserId },
                            data: { consecutiveOnTimeReturns: newCount, onTimeDeliveriesCount: { increment: 1 } },
                        });
                        // Reduce mild penalty if 3 consecutive on-time
                        if (newCount % 3 === 0) {
                            yield this.reducePenalty(tx, lending.borrowerUserId, 'MILD');
                        }
                        // Reduce severe if 5 consecutive
                        if (newCount % 5 === 0) {
                            yield this.reducePenalty(tx, lending.borrowerUserId, 'SEVERE');
                        }
                        // Reduce very severe if 7 consecutive
                        if (newCount % 7 === 0) {
                            yield this.reducePenalty(tx, lending.borrowerUserId, 'VERY_SEVERE');
                        }
                    }
                    else if (isTeacher) {
                        const teacher = lending.borrower.teacher;
                        const newCount = ((_b = teacher.consecutiveOnTimeReturns) !== null && _b !== void 0 ? _b : 0) + 1;
                        yield tx.teacher.update({
                            where: { userId: lending.borrowerUserId },
                            data: { consecutiveOnTimeReturns: newCount },
                        });
                        // Teachers: reduce mild on 4, severe on 6, very severe on 10
                        if (newCount % 4 === 0)
                            yield this.reducePenalty(tx, lending.borrowerUserId, 'MILD');
                        if (newCount % 6 === 0)
                            yield this.reducePenalty(tx, lending.borrowerUserId, 'SEVERE');
                        if (newCount % 10 === 0)
                            yield this.reducePenalty(tx, lending.borrowerUserId, 'VERY_SEVERE');
                    }
                }
                else {
                    // Late return — reset consecutive counter
                    if (isStudent) {
                        yield tx.student.update({
                            where: { userId: lending.borrowerUserId },
                            data: { consecutiveOnTimeReturns: 0 },
                        });
                    }
                    else if (isTeacher) {
                        yield tx.teacher.update({
                            where: { userId: lending.borrowerUserId },
                            data: { consecutiveOnTimeReturns: 0 },
                        });
                    }
                    // Apply final penalties based on days overdue and check for blocks
                    yield this.applyFinalPenaltiesAndBlocks(tx, lending.borrowerUserId, realDaysOverdue);
                }
                // Remove academic restriction if no more ACTIVE MILD+ penalties
                const remainingActivePenalties = yield tx.penalty.count({
                    where: { userId: lending.borrowerUserId, status: 'ACTIVE' },
                });
                if (remainingActivePenalties === 0) {
                    yield this.clearAcademicRestriction(tx, lending.borrowerUserId, lending.borrower.role);
                }
            }));
            this.libraryGateway.emitUpdate('library-updated');
            this.libraryGateway.emitUpdate('return-confirmed', {
                lendingId: lending.lendingId,
                copyId: lending.copyId
            });
            return {
                message: bookLost
                    ? `Devolución registrada. El libro se marcó como perdido. Has perdido el depósito de S/ ${lending.depositAmount}.`
                    : isLate
                        ? `Devolución tardía registrada. Has pagado las multas. ${shouldRefund ? `Tu depósito de S/ ${lending.depositAmount} será reembolsado.` : ''}`
                        : `¡Devolución exitosa y a tiempo! Tu depósito de S/ ${lending.depositAmount} será reembolsado.`,
                returnStatus,
                refund: shouldRefund ? lending.depositAmount : 0,
            };
        });
    }
    /**
     * Manual return for overdue 9+ days (done by librarian on behalf of user).
     */
    confirmManualReturn(librarianUserId, lendingId, bookLost) {
        return __awaiter(this, void 0, void 0, function* () {
            const lending = yield this.prisma.lending.findUnique({
                where: { lendingId },
                include: {
                    copy: { include: { book: true } },
                    borrower: { include: { userData: true, student: true, teacher: true } },
                    fine: true,
                },
            });
            if (!lending)
                throw new common_1.NotFoundException('Préstamo no encontrado');
            if (lending.status !== 'IN_PROGRESS' && lending.status !== 'OVERDUE') {
                throw new common_1.BadRequestException('El préstamo ya fue cerrado.');
            }
            const now = new Date();
            const shouldRefund = !bookLost;
            yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.lending.update({
                    where: { lendingId },
                    data: {
                        status: 'RETURNED_LATE',
                        actualReturnDate: now,
                        returnedBookLost: bookLost,
                        refundStatus: shouldRefund ? 'REFUNDED' : 'FORFEITED',
                    },
                });
                yield tx.copy.update({
                    where: { copyId: lending.copyId },
                    data: { status: bookLost ? 'LOST' : 'AVAILABLE' },
                });
                if (lending.fine && lending.fine.status === 'PENDING') {
                    yield tx.fine.update({
                        where: { fineId: lending.fine.fineId },
                        data: { status: 'PAID', paymentDate: now, paymentMethod: 'CASH' },
                    });
                }
                // Apply final penalties
                yield this.applyFinalPenaltiesAndBlocks(tx, lending.borrowerUserId, lending.daysOverdue);
                // Reset consecutive counter
                if (lending.borrower.role === 'STUDENT') {
                    yield tx.student.update({
                        where: { userId: lending.borrowerUserId },
                        data: { consecutiveOnTimeReturns: 0 },
                    });
                }
                else if (lending.borrower.role === 'TEACHER') {
                    yield tx.teacher.update({
                        where: { userId: lending.borrowerUserId },
                        data: { consecutiveOnTimeReturns: 0 },
                    });
                }
            }));
            this.libraryGateway.emitUpdate('library-updated');
            this.libraryGateway.emitUpdate('return-confirmed', {
                lendingId: lending.lendingId,
                copyId: lending.copyId
            });
            return { message: 'Devolución manual registrada exitosamente.' };
        });
    }
    /**
     * Manual lend for direct librarian-driven loans.
     */
    manualLend(librarianUserId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const copy = yield this.prisma.copy.findUnique({
                where: { copyId: dto.copyId },
                include: { book: true },
            });
            if (!copy)
                throw new common_1.NotFoundException('Ejemplar no encontrado');
            if (copy.status !== 'AVAILABLE') {
                throw new common_1.BadRequestException('El ejemplar no está disponible para préstamo.');
            }
            const borrower = yield this.prisma.user.findUnique({
                where: { userId: dto.borrowerUserId },
                include: { userData: true },
            });
            if (!borrower)
                throw new common_1.NotFoundException('Usuario de destino no encontrado');
            const lending = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Mark copy as BORROWED
                yield tx.copy.update({
                    where: { copyId: dto.copyId },
                    data: { status: 'BORROWED' },
                });
                // Find or create policy if needed (simplifying here to use existing policy logic or default)
                let policy = yield tx.lendingPolicy.findFirst({
                    where: { type: dto.lendingType, userType: { name: borrower.role } },
                });
                if (!policy) {
                    throw new common_1.BadRequestException('No se encontró una política de préstamo válida para esta operación.');
                }
                // Create lending
                return tx.lending.create({
                    data: {
                        copyId: dto.copyId,
                        librarianUserId,
                        borrowerUserId: dto.borrowerUserId,
                        lendingPolicyId: policy.lendingPolicyId,
                        lendingType: dto.lendingType,
                        status: 'IN_PROGRESS',
                        expectedReturnDate: dto.lendingType === 'HOME' ? new Date(dto.expectedReturnDate) : null,
                        depositAmount: new library_1.Decimal(0), // Manual librarian loans typically handle cash outside or use 0
                        refundStatus: 'PENDING',
                    },
                    include: {
                        copy: { include: { book: true } },
                        borrower: { include: { userData: true } },
                    },
                });
            }));
            this.libraryGateway.emitUpdate('library-updated');
            return {
                message: `Préstamo manual realizado con éxito para "${lending.copy.book.title}".`,
                lending,
            };
        });
    }
    // ─── Private helpers ──────────────────────────────────────────────
    reducePenalty(tx, userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const activePenalty = yield tx.penalty.findFirst({
                where: { userId, type, status: 'ACTIVE' },
                orderBy: { applicationDate: 'asc' },
            });
            if (activePenalty) {
                yield tx.penalty.update({
                    where: { penaltyId: activePenalty.penaltyId },
                    data: { status: 'CANCELED' },
                });
            }
        });
    }
    applyFinalPenaltiesAndBlocks(tx, userId, daysOverdue) {
        return __awaiter(this, void 0, void 0, function* () {
            const penaltiesToCreate = [];
            if (daysOverdue >= 1) {
                penaltiesToCreate.push({ userId, type: 'MILD', daysBlock: 3, quantity: 1, status: 'ACTIVE' });
            }
            if (daysOverdue >= 3) {
                penaltiesToCreate.push({ userId, type: 'SEVERE', daysBlock: 5, quantity: 1, status: 'ACTIVE' });
            }
            if (daysOverdue >= 9) {
                penaltiesToCreate.push({ userId, type: 'VERY_SEVERE', daysBlock: 7, quantity: 1, status: 'ACTIVE' });
            }
            if (penaltiesToCreate.length > 0) {
                yield tx.penalty.createMany({ data: penaltiesToCreate });
            }
            // Check for block thresholds
            const mildCount = yield tx.penalty.count({ where: { userId, type: 'MILD', status: 'ACTIVE' } });
            const severeCount = yield tx.penalty.count({ where: { userId, type: 'SEVERE', status: 'ACTIVE' } });
            const verySeCount = yield tx.penalty.count({ where: { userId, type: 'VERY_SEVERE', status: 'ACTIVE' } });
            let totalBlockDays = 0;
            if (mildCount >= 3)
                totalBlockDays += Math.floor(mildCount / 3) * 3;
            if (severeCount >= 2)
                totalBlockDays += Math.floor(severeCount / 2) * 5;
            if (verySeCount >= 1)
                totalBlockDays += verySeCount * 7;
            if (totalBlockDays > 0) {
                const endDate = new Date(Date.now() + totalBlockDays * 24 * 60 * 60 * 1000);
                yield tx.userBlock.create({
                    data: {
                        userId,
                        blockType: 'TEMPORARY',
                        startDate: new Date(),
                        endDate,
                        reason: `Bloqueo por acumulación de sanciones (${mildCount} leves, ${severeCount} graves, ${verySeCount} muy graves). Total: ${totalBlockDays} días.`,
                    },
                });
            }
        });
    }
    clearAcademicRestriction(tx, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (role === 'STUDENT') {
                yield tx.student.update({
                    where: { userId },
                    data: { isAcademicRestricted: false },
                });
            }
            else if (role === 'TEACHER') {
                yield tx.teacher.update({
                    where: { userId },
                    data: { isAcademicRestricted: false },
                });
            }
        });
    }
};
exports.LoansService = LoansService;
exports.LoansService = LoansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        library_gateway_1.LibraryGateway])
], LoansService);
