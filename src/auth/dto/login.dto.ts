import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber, MinLength, Matches } from "class-validator";

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
