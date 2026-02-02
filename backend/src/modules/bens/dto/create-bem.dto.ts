import { z } from 'zod';
import { EstadoConservacao, SituacaoBem } from '@prisma/client';

const estadoConservacaoEnum = z.nativeEnum(EstadoConservacao);
const situacaoBemEnum = z.nativeEnum(SituacaoBem);

export const createBemSchema = z.object({
  numeroPatrimonial: z
    .string()
    .min(1, 'Número patrimonial obrigatório')
    .max(50, 'Número patrimonial muito longo'),
  setorId: z.string().uuid('ID do setor inválido'),
  subcategoriaId: z.string().uuid('ID da subcategoria inválido').optional().nullable(),
  marca: z.string().max(100, 'Marca muito longa').optional().nullable(),
  modelo: z.string().max(200, 'Modelo muito longo').optional().nullable(),
  numeroSerie: z.string().max(100, 'Número de série muito longo').optional().nullable(),
  valorAquisicao: z.number().positive('Valor de aquisição deve ser positivo'),
  dataAquisicao: z.string().datetime({ message: 'Data de aquisição inválida' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  vidaUtilMeses: z.number().int().positive('Vida útil em meses deve ser positiva'),
  estadoConservacao: estadoConservacaoEnum,
  situacao: situacaoBemEnum.optional().default('EM_USO'),
  observacoes: z.string().max(2000, 'Observações muito longas').optional().nullable(),
}).refine(
  (data) => {
    const d = typeof data.dataAquisicao === 'string' ? new Date(data.dataAquisicao) : data.dataAquisicao;
    return !Number.isNaN(d.getTime());
  },
  { message: 'Data de aquisição inválida', path: ['dataAquisicao'] },
);

export type CreateBemDto = z.infer<typeof createBemSchema>;
