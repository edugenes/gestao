import { z } from 'zod';

export const updateInventarioItemSchema = z
  .object({
    conferido: z.boolean().optional(),
    dataConferencia: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
    divergencia: z.string().max(2000).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar',
  });

export type UpdateInventarioItemDto = z.infer<typeof updateInventarioItemSchema>;
