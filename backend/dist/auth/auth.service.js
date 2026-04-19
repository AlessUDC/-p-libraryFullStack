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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const mailer_1 = require("@nestjs-modules/mailer");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(prisma, mailerService, jwtService) {
        this.prisma = prisma;
        this.mailerService = mailerService;
        this.jwtService = jwtService;
    }
    login(code, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: { code },
                include: { userData: true },
            });
            if (!user)
                throw new common_1.UnauthorizedException('Credenciales inválidas');
            const isMatch = yield bcrypt.compare(pass, user.password);
            if (!isMatch)
                throw new common_1.UnauthorizedException('Credenciales inválidas');
            if (!user.isConfirmed)
                throw new common_1.UnauthorizedException('Cuenta no confirmada. Por favor revisa tu correo electrónico.');
            if (!user.userData.isActive)
                throw new common_1.UnauthorizedException('Cuenta desactivada.');
            // Esta data se muestra al usuario en la UI
            const profile = {
                firstName: user.userData.firstName,
                paternalLastName: user.userData.paternalLastName,
                maternalLastName: user.userData.maternalLastName,
                documentType: user.userData.documentType,
                documentNumber: user.userData.documentNumber,
                maritalStatus: user.userData.maritalStatus,
                gender: user.userData.gender,
                birthDate: user.userData.birthDate,
                mobilePhone: user.userData.mobilePhone,
                landlinePhone: user.userData.landlinePhone,
                address: user.userData.addressId,
                district: user.userData.districtId,
                code: user.code,
                email: user.userData.email
            };
            const payload = { sub: user.userId, code: user.code, role: user.role };
            const token = this.jwtService.sign(payload);
            return { token, user: { userId: user.userId, role: user.role.toLowerCase(), profile } };
        });
    }
    generateToken() {
        return (0, crypto_1.randomInt)(100000, 999999).toString();
    }
    sendConfirmationEmail(email_1, token_1) {
        return __awaiter(this, arguments, void 0, function* (email, token, isResend = false) {
            const confirmUrl = `http://localhost:5173/auth/confirm${isResend ? '?hideResend=true' : ''}`;
            yield this.mailerService.sendMail({
                to: email,
                subject: 'Confirma tu cuenta en Nexus Biblioteca',
                html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">Bienvenido a Nexus</h2>
          <p>Gracias por registrarte. Para confirmar tu cuenta, ingresa el siguiente código de 6 dígitos en la aplicación:</p>
          <div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
            ${token}
          </div>
          <p style="text-align: center;">O haz clic en el siguiente enlace para ir a la página de confirmación:</p>
          <div style="text-align: center;">
            <a href="${confirmUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirmar mi cuenta</a>
          </div>
          <p style="font-size: 12px; color: #6B7280; margin-top: 30px; text-align: center;">
            Este código expirará pronto. Si no solicitaste este registro, puedes ignorar este correo.
          </p>
        </div>
      `,
            });
        });
    }
    sendPasswordResetEmail(email, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const verifyUrl = `http://localhost:5173/auth/verify-reset-token`;
            yield this.mailerService.sendMail({
                to: email,
                subject: 'Recuperación de Contraseña - Nexus Biblioteca',
                html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">Recuperación de Acceso</h2>
          <p>Has solicitado restablecer tu contraseña. Para continuar, ingresa el siguiente código de 6 dígitos en la aplicación:</p>
          <div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
            ${token}
          </div>
          <p style="text-align: center;">O haz clic en el siguiente botón para ir a la página de verificación:</p>
          <div style="text-align: center;">
            <a href="${verifyUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar Código</a>
          </div>
          <p style="font-size: 12px; color: #6B7280; margin-top: 30px; text-align: center;">
            Este código expirará en 10 minutos. Si no solicitaste este cambio, puedes ignorar este correo.
          </p>
        </div>
      `,
            });
        });
    }
    // Método auxiliar para crear un usuario base
    createBaseUser(dto, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.prisma.user.findUnique({
                where: { code: dto.code }
            });
            if (existingUser)
                throw new common_1.BadRequestException('El código ya está en uso');
            const existingData = yield this.prisma.userData.findFirst({
                where: {
                    OR: [
                        { email: dto.email },
                        { documentNumber: dto.documentNumber }
                    ]
                }
            });
            if (existingData) {
                const field = existingData.email === dto.email ? 'El correo electrónico' : 'El número de documento';
                throw new common_1.BadRequestException(`${field} ya está en uso`);
            }
            // Parse date (supports DD/MM/YYYY or YYYY-MM-DD)
            let parsedBirthDate;
            if (dto.birthdate.includes('/')) {
                const [day, month, year] = dto.birthdate.split('/').map(Number);
                parsedBirthDate = new Date(year, month - 1, day);
            }
            else {
                parsedBirthDate = new Date(dto.birthdate);
            }
            if (parsedBirthDate > new Date()) {
                throw new common_1.BadRequestException('La fecha de nacimiento no puede ser en el futuro');
            }
            const hashedPassword = yield bcrypt.hash(dto.password, 10);
            const confirmToken = this.generateToken();
            const tokenExpires = new Date();
            tokenExpires.setHours(tokenExpires.getHours() + 3);
            return {
                hashedPassword,
                confirmToken,
                tokenExpires,
                birthDate: parsedBirthDate,
                mobilePhone: dto.mobilePhone,
                landlinePhone: dto.landlinePhone,
                address: dto.address,
                districtId: dto.districtId,
                maritalStatus: dto.maritalStatus,
                gender: dto.gender
            };
        });
    }
    registerStudent(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hashedPassword, confirmToken, tokenExpires, birthDate, mobilePhone, landlinePhone, address, districtId, maritalStatus, gender } = yield this.createBaseUser(dto, 'STUDENT');
            const user = yield this.prisma.user.create({
                data: {
                    role: 'STUDENT',
                    code: dto.code,
                    password: hashedPassword,
                    confirmToken,
                    confirmTokenExpires: tokenExpires,
                    userData: {
                        create: {
                            firstName: dto.firstName,
                            paternalLastName: dto.paternalLastName,
                            maternalLastName: dto.maternalLastName,
                            documentType: dto.documentType,
                            documentNumber: dto.documentNumber,
                            email: dto.email,
                            birthDate,
                            mobilePhone,
                            landlinePhone,
                            address,
                            districtId,
                            maritalStatus,
                            gender,
                        }
                    },
                    student: {
                        create: {
                            cycle: dto.cycle,
                            schoolId: dto.schoolId
                        }
                    }
                },
                include: { userData: true }
            });
            try {
                yield this.sendConfirmationEmail(user.userData.email, confirmToken);
            }
            catch (error) {
                console.error('Error sending confirmation email during student registration:', error);
                return {
                    message: 'Registro guardado exitosamente, pero hubo un problema al enviar el correo de confirmación. Por favor contacta al administrador o intenta solicitar un nuevo enlace más tarde.'
                };
            }
            return { message: 'Registro exitoso. Se ha enviado un correo de confirmación.' };
        });
    }
    registerTeacher(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hashedPassword, confirmToken, tokenExpires, birthDate, mobilePhone, landlinePhone, address, districtId, maritalStatus, gender } = yield this.createBaseUser(dto, 'TEACHER');
            const user = yield this.prisma.user.create({
                data: {
                    role: 'TEACHER',
                    code: dto.code,
                    password: hashedPassword,
                    confirmToken,
                    confirmTokenExpires: tokenExpires,
                    userData: {
                        create: {
                            firstName: dto.firstName,
                            paternalLastName: dto.paternalLastName,
                            maternalLastName: dto.maternalLastName,
                            documentType: dto.documentType,
                            documentNumber: dto.documentNumber,
                            email: dto.email,
                            birthDate,
                            mobilePhone,
                            landlinePhone,
                            address,
                            districtId,
                            maritalStatus,
                            gender,
                        }
                    },
                    teacher: {
                        create: {
                            facultyId: dto.facultyId,
                            department: dto.department,
                            specialization: dto.specialization
                        }
                    }
                },
                include: { userData: true }
            });
            try {
                yield this.sendConfirmationEmail(user.userData.email, confirmToken);
            }
            catch (error) {
                console.error('Error sending confirmation email during teacher registration:', error);
                return {
                    message: 'Registro guardado exitosamente, pero hubo un problema al enviar el correo de confirmación. Por favor contacta al administrador o intenta solicitar un nuevo enlace más tarde.'
                };
            }
            return { message: 'Registro exitoso. Se ha enviado un correo de confirmación.' };
        });
    }
    registerLibrarian(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hashedPassword, confirmToken, tokenExpires, birthDate, mobilePhone, landlinePhone, address, districtId, maritalStatus, gender } = yield this.createBaseUser(dto, 'LIBRARIAN');
            const user = yield this.prisma.user.create({
                data: {
                    role: 'LIBRARIAN',
                    code: dto.code,
                    password: hashedPassword,
                    confirmToken,
                    confirmTokenExpires: tokenExpires,
                    userData: {
                        create: {
                            firstName: dto.firstName,
                            paternalLastName: dto.paternalLastName,
                            maternalLastName: dto.maternalLastName,
                            documentType: dto.documentType,
                            documentNumber: dto.documentNumber,
                            email: dto.email,
                            birthDate,
                            mobilePhone,
                            landlinePhone,
                            address,
                            districtId,
                            maritalStatus,
                            gender,
                        }
                    },
                    librarian: {
                        create: { shift: dto.shift }
                    }
                },
                include: { userData: true }
            });
            try {
                yield this.sendConfirmationEmail(user.userData.email, confirmToken);
            }
            catch (error) {
                console.error('Error sending confirmation email during librarian registration:', error);
                return {
                    message: 'Bibliotecario registrado en el sistema, pero no se pudo enviar el correo de notificación. Registra la incidencia o intenta reenviar el correo de confirmación.'
                };
            }
            return { message: 'Registro exitoso. Se ha enviado un correo de confirmación al nuevo bibliotecario.' };
        });
    }
    confirmAccount(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findFirst({
                where: { confirmToken: token, confirmTokenExpires: { gt: new Date() } }
            });
            if (!user)
                throw new common_1.BadRequestException('El código de confirmación es inválido o ha expirado');
            yield this.prisma.user.update({
                where: { userId: user.userId },
                data: { isConfirmed: true, confirmToken: null, confirmTokenExpires: null },
            });
            return { message: 'Cuenta confirmada exitosamente' };
        });
    }
    resendConfirmation(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findFirst({ where: { userData: { email } }, include: { userData: true } });
            if (!user)
                throw new common_1.NotFoundException('Usuario no encontrado');
            if (user.isConfirmed)
                throw new common_1.BadRequestException('La cuenta ya está confirmada');
            const token = this.generateToken();
            const tokenExpires = new Date();
            tokenExpires.setHours(tokenExpires.getHours() + 1);
            yield this.prisma.user.update({
                where: { userId: user.userId },
                data: { confirmToken: token, confirmTokenExpires: tokenExpires },
            });
            try {
                yield this.sendConfirmationEmail(email, token, true);
            }
            catch (error) {
                console.error('Error resending confirmation email:', error);
                throw new common_1.BadRequestException('No se pudo enviar el correo en este momento. Inténtalo de nuevo más tarde.');
            }
            return { message: 'Se ha enviado un nuevo enlace de confirmación' };
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findFirst({ where: { userData: { email } }, include: { userData: true } });
            if (!user)
                throw new common_1.NotFoundException('El correo ingresado no está registrado en el sistema.');
            const token = this.generateToken();
            const tokenExpires = new Date();
            tokenExpires.setMinutes(tokenExpires.getMinutes() + 10); // Expira en 10 minutos
            yield this.prisma.user.update({
                where: { userId: user.userId },
                data: { resetPasswordToken: token, resetPasswordTokenExpires: tokenExpires },
            });
            try {
                yield this.sendPasswordResetEmail(email, token);
            }
            catch (error) {
                console.error('Error sending password reset email:', error);
                throw new common_1.BadRequestException('No se pudo enviar el correo en este momento.');
            }
            return { message: 'Se ha enviado un código de recuperación a tu correo.' };
        });
    }
    verifyResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findFirst({
                where: { resetPasswordToken: token, resetPasswordTokenExpires: { gt: new Date() } }
            });
            if (!user)
                throw new common_1.BadRequestException('El código de recuperación es inválido o ha expirado.');
            return { token, message: 'Código verificado. Ahora puedes cambiar tu contraseña.' };
        });
    }
    resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findFirst({
                where: { resetPasswordToken: token, resetPasswordTokenExpires: { gt: new Date() } }
            });
            if (!user)
                throw new common_1.BadRequestException('El token es inválido o ha expirado');
            const hashedPassword = yield bcrypt.hash(newPassword, 10);
            yield this.prisma.user.update({
                where: { userId: user.userId },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordTokenExpires: null
                },
            });
            return { message: 'Contraseña actualizada exitosamente' };
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mailer_1.MailerService,
        jwt_1.JwtService])
], AuthService);
