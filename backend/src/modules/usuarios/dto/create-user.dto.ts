import { z } from 'zod';
import { Role } from '@prisma/client';

const roleEnum = z.nativeEnum(Role);

export const createUserSchema = z.object({
  // Campo "email" é utilizado como LOGIN do usuário.
  // Não exigimos formato de e-mail – é um identificador de acesso.
  email: z
    .string()
    .min(1, 'Login obrigatório')
    .max(100, 'Login muito longo')
    .transform((v) => v.trim()),
  name: z.string().min(1, 'Nome obrigatório').max(200, 'Nome muito longo'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  role: roleEnum.optional().default('OPERADOR'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
