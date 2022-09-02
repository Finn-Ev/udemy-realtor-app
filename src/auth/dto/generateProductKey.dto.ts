import { UserType } from "@prisma/client";
import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber, MinLength, Matches, IsEnum } from "class-validator";

export class GenerateProductKeyDto {
  @IsEmail()
  email: string;

  @IsEnum(UserType)
  userType: UserType;
}
