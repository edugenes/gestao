import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const totalBens = await prisma.bem.count();
  const totalInv = await prisma.inventario.count();
  const totalItens = await prisma.inventarioItem.count();

  console.log('--- Resumo geral ---');
  console.log('Bens:', totalBens);
  console.log('Inventários:', totalInv);
  console.log('Itens de inventário:', totalItens);

  const ultimosInv = await prisma.inventario.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  for (const inv of ultimosInv) {
    const itensInv = await prisma.inventarioItem.count({
      where: { inventarioId: inv.id },
    });
    console.log(`Inventário ${inv.id} | "${inv.descricao}" | status=${inv.status} | itens=${itensInv}`);
  }
}

main()
  .catch((e) => {
    console.error('Erro no debug-inventarios:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

