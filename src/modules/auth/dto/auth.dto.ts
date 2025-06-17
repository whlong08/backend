import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'Username phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  username: string;

  @ApiProperty()
  @IsString({ message: 'Password phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  password: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'Password phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString({ message: 'Refresh token phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  refreshToken: string;
}
