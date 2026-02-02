import { z } from 'zod';

export const updateCentroCustoSchema = z
  .object({
    codigo: z.string().min(1, 'Código obrigatório').max(50, 'Código muito longo').optional(),
    descricao: z.string().min(1, 'Descrição obrigatória').max(500, 'Descrição muito longa').optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar',
  });

export type UpdateCentroCustoDto = z.infer<typeof updateCentroCustoSchema>;
