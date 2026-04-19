import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, IsIn, IsNumberString } from 'class-validator';

export class BaseRegisterDto {
  @IsString({ message: 'El primer nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El primer nombre no puede ir vacío' })
  firstName!: string;

  @IsString({ message: 'El apellido paterno debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido paterno no puede ir vacío' })
  paternalLastName!: string;

  @IsString({ message: 'El apellido materno debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido materno no puede ir vacío' })
  maternalLastName!: string;

  @IsString({ message: 'El tipo de documento debe ser un texto' })
  @IsNotEmpty({ message: 'El tipo de documento no puede ir vacío' })
  documentType!: string;

  @IsNumberString({}, { message: 'El número de documento debe contener solo números' })
  @IsNotEmpty({ message: 'El número de documento no puede ir vacío' })
  documentNumber!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email no puede ir vacío' })
  email!: string;

  @IsString({ message: 'El password debe ser un texto' })
  @MinLength(8, { message: 'El password debe tener al menos 8 caracteres' })
  password!: string;

  @IsString({ message: 'El código debe ser un texto' })
  @IsNotEmpty({ message: 'El código no puede ir vacío' })
  code!: string; // The user code for login

  @IsString({ message: 'El estado civil debe ser un texto' })
  @IsOptional()
  maritalStatus?: string;

  @IsString({ message: 'El género debe ser un texto' })
  @IsOptional()
  gender?: string;

  @IsString({ message: 'La fecha de nacimiento debe ser un texto (DD/MM/AAAA)' })
  @IsNotEmpty({ message: 'La fecha de nacimiento no puede ir vacía' })
  birthdate!: string;

  @IsString({ message: 'El teléfono móvil debe ser un texto' })
  @IsOptional()
  mobilePhone?: string;

  @IsString({ message: 'El teléfono fijo debe ser un texto' })
  @IsOptional()
  landlinePhone?: string;

  @IsString({ message: 'La dirección debe ser un texto' })
  @IsNotEmpty({ message: 'La dirección no puede ir vacía' })
  address!: string;

  @IsString({ message: 'El ID del distrito debe ser un texto' })
  @IsNotEmpty({ message: 'El ID del distrito no puede ir vacío' })
  districtId!: string;
}

export class RegisterStudentDto extends BaseRegisterDto {
  @IsNotEmpty({ message: 'El ciclo no puede ir vacío' })
  @IsIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], { message: 'El ciclo debe estar entre 1 y 10' })
  cycle!: string;

  @IsString({ message: 'El ID de la facultad debe ser un texto' })
  @IsNotEmpty({ message: 'El ID de la facultad no puede ir vacío' })
  facultyId!: string;

  @IsString({ message: 'El ID de la escuela debe ser un texto' })
  @IsNotEmpty({ message: 'El ID de la escuela no puede ir vacío' })
  schoolId!: string;
}

export class RegisterTeacherDto extends BaseRegisterDto {
  @IsString({ message: 'El ID de la facultad debe ser un texto' })
  @IsNotEmpty({ message: 'El ID de la facultad no puede ir vacío' })
  facultyId!: string;

  @IsString({ message: 'El departamento debe ser un texto' })
  @IsOptional()
  department?: string;

  @IsString({ message: 'La especialización debe ser un texto' })
  @IsOptional()
  specialization?: string;
}

export class RegisterLibrarianDto extends BaseRegisterDto {
  @IsString({ message: 'El turno debe ser un texto' })
  @IsNotEmpty({ message: 'El turno no puede ir vacío' })
  shift!: string;
}
