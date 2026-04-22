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
var SanctionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const date_fns_1 = require("date-fns");
const FINE_RATE_PER_DAY = 5; // S/ 5.00 per day overdue
let SanctionsService = SanctionsService_1 = class SanctionsService {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.logger = new common_1.Logger(SanctionsService_1.name);
    }
    /**
     * Runs every day at midnight to process overdue loans.
     * - Accumulates fines per day
     * - Applies academic restrictions from day 2
     * - Adds penalty records for days 1, 3, 9
     */
    processOverdueLoans() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log('[SANCTIONS CRON] Running daily overdue loan processor...');
            const now = new Date();
            const overdueLoans = yield this.prisma.lending.findMany({
                where: {
                    status: { in: ['IN_PROGRESS', 'OVERDUE'] },
                    expectedReturnDate: { lt: now, not: null },
                    isQrScannedPickup: true, // Only process confirmed pickups
                },
                include: {
                    copy: { include: { book: true } },
                    borrower: {
                        include: {
                            userData: true,
                            student: true,
                            teacher: true,
                        },
                    },
                    fine: true,
                },
            });
            this.logger.log(`[SANCTIONS CRON] Found ${overdueLoans.length} overdue loans.`);
            for (const lending of overdueLoans) {
                try {
                    if (!lending.expectedReturnDate)
                        continue;
                    const daysOverdue = (0, date_fns_1.differenceInDays)(now, lending.expectedReturnDate);
                    const totalFine = daysOverdue * FINE_RATE_PER_DAY;
                    yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                        // Update lending overdue days
                        yield tx.lending.update({
                            where: { lendingId: lending.lendingId },
                            data: {
                                status: 'OVERDUE',
                                daysOverdue,
                                totalFineAmount: totalFine,
                            },
                        });
                        // Create or update fine
                        if (!lending.fine) {
                            yield tx.fine.create({
                                data: {
                                    userId: lending.borrowerUserId,
                                    lendingId: lending.lendingId,
                                    initialAmount: FINE_RATE_PER_DAY,
                                    accumulatedAmount: totalFine,
                                    isTemporary: daysOverdue === 1,
                                    expiresAt: daysOverdue === 1
                                        ? new Date(Date.now() + 24 * 60 * 60 * 1000)
                                        : null,
                                    status: 'PENDING',
                                },
                            });
                        }
                        else {
                            yield tx.fine.update({
                                where: { fineId: lending.fine.fineId },
                                data: {
                                    accumulatedAmount: totalFine,
                                    isTemporary: daysOverdue === 1,
                                    expiresAt: daysOverdue === 1
                                        ? new Date(lending.expectedReturnDate.getTime() + 48 * 60 * 60 * 1000)
                                        : null,
                                },
                            });
                        }
                        // Day 1: Add mild penalty + block lending
                        if (daysOverdue === 1) {
                            const existingMild = yield tx.penalty.findFirst({
                                where: { userId: lending.borrowerUserId, type: 'MILD', status: 'ACTIVE', lendingId: lending.lendingId },
                            });
                            if (!existingMild) {
                                yield tx.penalty.create({
                                    data: {
                                        userId: lending.borrowerUserId,
                                        lendingId: lending.lendingId,
                                        type: 'MILD',
                                        daysBlock: 3,
                                        status: 'ACTIVE',
                                    },
                                });
                            }
                        }
                        // Day 3: Add severe penalty + academic restriction
                        if (daysOverdue >= 3) {
                            const existingSevere = yield tx.penalty.findFirst({
                                where: { userId: lending.borrowerUserId, type: 'SEVERE', status: 'ACTIVE', lendingId: lending.lendingId },
                            });
                            if (!existingSevere) {
                                yield tx.penalty.create({
                                    data: {
                                        userId: lending.borrowerUserId,
                                        lendingId: lending.lendingId,
                                        type: 'SEVERE',
                                        daysBlock: 5,
                                        status: 'ACTIVE',
                                    },
                                });
                            }
                        }
                        // Day 9: Add very severe penalty
                        if (daysOverdue >= 9) {
                            const existingVerySevere = yield tx.penalty.findFirst({
                                where: { userId: lending.borrowerUserId, type: 'VERY_SEVERE', status: 'ACTIVE', lendingId: lending.lendingId },
                            });
                            if (!existingVerySevere) {
                                yield tx.penalty.create({
                                    data: {
                                        userId: lending.borrowerUserId,
                                        lendingId: lending.lendingId,
                                        type: 'VERY_SEVERE',
                                        daysBlock: 7,
                                        status: 'ACTIVE',
                                    },
                                });
                            }
                        }
                        // Day 2+: Apply academic restriction
                        if (daysOverdue >= 2) {
                            if (lending.borrower.role === 'STUDENT') {
                                yield tx.student.update({
                                    where: { userId: lending.borrowerUserId },
                                    data: { isAcademicRestricted: true },
                                });
                            }
                            else if (lending.borrower.role === 'TEACHER') {
                                yield tx.teacher.update({
                                    where: { userId: lending.borrowerUserId },
                                    data: { isAcademicRestricted: true },
                                });
                            }
                        }
                    }));
                    // Send notification emails
                    const email = lending.borrower.userData.email;
                    if (email) {
                        const bookTitle = lending.copy.book.title;
                        if (daysOverdue === 1) {
                            yield this.notifications.sendOverdueDay1(email, bookTitle, totalFine);
                        }
                        else if (daysOverdue === 3) {
                            yield this.notifications.sendOverdayDay3(email, bookTitle, totalFine);
                        }
                        else if (daysOverdue === 9) {
                            yield this.notifications.sendOverdueDay9(email, bookTitle, totalFine);
                        }
                    }
                }
                catch (err) {
                    this.logger.error(`[SANCTIONS CRON] Error processing lending ${lending.lendingId}: ${err.message}`);
                }
            }
            this.logger.log('[SANCTIONS CRON] Done processing overdue loans.');
        });
    }
    /**
     * Runs every day at 9 AM — send reminders to users who must return a book today or tomorrow.
     */
    sendReturnReminders() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log('[REMINDERS CRON] Sending return-due reminders...');
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);
            const dueSoon = yield this.prisma.lending.findMany({
                where: {
                    status: 'IN_PROGRESS',
                    expectedReturnDate: { lte: tomorrow, gt: new Date(), not: null },
                    isQrScannedPickup: true,
                },
                include: {
                    copy: { include: { book: true } },
                    borrower: { include: { userData: true } },
                },
            });
            for (const lending of dueSoon) {
                const email = lending.borrower.userData.email;
                if (email && lending.expectedReturnDate) {
                    yield this.notifications.sendReturnReminder(email, lending.copy.book.title, lending.expectedReturnDate);
                }
            }
            this.logger.log(`[REMINDERS CRON] Sent ${dueSoon.length} return reminders.`);
        });
    }
    /**
     * Expire day-1 temporary fines if the student returned within 24 hours.
     * (Runs every hour to check.)
     */
    expireTemporaryFines() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const expiredTempFines = yield this.prisma.fine.findMany({
                where: {
                    isTemporary: true,
                    status: 'PENDING',
                    expiresAt: { lt: now },
                },
                include: {
                    lending: { include: { borrower: { include: { student: true, teacher: true } } } },
                },
            });
            for (const fine of expiredTempFines) {
                // The temporary fine on day 1 is cancelled only if the loan was returned
                if (fine.lending.status === 'RETURNED_ON_TIME' || fine.lending.status === 'RETURNED_LATE') {
                    yield this.prisma.fine.update({
                        where: { fineId: fine.fineId },
                        data: { status: 'ANNULLED' },
                    });
                    // Cancel the mild penalty associated with this lending
                    yield this.prisma.penalty.updateMany({
                        where: {
                            userId: fine.userId,
                            lendingId: fine.lendingId,
                            type: 'MILD',
                            status: 'ACTIVE',
                        },
                        data: { status: 'CANCELED' },
                    });
                }
            }
        });
    }
};
exports.SanctionsService = SanctionsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SanctionsService.prototype, "processOverdueLoans", null);
__decorate([
    (0, schedule_1.Cron)('0 9 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SanctionsService.prototype, "sendReturnReminders", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SanctionsService.prototype, "expireTemporaryFines", null);
exports.SanctionsService = SanctionsService = SanctionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], SanctionsService);
