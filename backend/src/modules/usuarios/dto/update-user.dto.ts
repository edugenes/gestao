import { z } from 'zod';
import { Role } from '@prisma/client';

const roleEnum = z.nativeEnum(Role);

export const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Nome obrigatório').max(200, 'Nome muito longo').optional(),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').optional(),
    role: roleEnum.optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar',
  });

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
