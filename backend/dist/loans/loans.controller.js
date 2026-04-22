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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoansController = void 0;
const common_1 = require("@nestjs/common");
const loans_service_1 = require("./loans.service");
const loans_dto_1 = require("./dto/loans.dto");
const create_manual_loan_dto_1 = require("./dto/create-manual-loan.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let LoansController = class LoansController {
    constructor(loansService) {
        this.loansService = loansService;
    }
    // Librarian/Admin: Get all loans
    getAll() {
        return this.loansService.getAll();
    }
    // Student/Teacher: Get my loans
    getMyLoans(req) {
        return this.loansService.getMyLoans(req.user.userId);
    }
    // Librarian: Confirm pickup after deposit (Step 1 — creates lending + returns QR)
    confirmPickup(req, dto) {
        return this.loansService.confirmPickup(req.user.userId, dto);
    }
    // Student: Scan pickup QR to confirm receipt (Step 1b)
    scanPickupQr(req, token) {
        return this.loansService.scanPickupQr(req.user.userId, token);
    }
    // Librarian: Generate return QR when student arrives (Step 2)
    initiateReturn(req, dto) {
        return this.loansService.initiateReturn(req.user.userId, dto);
    }
    // Student: Scan return QR (Step 3)
    confirmReturn(req, dto) {
        return this.loansService.confirmReturn(req.user.userId, dto);
    }
    // Librarian: Manual return for 9+ day overdue
    manualReturn(req, id, bookLost) {
        return this.loansService.confirmManualReturn(req.user.userId, id, bookLost !== null && bookLost !== void 0 ? bookLost : false);
    }
    // Librarian: Direct manual loan (bypasses reservations)
    manualLend(req, dto) {
        return this.loansService.manualLend(req.user.userId, dto);
    }
};
exports.LoansController = LoansController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LIBRARIAN, client_1.UserRole.ADMINISTRATOR),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT, client_1.UserRole.TEACHER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "getMyLoans", null);
__decorate([
    (0, common_1.Post)('confirm-pickup'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LIBRARIAN, client_1.UserRole.ADMINISTRATOR),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, loans_dto_1.ConfirmPickupDto]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "confirmPickup", null);
__decorate([
    (0, common_1.Post)('scan-pickup/:token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT, client_1.UserRole.TEACHER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "scanPickupQr", null);
__decorate([
    (0, common_1.Post)('initiate-return'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LIBRARIAN, client_1.UserRole.ADMINISTRATOR),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, loans_dto_1.InitiateReturnDto]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "initiateReturn", null);
__decorate([
    (0, common_1.Post)('confirm-return'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT, client_1.UserRole.TEACHER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, loans_dto_1.ConfirmReturnDto]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "confirmReturn", null);
__decorate([
    (0, common_1.Post)(':id/manual-return'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LIBRARIAN, client_1.UserRole.ADMINISTRATOR),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('bookLost')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "manualReturn", null);
__decorate([
    (0, common_1.Post)('manual'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.LIBRARIAN, client_1.UserRole.ADMINISTRATOR),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_manual_loan_dto_1.CreateManualLoanDto]),
    __metadata("design:returntype", void 0)
], LoansController.prototype, "manualLend", null);
exports.LoansController = LoansController = __decorate([
    (0, common_1.Controller)('loans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [loans_service_1.LoansService])
], LoansController);
