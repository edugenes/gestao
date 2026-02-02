import { z } from 'zod';

export const updateManutencaoSchema = z
  .object({
    dataFim: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
    custo: z.number().nonnegative().optional().nullable(),
    fornecedorId: z.string().uuid().optional().nullable(),
    observacoes: z.string().max(2000).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar',
  });

export type UpdateManutencaoDto = z.infer<typeof updateManutencaoSchema>;
