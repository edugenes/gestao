import { PrismaClient, EstadoConservacao, SituacaoBem } from '@prisma/client';
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
  // Remove separador de milhar e normaliza vírgula decimal
  const normalized = v.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isNaN(n) ? 0 : n;
}

function mapConservacao(raw: string): EstadoConservacao {
  const v = raw.trim().toUpperCase();
  if (v.includes('ÓTIMO') || v.includes('OTIMO')) return 'OTIMO';
  if (v.includes('RUIM')) return 'RUIM';
  if (v.includes('PÉSSIMO') || v.includes('PESSIMO')) return 'PESSIMO';
  if (v.includes('REGULAR')) return 'REGULAR';
  // "Normal" ou vazio consideramos BOM
  return 'BOM';
}

function mapSituacao(raw: string): SituacaoBem {
  const v = raw.trim().toUpperCase();
  if (v.includes('MANUT')) return 'EM_MANUTENCAO';
  if (v.includes('OCIOS')) return 'OCIOSO';
  if (v.includes('BAIX')) return 'BAIXADO';
  return 'EM_USO';
}

async function main(): Promise<void> {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Uso: ts-node prisma/import-bens-imobilizado.ts <caminho-do-arquivo.csv>');
    process.exit(1);
  }

  const fullPath = path.resolve(csvPath);
  if (!fs.existsSync(fullPath)) {
    console.error('Arquivo não encontrado:', fullPath);
    process.exit(1);
  }

  console.log('Iniciando importação de bens a partir de:', fullPath);

  // Garante estrutura mínima (unidade/predio/andar/setor/categoria/subcategoria padrão)
  const unidade = await prisma.unidade.upsert({
    where: { codigo: 'IMPORT-UNI' },
    create: { nome: 'Unidade Importação', codigo: 'IMPORT-UNI' },
    update: {},
  });

  const predio = await prisma.predio.create({
    data: {
      unidadeId: unidade.id,
      nome: 'Prédio Importação',
      codigo: 'IMPORT-PRED',
    },
  }).catch(async () => {
    const existing = await prisma.predio.findFirst({
      where: { unidadeId: unidade.id, codigo: 'IMPORT-PRED' },
    });
    if (!existing) throw new Error('Não foi possível obter prédio padrão para importação.');
    return existing;
  });

  const andar = await prisma.andar.create({
    data: { predioId: predio.id, nome: 'Andar Importação', codigo: 'IMPORT-ANDAR' },
  }).catch(async () => {
    const existing = await prisma.andar.findFirst({
      where: { predioId: predio.id, codigo: 'IMPORT-ANDAR' },
    });
    if (!existing) throw new Error('Não foi possível obter andar padrão para importação.');
    return existing;
  });

  const centro = await prisma.centroCusto.upsert({
    where: { codigo: 'CC-IMPORT' },
    create: { codigo: 'CC-IMPORT', descricao: 'Centro de Custo Importação' },
    update: {},
  });

  const setor = await prisma.setor.create({
    data: {
      andarId: andar.id,
      centroCustoId: centro.id,
      nome: 'Setor Importação',
      codigo: 'SET-IMPORT',
    },
  }).catch(async () => {
    const existing = await prisma.setor.findFirst({
      where: { andarId: andar.id, codigo: 'SET-IMPORT' },
    });
    if (!existing) throw new Error('Não foi possível obter setor padrão para importação.');
    return existing;
  });

  const categoria = await prisma.categoria.upsert({
    where: { codigo: 'IMPORT' },
    create: { nome: 'Importados', codigo: 'IMPORT' },
    update: {},
  });

  const subcategoria = await prisma.subcategoria.create({
    data: { categoriaId: categoria.id, nome: 'Bens importados (planilha)' },
  }).catch(async () => {
    const existing = await prisma.subcategoria.findFirst({
      where: { categoriaId: categoria.id, nome: 'Bens importados (planilha)' },
    });
    if (!existing) throw new Error('Não foi possível obter subcategoria padrão para importação.');
    return existing;
  });

  const raw = fs.readFileSync(fullPath, { encoding: 'utf8' });
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const headerIndex = lines.findIndex((l) => l.startsWith('Grupo;Indice AVP;Classificac.;Cod. do Bem;Item;'));
  if (headerIndex === -1) {
    console.error('Cabeçalho esperado não encontrado na planilha.');
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

  const idxCodBem = colIndex('Cod. do Bem');
  const idxDescr = colIndex('Descr. Sint.');
  const idxNumPlaqueta = colIndex('Num.Plaqueta');
  const idxDtAquis = colIndex('Dt.Aquisicao');
  const idxStatusBem = colIndex('Status Bem');
  const idxConservacao = header.findIndex((h) => h.trim().startsWith('Conservacao'));
  const idxValorAquis = header.findIndex((h) => h.trim().startsWith('Vl Aquisicao'));

  if (idxConservacao === -1 || idxValorAquis === -1) {
    throw new Error('Colunas "Conservacao" ou "Vl Aquisicao" não encontradas no cabeçalho.');
  }

  let imported = 0;
  let skippedSemPlaqueta = 0;
  let skippedDuplicado = 0;

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.startsWith(';;;;')) continue;

    const cols = line.split(';');
    const numPlaqueta = (cols[idxNumPlaqueta] ?? '').trim();
    if (!numPlaqueta) {
      skippedSemPlaqueta++;
      continue;
    }

    const existing = await prisma.bem.findUnique({
      where: { numeroPatrimonial: numPlaqueta },
    });
    if (existing) {
      skippedDuplicado++;
      continue;
    }

    const codBem = (cols[idxCodBem] ?? '').trim();
    const descr = (cols[idxDescr] ?? '').trim();
    const dtAquis = parseDateBr(cols[idxDtAquis] ?? '');
    const valor = parseDecimalBr(cols[idxValorAquis] ?? '');
    const statusBem = cols[idxStatusBem] ?? '';
    const conservacaoRaw = cols[idxConservacao] ?? '';

    if (!dtAquis) {
      // Sem data, ignora linha – dado contábil inconsistente
      continue;
    }

    const estadoConservacao = mapConservacao(conservacaoRaw);
    const situacao = mapSituacao(statusBem);

    // Vida útil técnica padrão (pode ser refinada por categoria depois)
    const vidaUtilMeses = 120;

    const observacoesPartes: string[] = [];
    if (descr) observacoesPartes.push(`Descrição contábil: ${descr}`);
    if (codBem) observacoesPartes.push(`Cod. Bem legado: ${codBem}`);
    const observacoes = observacoesPartes.length ? observacoesPartes.join(' | ') : null;

    await prisma.bem.create({
      data: {
        numeroPatrimonial: numPlaqueta,
        setorId: setor.id,
        subcategoriaId: subcategoria.id,
        marca: null,
        modelo: null,
        numeroSerie: null,
        valorAquisicao: valor,
        dataAquisicao: dtAquis,
        vidaUtilMeses,
        garantiaMeses: null,
        estadoConservacao,
        situacao,
        observacoes,
      },
    });
    imported++;
  }

  console.log('Importação concluída.');
  console.log('Bens importados       :', imported);
  console.log('Ignorados sem plaqueta:', skippedSemPlaqueta);
  console.log('Ignorados duplicados  :', skippedDuplicado);
}

main()
  .catch((e) => {
    console.error('Erro na importação:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

