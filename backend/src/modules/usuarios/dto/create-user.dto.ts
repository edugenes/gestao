import { z } from 'zod';
import { Role } from '@prisma/client';

const roleEnum = z.nativeEnum(Role);

export const createUserSchema = z.object({
  email: z.string().email('E-mail inválido').transform((v) => v.toLowerCase()),
  name: z.string().min(1, 'Nome obrigatório').max(200, 'Nome muito longo'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  role: roleEnum.optional().default('OPERADOR'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
