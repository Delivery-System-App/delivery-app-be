import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class RestaurantregisterDto {
  @ApiProperty({ example: null })
  @IsString()
  name: string;

  @ApiProperty({ example: null })
  @IsString()
  address: string;

  @ApiProperty({ example: null })
  @IsNumber()
  contact: number;

  @ApiProperty({ example: null })
  @IsOptional()
  photos: any;

  @ApiProperty({ example: null })
  @IsOptional()
  timings: any;

  @ApiProperty({ example: null })
  @IsString()
  openStatus: any;

  @ApiProperty({ example: null })
  @IsNumber()
  location: number;
}
