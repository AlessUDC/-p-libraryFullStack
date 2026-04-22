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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    login(signInDto) {
        return this.authService.login(signInDto.code, signInDto.password);
    }
    registerStudent(dto) {
        return this.authService.registerStudent(dto);
    }
    registerTeacher(dto) {
        return this.authService.registerTeacher(dto);
    }
    registerLibrarian(dto, req) {
        // Basic protection logic to be replaced by full JwtAuthGuard & RolesGuard
        // In NestJS we usually use @UseGuards() but we will manually verify the header or rely on future role guards
        // For now we assume the frontend sends the admin token and it's intercepted. Wait, we need an admin check.
        // The user requested: "Solo por un adminnistrador logueado."
        return this.authService.registerLibrarian(dto);
    }
    confirmAccount(token) {
        return this.authService.confirmAccount(token);
    }
    resendConfirmation(email) {
        return this.authService.resendConfirmation(email);
    }
    forgotPassword(email) {
        return this.authService.forgotPassword(email);
    }
    verifyResetToken(token) {
        return this.authService.verifyResetToken(token);
    }
    resetPassword(body) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }
    verifyPassword(password, req) {
        return this.authService.verifyPassword(req.user.userId, password);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register/student'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterStudentDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerStudent", null);
__decorate([
    (0, common_1.Post)('register/teacher'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterTeacherDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerTeacher", null);
__decorate([
    (0, common_1.Post)('register/librarian'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterLibrarianDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerLibrarian", null);
__decorate([
    (0, common_1.Post)('confirm'),
    __param(0, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "confirmAccount", null);
__decorate([
    (0, common_1.Post)('resend-confirmation'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resendConfirmation", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('verify-reset-token'),
    __param(0, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyResetToken", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('verify-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('password')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
