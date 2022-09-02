import { ConflictException, HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GenerateProductKeyDto, LoginDto, RegisterDto } from "./dto";
import * as jwt from "jsonwebtoken";
import * as argon2 from "argon2";
import { UserType } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async register(data: RegisterDto, userType: UserType) {
    const userExists = !!(await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    }));

    if (userExists) {
      throw new ConflictException("User already exists");
    }

    const hashedPassword = await argon2.hash(data.password);

    const user = await this.prismaService.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        phone: data.phone,
        type: userType,
      },
    });

    delete user.password;

    return this.generateToken(user.name, user.id);
  }

  async login(data: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new HttpException("Invalid Credentials", 400);
    }

    const passwordValid = await argon2.verify(user.password, data.password);

    if (!passwordValid) {
      throw new HttpException("Invalid Credentials", 400);
    }

    delete user.password;

    return this.generateToken(user.name, user.id);
  }

  async generateProductKey({ email, userType }: GenerateProductKeyDto) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    return argon2.hash(string);
  }

  private async generateToken(name: string, id: number) {
    return jwt.sign({ id, name }, "SECRET", { expiresIn: "1d" });
  }
}
