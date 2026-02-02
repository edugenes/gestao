import { z } from 'zod';

export const createAndarSchema = z.object({
  predioId: z.string().uuid('ID do prédio inválido'),
  nome: z.string().min(1, 'Nome obrigatório').max(200, 'Nome muito longo'),
  codigo: z.string().max(50, 'Código muito longo').optional(),
});

export type CreateAndarDto = z.infer<typeof createAndarSchema>;
