import { z } from 'zod';

export const createCentroCustoSchema = z.object({
  codigo: z.string().min(1, 'Código obrigatório').max(50, 'Código muito longo'),
  descricao: z.string().min(1, 'Descrição obrigatória').max(500, 'Descrição muito longa'),
});

export type CreateCentroCustoDto = z.infer<typeof createCentroCustoSchema>;
