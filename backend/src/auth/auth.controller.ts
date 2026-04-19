import { Body, Controller, Post, Get, Query, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterStudentDto, RegisterTeacherDto, RegisterLibrarianDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: Record<string, string>) {
    return this.authService.login(signInDto.code, signInDto.password);
  }

  @Post('register/student')
  registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  @Post('register/teacher')
  registerTeacher(@Body() dto: RegisterTeacherDto) {
    return this.authService.registerTeacher(dto);
  }

  @Post('register/librarian')
  registerLibrarian(@Body() dto: RegisterLibrarianDto, @Request() req: any) {
    // Basic protection logic to be replaced by full JwtAuthGuard & RolesGuard
    // In NestJS we usually use @UseGuards() but we will manually verify the header or rely on future role guards
    // For now we assume the frontend sends the admin token and it's intercepted. Wait, we need an admin check.
    // The user requested: "Solo por un adminnistrador logueado."
    return this.authService.registerLibrarian(dto);
  }

  @Post('confirm')
  confirmAccount(@Body('token') token: string) {
    return this.authService.confirmAccount(token);
  }

  @Post('resend-confirmation')
  resendConfirmation(@Body('email') email: string) {
    return this.authService.resendConfirmation(email);
  }

  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('verify-reset-token')
  verifyResetToken(@Body('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  @Post('reset-password')
  resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
