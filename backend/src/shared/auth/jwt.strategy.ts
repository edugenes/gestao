import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';
import type { JwtPayload } from './decorators';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<{ id: string; email: string; role: Role }> {
    if (payload.type === 'refresh') {
      throw new UnauthorizedException('Use access token nesta rota');
    }
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, active: true, deletedAt: null },
      select: { id: true, email: true, role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Usuário inativo ou inexistente');
    }
    return user;
  }
}
