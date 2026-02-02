import { z } from 'zod';
import { MotivoBaixa } from '@prisma/client';

const motivoBaixaEnum = z.nativeEnum(MotivoBaixa);

export const createBaixaSchema = z
  .object({
    bemId: z.string().uuid('ID do bem inválido'),
    dataBaixa: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
    motivo: motivoBaixaEnum,
    valorRealizado: z.number().nonnegative().optional().nullable(),
    observacoes: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (d) => {
      const dt = typeof d.dataBaixa === 'string' ? new Date(d.dataBaixa) : d.dataBaixa;
      return !Number.isNaN(dt.getTime());
    },
    { message: 'Data de baixa inválida', path: ['dataBaixa'] },
  );

export type CreateBaixaDto = z.infer<typeof createBaixaSchema>;
