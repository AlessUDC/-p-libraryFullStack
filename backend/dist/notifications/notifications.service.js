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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const BRAND_COLOR = '#4F46E5';
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(mailerService) {
        this.mailerService = mailerService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    safeSend(to, subject, html) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.mailerService.sendMail({ to, subject, html });
            }
            catch (err) {
                this.logger.error(`[Notifications] Failed to send "${subject}" to ${to}: ${err.message}`);
            }
        });
    }
    sendReservationConfirmation(email, name, bookTitle, expiresAt, durationMinutes) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f8faff; border-radius: 12px;">
        <div style="background: ${BRAND_COLOR}; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">📚 Reserva Confirmada</h1>
        </div>
        <div style="background: white; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Hola <strong>${name}</strong>,</p>
          <p style="color: #6b7280;">Tu reserva ha sido confirmada para el libro:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="color: ${BRAND_COLOR}; margin: 0;">"${bookTitle}"</h2>
          </div>
          <p style="color: #ef4444; font-weight: bold; text-align: center;">
            ⏱️ Tu reserva expira en <strong>${durationMinutes} minutos</strong> (${expiresAt.toLocaleTimeString('es-PE')})
          </p>
          <p style="color: #374151;">Dirígete a la biblioteca y solicita al bibliotecario tu código QR de recojo. Recuerda llevar el monto del depósito reembolsable.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Sistema Nexus Biblioteca | Si no realizaste esta acción, ignora este correo.</p>
        </div>
      </div>`;
            yield this.safeSend(email, '📚 Reserva de libro confirmada - Nexus Biblioteca', html);
        });
    }
    sendLoanConfirmation(email, name, bookTitle, returnDate, depositAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f8faff; border-radius: 12px;">
        <div style="background: #059669; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">✅ Préstamo Exitoso</h1>
        </div>
        <div style="background: white; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Hola <strong>${name}</strong>,</p>
          <p style="color: #6b7280;">Tu préstamo ha sido registrado correctamente:</p>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <p style="margin: 4px 0; color: #374151;"><strong>📖 Libro:</strong> ${bookTitle}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>📅 Fecha límite de devolución:</strong> ${returnDate.toLocaleDateString('es-PE')}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>💰 Depósito registrado:</strong> S/ ${depositAmount.toFixed(2)}</p>
          </div>
          <p style="color: #374151;">Asegúrate de devolver el libro a tiempo. En caso de retraso, se generarán multas de <strong>S/ 5.00 por día</strong>.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Sistema Nexus Biblioteca</p>
        </div>
      </div>`;
            yield this.safeSend(email, '✅ Préstamo registrado - Nexus Biblioteca', html);
        });
    }
    sendReturnReminder(email, bookTitle, returnDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #f8faff; border-radius: 12px;">
        <div style="background: #f59e0b; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">⏰ Recordatorio de Devolución</h1>
        </div>
        <div style="background: white; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Recuerda devolver <strong>"${bookTitle}"</strong> antes del <strong>${returnDate.toLocaleDateString('es-PE')}</strong>.</p>
          <p style="color: #6b7280;">Acércate al mostrador de la biblioteca a tiempo para evitar multas y sanciones.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Sistema Nexus Biblioteca</p>
        </div>
      </div>`;
            yield this.safeSend(email, '⏰ Recuerda devolver tu libro - Nexus Biblioteca', html);
        });
    }
    sendOverdueDay1(email, bookTitle, fineAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <div style="background: #ef4444; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Libro Vencido - Día 1</h1>
        </div>
        <div style="background: white; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p>Tu préstamo de <strong>"${bookTitle}"</strong> venció ayer.</p>
          <p>Se ha generado una multa temporal de <strong>S/ ${fineAmount.toFixed(2)}</strong>.</p>
          <p style="color: #ef4444;"><strong>Si devuelves el libro en las próximas 24 horas, la multa será anulada.</strong></p>
          <p>Tu permiso de hacer préstamos ha sido suspendido temporalmente.</p>
        </div>
      </div>`;
            yield this.safeSend(email, '⚠️ URGENTE: Libro vencido - Nexus Biblioteca', html);
        });
    }
    sendOverdayDay3(email, bookTitle, fineAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <div style="background: #dc2626; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🚨 Restricción Académica Activada</h1>
        </div>
        <div style="background: white; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p>Tu préstamo de <strong>"${bookTitle}"</strong> lleva <strong>3 días de retraso</strong>.</p>
          <p>Multa acumulada: <strong>S/ ${fineAmount.toFixed(2)}</strong></p>
          <p style="color: #dc2626; font-weight: bold;">Se han activado restricciones académicas (matrícula, trámites, pagos).</p>
          <p>Puedes devolver el libro hasta el día 8 mediante código QR en la biblioteca y pagar las multas.</p>
        </div>
      </div>`;
            yield this.safeSend(email, '🚨 Restricción académica activada - Nexus Biblioteca', html);
        });
    }
    sendOverdueDay9(email, bookTitle, fineAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <div style="background: #7f1d1d; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🔴 Sanción Grave del Sistema</h1>
        </div>
        <div style="background: white; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p>Tu préstamo de <strong>"${bookTitle}"</strong> lleva <strong>9+ días de retraso</strong>.</p>
          <p>Multa acumulada: <strong>S/ ${fineAmount.toFixed(2)}</strong></p>
          <p style="color: #7f1d1d; font-weight: bold;">Se ha aplicado una sanción del sistema. Ya NO puedes devolver el libro vía QR.</p>
          <p>Debes acercarte personalmente al mostrador de la biblioteca para regularizar tu situación con el bibliotecario.</p>
        </div>
      </div>`;
            yield this.safeSend(email, '🔴 SANCIÓN GRAVE: Acércate a la biblioteca - Nexus Biblioteca', html);
        });
    }
    sendReturnConfirmation(email, name, bookTitle, refunded, refundAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <div style="background: #059669; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">📗 Devolución Completada</h1>
        </div>
        <div style="background: white; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <p>Hola <strong>${name}</strong>, hemos registrado la devolución de <strong>"${bookTitle}"</strong>.</p>
          ${refunded
                ? `<p style="color: #059669; font-weight: bold;">✅ Tu depósito de S/ ${refundAmount.toFixed(2)} será reembolsado en efectivo.</p>`
                : `<p style="color: #ef4444; font-weight: bold;">⚠️ El depósito fue retenido como parte de la sanción (libro perdido o multas no pagadas).</p>`}
          <p>Gracias por usar Nexus Biblioteca.</p>
        </div>
      </div>`;
            yield this.safeSend(email, '📗 Devolución confirmada - Nexus Biblioteca', html);
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], NotificationsService);
