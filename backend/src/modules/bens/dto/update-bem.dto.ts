import { z } from 'zod';
import { EstadoConservacao, SituacaoBem } from '@prisma/client';

const estadoConservacaoEnum = z.nativeEnum(EstadoConservacao);
const situacaoBemEnum = z.nativeEnum(SituacaoBem);

// Número patrimonial NUNCA pode ser alterado (regra de negócio)
export const updateBemSchema = z
  .object({
    setorId: z.string().uuid('ID do setor inválido').optional(),
    subcategoriaId: z.string().uuid('ID da subcategoria inválido').optional().nullable(),
    marca: z.string().max(100, 'Marca muito longa').optional().nullable(),
    modelo: z.string().max(200, 'Modelo muito longo').optional().nullable(),
    numeroSerie: z.string().max(100, 'Número de série muito longo').optional().nullable(),
    valorAquisicao: z.number().positive('Valor de aquisição deve ser positivo').optional(),
    dataAquisicao: z
      .string()
      .datetime({ message: 'Data de aquisição inválida' })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .optional(),
    vidaUtilMeses: z.number().int().positive('Vida útil em meses deve ser positiva').optional(),
    estadoConservacao: estadoConservacaoEnum.optional(),
    situacao: situacaoBemEnum.optional(),
    observacoes: z.string().max(2000, 'Observações muito longas').optional().nullable(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar',
  })
  .refine(
    (data) => {
      if (!data.dataAquisicao) return true;
      const d = new Date(data.dataAquisicao);
      return !Number.isNaN(d.getTime());
    },
    { message: 'Data de aquisição inválida', path: ['dataAquisicao'] },
  );

export type UpdateBemDto = z.infer<typeof updateBemSchema>;
