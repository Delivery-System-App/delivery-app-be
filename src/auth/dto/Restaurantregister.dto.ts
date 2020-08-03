import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class RestaurantregisterDto {
  @ApiProperty({ example: null })
  @IsString()
  name: string;

  @ApiProperty({ example: null })
  @IsString()
  address: string;

  @ApiProperty({ example: null })
  @IsNumber()
  number: number;
  
  @ApiProperty({ example:null })
  @IsOptional()
  menulist:any;

  @ApiProperty({ example:null })
  @IsOptional()
  photos:any;

  @ApiProperty({ example: null })
  @IsNumber()
  location: number;
}