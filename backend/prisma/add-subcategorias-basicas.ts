import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIAS_BASICAS: Array<{ codigo: string; nome: string }> = [
  { codigo: 'INF', nome: 'Informática' },
  { codigo: 'MOB', nome: 'Mobiliário' },
  { codigo: 'VEI', nome: 'Veículos' },
  { codigo: 'EQP', nome: 'Equipamentos' },
  { codigo: 'MED', nome: 'Equipamentos médicos' },
  { codigo: 'UTI', nome: 'Utensílios' },
  { codigo: 'IMP', nome: 'Bens importados (planilha)' },
];

async function main(): Promise<void> {
  for (const item of CATEGORIAS_BASICAS) {
    // Garante que a categoria exista
    const categoria = await prisma.categoria.upsert({
      where: { codigo: item.codigo },
      update: { nome: item.nome, active: true, deletedAt: null },
      create: {
        nome: item.nome,
        codigo: item.codigo,
        active: true,
      },
    });

    // Cria uma subcategoria "espelho" da categoria, se ainda não existir
    const existingSub = await prisma.subcategoria.findFirst({
      where: {
        categoriaId: categoria.id,
        nome: item.nome,
        deletedAt: null,
      },
    });

    if (!existingSub) {
      await prisma.subcategoria.create({
        data: {
          categoriaId: categoria.id,
          nome: item.nome,
          codigo: item.codigo,
          active: true,
        },
      });
    }
  }

  // Garante que a subcategoria usada pela importação continue ativa
  await prisma.subcategoria.updateMany({
    where: { nome: 'Bens importados (planilha)' },
    data: { active: true, deletedAt: null },
  });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Erro ao adicionar subcategorias básicas:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

