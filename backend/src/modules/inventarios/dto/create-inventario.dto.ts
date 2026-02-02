import { z } from 'zod';

export const createInventarioSchema = z
  .object({
    descricao: z.string().min(1, 'Descrição obrigatória').max(500),
    dataInicio: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  })
  .refine(
    (d) => {
      const dt = typeof d.dataInicio === 'string' ? new Date(d.dataInicio) : d.dataInicio;
      return !Number.isNaN(dt.getTime());
    },
    { message: 'Data de início inválida', path: ['dataInicio'] },
  );

export type CreateInventarioDto = z.infer<typeof createInventarioSchema>;
