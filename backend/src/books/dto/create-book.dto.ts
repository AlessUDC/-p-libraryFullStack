import { IsString, IsInt, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AuthorDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsOptional()
  middleName?: string;
}

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  isbn!: string;

  @IsInt()
  publicationYear!: number;

  @IsString()
  @IsOptional()
  edition?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsInt()
  @IsOptional()
  pageCount?: number;

  @IsString()
  @IsNotEmpty()
  publisherTitle!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorDto)
  authors!: AuthorDto[];

  @IsArray()
  @IsString({ each: true })
  categoriesIds!: string[];

  @IsString()
  @IsNotEmpty()
  initialLocation!: string;

  @IsInt()
  initialCopyCount!: number;
}
