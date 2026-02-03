import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import type { JwtPayload } from '../../shared/auth';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuditService } from '../audit/audit.service';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<{ id: string; email: string; role: Role } | null> {
    const user = await this.usuariosService.findByEmailForAuth(email);
    if (!user || !user.active) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const user = await this.validateUser(email, password);
    if (!user) {
      this.audit.log({ entity: 'User', action: 'LOGIN_FAILED', metadata: { email } }).catch(() => {});
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }
    this.audit.log({ entity: 'User', entityId: user.id, action: 'LOGIN_SUCCESS', userId: user.id }).catch(() => {});
    return this.generateTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const secret = this.config.get<string>('JWT_SECRET');
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, { secret });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token inválido para refresh');
    }
    const user = await this.usuariosService.findByIdForAuth(payload.sub);
    if (!user || !user.active) {
      throw new UnauthorizedException('Usuário inativo ou inexistente');
    }
    return this.generateTokens(user.id, user.email, user.role);
  }

  private generateTokens(sub: string, email: string, role: Role): TokenResponse {
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const accessToken = this.jwtService.sign(
      { sub, email, role, type: 'access' } satisfies JwtPayload,
      { expiresIn },
    );
    const refreshToken = this.jwtService.sign(
      { sub, email, role, type: 'refresh' } satisfies JwtPayload,
      { expiresIn: refreshExpiresIn },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }
}
