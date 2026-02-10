import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lista fornecida pelo usuário: "código - nome do setor"
const SETORES_RAW = [
  '0001.01 - PRESIDENCIA-SECRETARIA',
  '0001.02 - PRESIDENCIA-SALA DE CONFERENCIA',
  '0001.03 - PRESIDENCIA-SALAO NOBRE',
  '0001.04 - CAMAROTE SPORT',
  '0001.05 - CAMAROTE SANTA CRUZ',
  '0001.06 - PRESIDENCIA-COPA',
  '0001.09 - PRESIDENCIA-GABINETE',
  '0002.01 - DEPARTAMENTO FINANCEIRO',
  '0002.02 - DEPARTAMENTO CONTABILIDADE',
  '0002.03 - PROTOCOLO',
  '0002.04 - ALMOXARIFADO',
  '0002.05 - ARQUIVO CENTRAL',
  '0002.06 - ARQUIVO FINANCEIRO',
  '0002.07 - TECNOLOGIA DA INFORMAÇÃO',
  '0002.08 - RECEPÇÃO PRINCIPAL - FPF',
  '0002.09 - HOTEL - FPF',
  '0002.10 - HALL DE ENTRADA - FPF',
  '0002.11 - DIRETORIA ADMINISTRATIVA E FINANCEIRA',
  '0002.15 - SALA 602',
  '0002.17 - PRO PESSOAL',
  '0002.18 - SALA 605',
  '0002.19 - SALA 603',
  '0002.20 - SALA 601',
  '0002.21 - BIBLIOTECA',
  '0002.22 - PATRIMONIO',
  '0002.23 - CONSELHO FISCAL',
  '0002.24 - DEPOSITO DO PATRIMONIO',
  '0002.25 - AREA COMUM 1º ANDAR',
  '0002.27 - SALA 606',
  '0002.28 - DEPOSITO DO PATRIMONIO SALA 304',
  '0004.01 - REGISTRO DE ATLETAS',
  '0004.02 - COMUNICAÇÃO',
  '0004.03 - CEAF',
  '0004.04 - DIRETORIA PROFISSIONAL',
  '0004.06 - DCO - ADMINISTRATIVO',
  '0004.07 - DIRETORIA NÃO PROFISSIONAL',
  '0006.02 - TJD - DIRETORIA',
  '0006.03 - TJD - SECRETARIA',
  '0006.04 - TJD - PROCURADORIA',
  '0006.05 - TJD - COPA',
  '0006.07 - TJD - PLENO',
  '0007.02 - ESCOLA DE ARBITRAGEM - SECRETARIA',
  '0007.03 - ESCOLA DE ARBITRAGEM - AUDITORIO',
  '77777.77 - BAIXADO',
  '8888.88 - DOADO',
  '9999.99 - INSERVIVEIS',
  'BCADV - RECEPÇÃO',
  'BCADV - SALA 603',
  'MARKTING',
  'TJD - PRESIDENCIA',
  '0008.08 - NÃO ENCONTRADO',
  '0002.12 - BENS DA ADMINISTRAÇÃO',
];

function parseLinha(linha: string): { codigo: string | null; nome: string } {
  const parts = linha.split(' - ');
  if (parts.length === 1) {
    return { codigo: null, nome: linha.trim() };
  }
  const [codigo, ...rest] = parts;
  return {
    codigo: codigo.trim() || null,
    nome: rest.join(' - ').trim(),
  };
}

async function main(): Promise<void> {
  console.log('Iniciando importação de setores (lista FPF)...');

  // Garante uma estrutura mínima: Unidade / Prédio / Andar / Centro de Custo
  const unidade = await prisma.unidade.upsert({
    where: { codigo: 'IMPORT-UNI' },
    create: { nome: 'Unidade Importação', codigo: 'IMPORT-UNI' },
    update: {},
  });

  const predio = await prisma.predio.findFirst({
    where: { unidadeId: unidade.id, codigo: 'IMPORT-PRED' },
  }).then(async (found) => {
    if (found) return found;
    return prisma.predio.create({
      data: { unidadeId: unidade.id, nome: 'Prédio Importação', codigo: 'IMPORT-PRED' },
    });
  });

  const andar = await prisma.andar.findFirst({
    where: { predioId: predio.id, codigo: 'IMPORT-ANDAR' },
  }).then(async (found) => {
    if (found) return found;
    return prisma.andar.create({
      data: { predioId: predio.id, nome: 'Andar Importação', codigo: 'IMPORT-ANDAR' },
    });
  });

  const centro = await prisma.centroCusto.upsert({
    where: { codigo: 'CC-IMPORT' },
    create: { codigo: 'CC-IMPORT', descricao: 'Centro de Custo Importação' },
    update: {},
  });

  let created = 0;
  let skipped = 0;

  for (const raw of SETORES_RAW) {
    const { codigo, nome } = parseLinha(raw);

    const exists = await prisma.setor.findFirst({
      where: {
        andarId: andar.id,
        OR: [
          codigo ? { codigo } : undefined,
          { nome },
        ].filter(Boolean) as any,
      },
    });

    if (exists) {
      skipped++;
      continue;
    }

    await prisma.setor.create({
      data: {
        andarId: andar.id,
        centroCustoId: centro.id,
        nome,
        codigo: codigo ?? undefined,
      },
    });
    created++;
  }

  console.log('Importação de setores concluída.');
  console.log('Setores criados :', created);
  console.log('Setores ignorados (já existiam):', skipped);
}

main()
  .catch((e) => {
    console.error('Erro na importação de setores:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

