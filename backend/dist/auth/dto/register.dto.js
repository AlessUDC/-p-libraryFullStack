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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterLibrarianDto = exports.RegisterTeacherDto = exports.RegisterStudentDto = exports.BaseRegisterDto = void 0;
const class_validator_1 = require("class-validator");
class BaseRegisterDto {
}
exports.BaseRegisterDto = BaseRegisterDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El primer nombre debe ser un texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El primer nombre no puede ir vacío' }),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El apellido paterno debe ser un texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El apellido paterno no puede ir vacío' }),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "paternalLastName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El apellido materno debe ser un texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El apellido materno no puede ir vacío' }),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "maternalLastName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El tipo de documento debe ser un texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El tipo de documento no puede ir vacío' }),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "documentType", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)({}, { message: 'El número de documento debe contener solo números' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El número de documento no puede ir vacío' }),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "documentNumber", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'El email no es válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El email no puede ir vacío' }),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El password debe ser un texto' }),
    (0, class_validator_1.MinLength)(8, { message: 'El password debe tener al menos 8 caracteres' }),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El código debe ser un texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El código no puede ir vacío' }),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El estado civil debe ser un texto' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "maritalStatus", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El género debe ser un texto' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'La fecha de nacimiento debe ser un texto (DD/MM/AAAA)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La fecha de nacimiento no puede ir vacía' }),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "birthdate", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El teléfono móvil debe ser un texto' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "mobilePhone", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El teléfono fijo debe ser un texto' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "landlinePhone", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'La dirección debe ser un texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La dirección no puede ir vacía' }),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El ID del distrito debe ser un texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del distrito no puede ir vacío' }),
    __metadata("design:type", String)
], BaseRegisterDto.prototype, "districtId", void 0);
class RegisterStudentDto extends BaseRegisterDto {
}
exports.RegisterStudentDto = RegisterStudentDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ciclo no puede ir vacío' }),
    (0, class_validator_1.IsIn)(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], { message: 'El ciclo debe estar entre 1 y 10' }),
    __metadata("design:type", String)
], RegisterStudentDto.prototype, "cycle", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El ID de la facultad debe ser un texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID de la facultad no puede ir vacío' }),
    __metadata("design:type", String)
], RegisterStudentDto.prototype, "facultyId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El ID de la escuela debe ser un texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID de la escuela no puede ir vacío' }),
    __metadata("design:type", String)
], RegisterStudentDto.prototype, "schoolId", void 0);
class RegisterTeacherDto extends BaseRegisterDto {
}
exports.RegisterTeacherDto = RegisterTeacherDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El ID de la facultad debe ser un texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID de la facultad no puede ir vacío' }),
    __metadata("design:type", String)
], RegisterTeacherDto.prototype, "facultyId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El departamento debe ser un texto' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterTeacherDto.prototype, "department", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'La especialización debe ser un texto' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterTeacherDto.prototype, "specialization", void 0);
class RegisterLibrarianDto extends BaseRegisterDto {
}
exports.RegisterLibrarianDto = RegisterLibrarianDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El turno debe ser un texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El turno no puede ir vacío' }),
    __metadata("design:type", String)
], RegisterLibrarianDto.prototype, "shift", void 0);
