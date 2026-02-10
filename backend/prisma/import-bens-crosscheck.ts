import { PrismaClient, SituacaoBem } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function parseDateBr(value: string): Date | null {
  const v = value.trim();
  if (!v || v === '  /  /') return null;
  const [d, m, y] = v.split('/');
  if (!d || !m || !y) return null;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function parseDecimalBr(value: string): number {
  const v = value.trim();
  if (!v) return 0;
  const normalized = v.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isNaN(n) ? 0 : n;
}

function mapSituacao(raw: string): SituacaoBem {
  const v = raw.trim().toUpperCase();
  if (v.includes('MANUT')) return 'EM_MANUTENCAO';
  if (v.includes('OCIOS')) return 'OCIOSO';
  if (v.includes('BAIX')) return 'BAIXADO';
  return 'EM_USO';
}

function parseCcusto(raw: string): { codigo: string | null; nome: string | null } {
  const v = raw.trim();
  if (!v) return { codigo: null, nome: null };
  const parts = v.split(' - ');
  if (parts.length === 1) {
    return { codigo: null, nome: v };
  }
  const [codigo, ...rest] = parts;
  return {
    codigo: codigo.trim() || null,
    nome: rest.join(' - ').trim() || null,
  };
}

async function main(): Promise<void> {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Uso: ts-node prisma/import-bens-crosscheck.ts <caminho-do-arquivo-3.csv>');
    process.exit(1);
  }

  const fullPath = path.resolve(csvPath);
  if (!fs.existsSync(fullPath)) {
    console.error('Arquivo não encontrado:', fullPath);
    process.exit(1);
  }

  console.log('Iniciando cross-check de bens a partir de:', fullPath);

  // Base para categoria/subcategoria padrão (reutiliza estrutura de importação)
  const categoria = await prisma.categoria.upsert({
    where: { codigo: 'IMPORT' },
    create: { nome: 'Importados', codigo: 'IMPORT' },
    update: {},
  });

  const subcategoria = await prisma.subcategoria.findFirst({
    where: { categoriaId: categoria.id, nome: 'Bens importados (planilha)' },
  }).then(async (found) => {
    if (found) return found;
    return prisma.subcategoria.create({
      data: { categoriaId: categoria.id, nome: 'Bens importados (planilha)' },
    });
  });

  const raw = fs.readFileSync(fullPath, { encoding: 'utf8' });
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const headerIndex = lines.findIndex((l) => l.includes('Grupo;CODIGO;Dt.Aquisicao;Descr. Sint.;Status Bem;Dt. Ini AVP;Vl Aquisicao;C.Custo'));
  if (headerIndex === -1) {
    console.error('Cabeçalho esperado não encontrado na planilha (Grupo;CODIGO;...).');
    process.exit(1);
  }

  const header = lines[headerIndex].split(';');
  const colIndex = (name: string): number => {
    const idx = header.findIndex((h) => h.trim() === name.trim());
    if (idx === -1) {
      throw new Error(`Coluna "${name}" não encontrada no cabeçalho.`);
    }
    return idx;
  };

  const idxCodigo = colIndex('CODIGO');
  const idxDtAquis = colIndex('Dt.Aquisicao');
  const idxDescr = colIndex('Descr. Sint.');
  const idxStatusBem = colIndex('Status Bem');
  const idxValor = colIndex('Vl Aquisicao');
  const idxCcusto = colIndex('C.Custo');

  let novos = 0;
  let atualizadosSetor = 0;
  let semSetor = 0;
  let linhasSemCodigo = 0;

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.startsWith(';;;;')) continue;

    const cols = line.split(';');
    const codigoBem = (cols[idxCodigo] ?? '').trim();
    if (!codigoBem) {
      linhasSemCodigo++;
      continue;
    }

    const rawDtAquis = cols[idxDtAquis] ?? '';
    let dtAquis = parseDateBr(rawDtAquis);
    const descr = (cols[idxDescr] ?? '').trim();
    const statusBem = (cols[idxStatusBem] ?? '').trim();
    const valor = parseDecimalBr(cols[idxValor] ?? '');
    const ccustoRaw = cols[idxCcusto] ?? '';

    const { codigo: codSetor, nome: nomeSetor } = parseCcusto(ccustoRaw);

    const setor = await prisma.setor.findFirst({
      where: {
        OR: [
          codSetor ? { codigo: codSetor } : undefined,
          nomeSetor ? { nome: nomeSetor } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (!setor) {
      semSetor++;
      console.warn(`Linha ${i + 1}: setor não encontrado para C.Custo="${ccustoRaw}". Bem ${codigoBem} ignorado.`);
      continue;
    }

    const existing = await prisma.bem.findUnique({
      where: { numeroPatrimonial: codigoBem },
    });

    if (!existing) {
      if (!dtAquis) {
        // Fallback seguro: usa data padrão técnica e registra a original nas observações.
        dtAquis = new Date(2000, 0, 1);
      }

      const situacao = mapSituacao(statusBem);
      const observacoesPartes: string[] = [];
      if (descr) observacoesPartes.push(`Descrição contábil (3.csv): ${descr}`);
      if (ccustoRaw.trim()) observacoesPartes.push(`Local contábil: ${ccustoRaw.trim()}`);
      if (rawDtAquis.trim()) observacoesPartes.push(`Data aquisição original (3.csv): ${rawDtAquis.trim()}`);
      const observacoes = observacoesPartes.length ? observacoesPartes.join(' | ') : null;

      await prisma.bem.create({
        data: {
          numeroPatrimonial: codigoBem,
          setorId: setor.id,
          subcategoriaId: subcategoria.id,
          marca: null,
          modelo: null,
          numeroSerie: null,
          valorAquisicao: valor,
          dataAquisicao: dtAquis,
          vidaUtilMeses: 120,
          garantiaMeses: null,
          estadoConservacao: 'BOM',
          situacao,
          observacoes,
        },
      });
      novos++;
      continue;
    }

    // Bem já existe: atualiza apenas localização (setor) se estiver diferente
    if (existing.setorId !== setor.id) {
      const oldSetorId = existing.setorId;
      await prisma.bem.update({
        where: { id: existing.id },
        data: { setorId: setor.id },
      });

      await prisma.bemHistorico.create({
        data: {
          bemId: existing.id,
          campo: 'setorId',
          valorAnterior: oldSetorId,
          valorNovo: setor.id,
          userId: null,
        },
      });

      atualizadosSetor++;
    }
  }

  console.log('Cross-check concluído.');
  console.log('Novos bens criados           :', novos);
  console.log('Bens com setor atualizado    :', atualizadosSetor);
  console.log('Linhas sem código de bem     :', linhasSemCodigo);
  console.log('Linhas sem setor mapeado     :', semSetor);
}

main()
  .catch((e) => {
    console.error('Erro no cross-check:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

