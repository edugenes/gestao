import { z } from 'zod';

export const createSetorSchema = z.object({
  andarId: z.string().uuid('ID do andar inválido'),
  centroCustoId: z.string().uuid('ID do centro de custo inválido').optional().nullable(),
  nome: z.string().min(1, 'Nome obrigatório').max(200, 'Nome muito longo'),
  codigo: z.string().max(50, 'Código muito longo').optional(),
});

export type CreateSetorDto = z.infer<typeof createSetorSchema>;
