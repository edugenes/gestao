import { z } from 'zod';
import { TipoManutencao } from '@prisma/client';

const tipoManutencaoEnum = z.nativeEnum(TipoManutencao);

export const createManutencaoSchema = z
  .object({
    bemId: z.string().uuid('ID do bem inválido'),
    tipo: tipoManutencaoEnum,
    dataInicio: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
    dataFim: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
    custo: z.number().nonnegative().optional().nullable(),
    fornecedorId: z.string().uuid().optional().nullable(),
    observacoes: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (d) => {
      const dt = typeof d.dataInicio === 'string' ? new Date(d.dataInicio) : d.dataInicio;
      return !Number.isNaN(dt.getTime());
    },
    { message: 'Data de início inválida', path: ['dataInicio'] },
  );

export type CreateManutencaoDto = z.infer<typeof createManutencaoSchema>;
