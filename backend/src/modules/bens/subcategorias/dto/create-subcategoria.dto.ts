import { z } from 'zod';

export const createSubcategoriaSchema = z.object({
  categoriaId: z.string().uuid('ID da categoria inválido'),
  nome: z.string().min(1, 'Nome obrigatório').max(200, 'Nome muito longo'),
  codigo: z.string().max(50, 'Código muito longo').optional(),
});

export type CreateSubcategoriaDto = z.infer<typeof createSubcategoriaSchema>;
