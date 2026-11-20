import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "./auth.service";

type JwtPayload = {
  sub: string;
  role: string;
  level: string | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET") || "shipflow-dev-secret"
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.findActiveUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException("账号已停用或不存在");
    }

    return {
      id: user.id,
      account: user.account,
      name: user.name,
      role: user.role,
      level: user.level
    };
  }
}
