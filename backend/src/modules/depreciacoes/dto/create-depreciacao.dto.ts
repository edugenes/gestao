import { z } from 'zod';
import { MetodoDepreciacao } from '@prisma/client';

const metodoDepreciacaoEnum = z.nativeEnum(MetodoDepreciacao);

export const createDepreciacaoSchema = z
  .object({
    bemId: z.string().uuid('ID do bem inválido'),
    mesReferencia: z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM para o mês de referência'),
    valorDepreciado: z.number().nonnegative('Valor depreciado deve ser >= 0'),
    metodo: metodoDepreciacaoEnum,
  })
  .refine(
    (d) => {
      const [y, m] = d.mesReferencia.split('-').map(Number);
      const date = new Date(y, m - 1, 1);
      return !Number.isNaN(date.getTime()) && date.getMonth() === m - 1;
    },
    { message: 'Mês de referência inválido', path: ['mesReferencia'] },
  );

export type CreateDepreciacaoDto = z.infer<typeof createDepreciacaoSchema>;
