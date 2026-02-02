import { z } from 'zod';

export const createInventarioItemSchema = z.object({
  inventarioId: z.string().uuid('ID do inventário inválido'),
  bemId: z.string().uuid('ID do bem inválido'),
  divergencia: z.string().max(2000).optional().nullable(),
});

export type CreateInventarioItemDto = z.infer<typeof createInventarioItemSchema>;
