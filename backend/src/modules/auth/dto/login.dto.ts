import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Login obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export type LoginDto = z.infer<typeof loginSchema>;
