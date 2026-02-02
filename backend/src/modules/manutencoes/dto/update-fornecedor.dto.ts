import { z } from 'zod';

export const updateFornecedorSchema = z
  .object({
    nome: z.string().min(1, 'Nome obrigatório').max(200).optional(),
    contato: z.string().max(200).optional().nullable(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar',
  });

export type UpdateFornecedorDto = z.infer<typeof updateFornecedorSchema>;
