import { z } from 'zod';
import { TipoMovimentacao } from '@prisma/client';

const tipoMovimentacaoEnum = z.nativeEnum(TipoMovimentacao);

export const createMovimentacaoSchema = z
  .object({
    bemId: z.string().uuid('ID do bem inválido'),
    tipo: tipoMovimentacaoEnum,
    setorOrigemId: z.string().uuid().optional().nullable(),
    setorDestinoId: z.string().uuid().optional().nullable(),
    dataMovimentacao: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
    dataDevolucao: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
    observacoes: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (d) => {
      const dt = typeof d.dataMovimentacao === 'string' ? new Date(d.dataMovimentacao) : d.dataMovimentacao;
      return !Number.isNaN(dt.getTime());
    },
    { message: 'Data de movimentação inválida', path: ['dataMovimentacao'] },
  );

export type CreateMovimentacaoDto = z.infer<typeof createMovimentacaoSchema>;
