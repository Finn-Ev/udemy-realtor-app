import { Body, Controller, Param, ParseEnumPipe, Post, UnauthorizedException } from "@nestjs/common";
import { UserType } from "@prisma/client";
import { argon2d } from "argon2";
import { AuthService } from "./auth.service";
import { GenerateProductKeyDto, LoginDto, RegisterDto } from "./dto";
import * as argon2 from "argon2";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register/:userType")
  async register(@Body() data: RegisterDto, @Param("userType", new ParseEnumPipe(UserType)) userType: UserType) {
    // admins and realtors only can register when get a key from an admin
    if (userType !== UserType.BUYER) {
      if (!data.productKey) {
        throw new UnauthorizedException();
      }

      const validProductKey = `${data.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

      const productKeyMatches = await argon2.verify(data.productKey, validProductKey);

      if (!productKeyMatches) {
        throw new UnauthorizedException();
      }
    }

    return this.authService.register(data, userType);
  }

  @Post("login")
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post("key")
  key(@Body() data: GenerateProductKeyDto) {
    return this.authService.generateProductKey(data);
  }
}
