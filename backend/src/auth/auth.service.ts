import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(code: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { code },
      include: {
        userData: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const profile = {
      firstName: user.userData.firstName,
      lastName: user.userData.lastName,
      email: user.userData.email,
    };

    const payload = { sub: user.userId, code: user.code, role: user.role };
    
    // Hardcoded secret for dev. In prod use ConfigService/process.env.JWT_SECRET
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_jwt_key_1234', { 
        expiresIn: '24h' 
    });

    return {
      token,
      user: {
        userId: user.userId,
        role: user.role.toLowerCase(), // Frontend expects 'librarian', 'student', 'administrator'
        profile,
      },
    };
  }
}
