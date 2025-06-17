import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateGuildDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
  
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  maxMembers?: number;
  
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateGuildDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;
  
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
  
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
  
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  maxMembers?: number;
  
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
