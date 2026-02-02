import { z } from 'zod';

export const createCategoriaSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(200, 'Nome muito longo'),
  codigo: z.string().max(50, 'Código muito longo').optional(),
});

export type CreateCategoriaDto = z.infer<typeof createCategoriaSchema>;
