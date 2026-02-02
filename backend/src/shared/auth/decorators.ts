import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

/** Marca rota como pública (sem JWT). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Exige um dos papéis informados (RBAC). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** Payload do JWT (sub + email + role). */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  type?: 'access' | 'refresh';
}

/** Usuário no request após validação JWT. */
export interface RequestUser {
  id: string;
  email: string;
  role: Role;
}

/** Injeta o usuário autenticado no parâmetro da rota. */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    return data ? user?.[data] : user;
  },
);
