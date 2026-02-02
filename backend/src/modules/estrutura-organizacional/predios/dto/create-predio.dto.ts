import { z } from 'zod';

export const createPredioSchema = z.object({
  unidadeId: z.string().uuid('ID da unidade inválido'),
  nome: z.string().min(1, 'Nome obrigatório').max(200, 'Nome muito longo'),
  codigo: z.string().max(50, 'Código muito longo').optional(),
});

export type CreatePredioDto = z.infer<typeof createPredioSchema>;
