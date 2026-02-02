import { z } from 'zod';

export const createFornecedorSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(200),
  contato: z.string().max(200).optional().nullable(),
});

export type CreateFornecedorDto = z.infer<typeof createFornecedorSchema>;
