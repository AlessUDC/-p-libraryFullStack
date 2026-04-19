import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateQuantityDto {
  @IsInt()
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  location!: string;
}
