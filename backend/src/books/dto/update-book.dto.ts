import { IsOptional, IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthorDto } from './create-book.dto';

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsInt()
  @IsOptional()
  publicationYear?: number;

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
  @IsOptional()
  publisherTitle?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorDto)
  @IsOptional()
  authors?: AuthorDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoriesIds?: string[];
}
