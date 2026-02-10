import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const csvPath = path.resolve('..', '..', '3.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('3.csv não encontrado em', csvPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, { encoding: 'utf8' });
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const headerIndex = lines.findIndex((l) => l.includes('Grupo;CODIGO;Dt.Aquisicao;Descr. Sint.;Status Bem;Dt. Ini AVP;Vl Aquisicao;C.Custo'));
  if (headerIndex === -1) {
    console.error('Cabeçalho esperado não encontrado na planilha 3.csv.');
    process.exit(1);
  }

  const header = lines[headerIndex].split(';');
  const idxCodigo = header.findIndex((h) => h.trim() === 'CODIGO');
  if (idxCodigo === -1) {
    console.error('Coluna CODIGO não encontrada na planilha.');
    process.exit(1);
  }

  const codigos = new Set<string>();
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const cols = lines[i].split(';');
    const codigo = (cols[idxCodigo] ?? '').trim();
    if (codigo) codigos.add(codigo);
  }

  const lista = Array.from(codigos);
  console.log('Total de códigos distintos na 3.csv:', lista.length);

  const existentes = await prisma.bem.findMany({
    where: { numeroPatrimonial: { in: lista } },
    select: { numeroPatrimonial: true },
  });
  const existentesSet = new Set(existentes.map((b) => b.numeroPatrimonial));

  const naoEncontrados = lista.filter((c) => !existentesSet.has(c));

  console.log('Códigos da 3.csv que NÃO existem em bens:', naoEncontrados.length);
  console.log('Exemplos (até 20):', naoEncontrados.slice(0, 20));
}

main()
  .catch((e) => {
    console.error('Erro no debug-bens-3csv:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

