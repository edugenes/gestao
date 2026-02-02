import { z } from 'zod';

export const updatePredioSchema = z
  .object({
    nome: z.string().min(1, 'Nome obrigatório').max(200, 'Nome muito longo').optional(),
    codigo: z.string().max(50, 'Código muito longo').optional().nullable(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar',
  });

export type UpdatePredioDto = z.infer<typeof updatePredioSchema>;
