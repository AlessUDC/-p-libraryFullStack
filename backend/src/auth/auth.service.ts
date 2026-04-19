import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes, randomInt } from 'crypto';
import { RegisterStudentDto, RegisterTeacherDto, RegisterLibrarianDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
    private jwtService: JwtService
  ) {}

  async login(code: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { code },
      include: { userData: true },
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');
    if (!user.isConfirmed) throw new UnauthorizedException('Cuenta no confirmada. Por favor revisa tu correo electrónico.');
    if (!user.userData.isActive) throw new UnauthorizedException('Cuenta desactivada.');

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
  }

  private generateToken(): string {
    return randomInt(100000, 999999).toString();
  }

  private async sendConfirmationEmail(email: string, token: string, isResend: boolean = false) {
    const confirmUrl = `http://localhost:5173/auth/confirm${isResend ? '?hideResend=true' : ''}`;
    await this.mailerService.sendMail({
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
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const verifyUrl = `http://localhost:5173/auth/verify-reset-token`;
    await this.mailerService.sendMail({
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
  }

  // Método auxiliar para crear un usuario base
  private async createBaseUser(dto: any, role: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { code: dto.code }
    });
    if (existingUser) throw new BadRequestException('El código ya está en uso');

    const existingData = await this.prisma.userData.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { documentNumber: dto.documentNumber }
        ]
      }
    });

    if (existingData) {
      const field = existingData.email === dto.email ? 'El correo electrónico' : 'El número de documento';
      throw new BadRequestException(`${field} ya está en uso`);
    }

    // Parse date (supports DD/MM/YYYY or YYYY-MM-DD)
    let parsedBirthDate: Date;
    if (dto.birthdate.includes('/')) {
      const [day, month, year] = dto.birthdate.split('/').map(Number);
      parsedBirthDate = new Date(year, month - 1, day);
    } else {
      parsedBirthDate = new Date(dto.birthdate);
    }

    if (parsedBirthDate > new Date()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser en el futuro');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
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
  }

  async registerStudent(dto: RegisterStudentDto) {
    const { 
      hashedPassword, confirmToken, tokenExpires, 
      birthDate, mobilePhone, landlinePhone, address, districtId,
      maritalStatus, gender 
    } = await this.createBaseUser(dto, 'STUDENT');

    const user = await this.prisma.user.create({
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
      await this.sendConfirmationEmail(user.userData.email!, confirmToken);
    } catch (error) {
      console.error('Error sending confirmation email during student registration:', error);
      return { 
        message: 'Registro guardado exitosamente, pero hubo un problema al enviar el correo de confirmación. Por favor contacta al administrador o intenta solicitar un nuevo enlace más tarde.' 
      };
    }

    return { message: 'Registro exitoso. Se ha enviado un correo de confirmación.' };
  }

  async registerTeacher(dto: RegisterTeacherDto) {
    const { 
      hashedPassword, confirmToken, tokenExpires, 
      birthDate, mobilePhone, landlinePhone, address, districtId,
      maritalStatus, gender 
    } = await this.createBaseUser(dto, 'TEACHER');

    const user = await this.prisma.user.create({
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
      await this.sendConfirmationEmail(user.userData.email!, confirmToken);
    } catch (error) {
      console.error('Error sending confirmation email during teacher registration:', error);
      return { 
        message: 'Registro guardado exitosamente, pero hubo un problema al enviar el correo de confirmación. Por favor contacta al administrador o intenta solicitar un nuevo enlace más tarde.' 
      };
    }

    return { message: 'Registro exitoso. Se ha enviado un correo de confirmación.' };
  }

  async registerLibrarian(dto: RegisterLibrarianDto) {
    const { 
      hashedPassword, confirmToken, tokenExpires, 
      birthDate, mobilePhone, landlinePhone, address, districtId,
      maritalStatus, gender 
    } = await this.createBaseUser(dto, 'LIBRARIAN');

    const user = await this.prisma.user.create({
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
      await this.sendConfirmationEmail(user.userData.email!, confirmToken);
    } catch (error) {
      console.error('Error sending confirmation email during librarian registration:', error);
      return { 
        message: 'Bibliotecario registrado en el sistema, pero no se pudo enviar el correo de notificación. Registra la incidencia o intenta reenviar el correo de confirmación.' 
      };
    }

    return { message: 'Registro exitoso. Se ha enviado un correo de confirmación al nuevo bibliotecario.' };
  }

  async confirmAccount(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { confirmToken: token, confirmTokenExpires: { gt: new Date() } }
    });

     if (!user) throw new BadRequestException('El código de confirmación es inválido o ha expirado');

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { isConfirmed: true, confirmToken: null, confirmTokenExpires: null },
    });

    return { message: 'Cuenta confirmada exitosamente' };
  }

  async resendConfirmation(email: string) {
    const user = await this.prisma.user.findFirst({ where: { userData: { email } }, include: { userData: true } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.isConfirmed) throw new BadRequestException('La cuenta ya está confirmada');

     const token = this.generateToken();
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 1);

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { confirmToken: token, confirmTokenExpires: tokenExpires },
    });

    try {
      await this.sendConfirmationEmail(email, token, true);
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      throw new BadRequestException('No se pudo enviar el correo en este momento. Inténtalo de nuevo más tarde.');
    }

    return { message: 'Se ha enviado un nuevo enlace de confirmación' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({ where: { userData: { email } }, include: { userData: true } });
    if (!user) throw new NotFoundException('El correo ingresado no está registrado en el sistema.');

    const token = this.generateToken();
    const tokenExpires = new Date();
    tokenExpires.setMinutes(tokenExpires.getMinutes() + 10); // Expira en 10 minutos

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { resetPasswordToken: token, resetPasswordTokenExpires: tokenExpires },
    });

    try {
      await this.sendPasswordResetEmail(email, token);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new BadRequestException('No se pudo enviar el correo en este momento.');
    }
    
    return { message: 'Se ha enviado un código de recuperación a tu correo.' };
  }

  async verifyResetToken(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetPasswordToken: token, resetPasswordTokenExpires: { gt: new Date() } }
    });

    if (!user) throw new BadRequestException('El código de recuperación es inválido o ha expirado.');

    return { token, message: 'Código verificado. Ahora puedes cambiar tu contraseña.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetPasswordToken: token, resetPasswordTokenExpires: { gt: new Date() } }
    });
    if (!user) throw new BadRequestException('El token es inválido o ha expirado');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { 
        password: hashedPassword, 
        resetPasswordToken: null, 
        resetPasswordTokenExpires: null 
      },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async verifyPassword(userId: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');
    
    return { valid: true };
  }
}
