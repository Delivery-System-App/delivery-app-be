import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { ObjectID } from 'mongodb';


export class AddDishes {
  

  @ApiProperty({ example: null })
  @IsString()
  name: string;

  @ApiProperty({ example: null })
  @IsNumber()
  price: number;

  @ApiProperty({ example:null })
  @IsOptional()
  photos:any;

}