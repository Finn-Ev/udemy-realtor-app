import { Module } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { UserService } from "./user.service";

@Module({
  providers: [UserService],
})
export class UserModule {}
