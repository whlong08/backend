import { ApiProperty } from '@nestjs/swagger';
<<<<<<< Updated upstream
=======
import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';
>>>>>>> Stashed changes

export class RegisterDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}

export class LoginDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
