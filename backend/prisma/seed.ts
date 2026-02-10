import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_ADMIN_LOGIN = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin';

const ESTADOS_CONSERVACAO = ['OTIMO', 'BOM', 'REGULAR', 'RUIM', 'PESSIMO'] as const;
const SITUACOES = ['EM_USO', 'EM_USO', 'EM_USO', 'EM_MANUTENCAO', 'OCIOSO'] as const;
const MARCAS = ['Dell', 'HP', 'Lenovo', 'Samsung', 'Acer', 'LG', 'Intelbras', 'Philips', 'Multilaser', 'Positivo'];
const MODELOS_MOVEIS = ['Standard', 'Executive', 'Compacto', 'Reforçado', 'Basico'];
const MODELOS_ELETRO = ['OptiPlex', 'ProDesk', 'ThinkCentre', 'All-in-One', 'Notebook'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

async function seedAdmin(): Promise<string> {
  const email = process.env.SEED_ADMIN_EMAIL ?? DEFAULT_ADMIN_LOGIN;
  const password = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

  let user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    user = await prisma.user.create({
      data: {
        email,
        name: 'Administrador',
        password: passwordHash,
        role: 'ADMIN',
      },
    });
    console.log('Usuário admin criado. Login:', email);
  }
  return user.id;
}

async function seedDemo(adminId: string): Promise<void> {
  const totalBens = await prisma.bem.count();
  if (totalBens >= 500) {
    console.log('Banco já possui 500+ bens. Demo seed ignorado.');
    return;
  }

  console.log('Criando estrutura organizacional...');
  const u1 = await prisma.unidade.upsert({
    where: { codigo: 'UNI-01' },
    create: { nome: 'Sede', codigo: 'UNI-01' },
    update: {},
  });
  const u2 = await prisma.unidade.upsert({
    where: { codigo: 'UNI-02' },
    create: { nome: 'Filial Centro', codigo: 'UNI-02' },
    update: {},
  });

  const prediosData = [
    { unidadeId: u1.id, nome: 'Bloco A', codigo: 'BL-A' },
    { unidadeId: u1.id, nome: 'Bloco B', codigo: 'BL-B' },
    { unidadeId: u2.id, nome: 'Prédio Principal', codigo: 'PRINC' },
  ];
  const predios: { id: string; unidadeId: string; nome: string; codigo: string | null }[] = [];
  for (const p of prediosData) {
    let predio = await prisma.predio.findFirst({ where: { unidadeId: p.unidadeId, nome: p.nome } });
    if (!predio) predio = await prisma.predio.create({ data: p });
    predios.push(predio);
  }

  const andaresDb: { id: string; predioId: string; nome: string }[] = [];
  for (const predio of predios) {
    for (let a = 1; a <= 3; a++) {
      let andar = await prisma.andar.findFirst({ where: { predioId: predio.id, nome: `${a}º Andar` } });
      if (!andar) andar = await prisma.andar.create({ data: { predioId: predio.id, nome: `${a}º Andar` } });
      andaresDb.push(andar);
    }
  }

  const centros = await Promise.all([
    prisma.centroCusto.upsert({ where: { codigo: 'CC-ADM' }, create: { codigo: 'CC-ADM', descricao: 'Administrativo' }, update: {} }),
    prisma.centroCusto.upsert({ where: { codigo: 'CC-TI' }, create: { codigo: 'CC-TI', descricao: 'Tecnologia' }, update: {} }),
    prisma.centroCusto.upsert({ where: { codigo: 'CC-FIN' }, create: { codigo: 'CC-FIN', descricao: 'Financeiro' }, update: {} }),
    prisma.centroCusto.upsert({ where: { codigo: 'CC-RH' }, create: { codigo: 'CC-RH', descricao: 'Recursos Humanos' }, update: {} }),
    prisma.centroCusto.upsert({ where: { codigo: 'CC-OP' }, create: { codigo: 'CC-OP', descricao: 'Operações' }, update: {} }),
  ]);

  const nomesSetores = ['Recepção', 'TI', 'Financeiro', 'RH', 'Diretoria', 'Almoxarifado', 'Atendimento', 'Arquivo', 'Copiadora', 'Sala Reunião'];
  let sIdx = 0;
  for (const andar of andaresDb) {
    const qtd = randomInt(2, 4);
    for (let k = 0; k < qtd; k++) {
      const nome = nomesSetores[sIdx % nomesSetores.length] + ' ' + andar.nome;
      const codigo = `SET-${String(sIdx + 1).padStart(2, '0')}`;
      const existe = await prisma.setor.findFirst({ where: { andarId: andar.id, codigo } });
      if (!existe) {
        await prisma.setor.create({
          data: {
            andarId: andar.id,
            centroCustoId: centros[sIdx % centros.length].id,
            nome,
            codigo,
          },
        });
      }
      sIdx++;
    }
  }
  const setores = await prisma.setor.findMany();
  if (setores.length === 0) throw new Error('Nenhum setor criado');

  console.log('Criando categorias e subcategorias...');
  const catInfo = [
    { nome: 'Móveis', codigo: 'MOV', sub: ['Cadeira', 'Mesa', 'Armário', 'Estante', 'Balcão'] },
    { nome: 'Equipamentos de Informática', codigo: 'INF', sub: ['Computador', 'Monitor', 'Notebook', 'Impressora', 'No-break'] },
    { nome: 'Ar Condicionado', codigo: 'AR', sub: ['Split', 'Janela', 'Central'] },
    { nome: 'Comunicação', codigo: 'COM', sub: ['Telefone', 'Roteador', 'Switch'] },
    { nome: 'Outros', codigo: 'OUT', sub: ['Diversos'] },
  ];
  const subcategoriasIds: string[] = [];
  for (const c of catInfo) {
    const cat = await prisma.categoria.upsert({
      where: { codigo: c.codigo },
      create: { nome: c.nome, codigo: c.codigo },
      update: {},
    });
    for (const sub of c.sub) {
      let subcat = await prisma.subcategoria.findFirst({
        where: { categoriaId: cat.id, nome: sub },
      });
      if (!subcat) {
        subcat = await prisma.subcategoria.create({
          data: { categoriaId: cat.id, nome: sub },
        });
      }
      subcategoriasIds.push(subcat.id);
    }
  }
  const subcategoriasDb = await prisma.subcategoria.findMany();
  if (subcategoriasDb.length === 0) throw new Error('Nenhuma subcategoria');

  console.log('Criando 500 bens...');
  const bensToCreate = 500 - totalBens;
  const prefixoNumero = 'PAT-' + Date.now().toString(36).toUpperCase().slice(-4) + '-';
  const bensCreated: { id: string; setorId: string; dataAquisicao: Date }[] = [];

  for (let i = 0; i < bensToCreate; i++) {
    const numPat = prefixoNumero + String(i + 1).padStart(4, '0');
    const setor = setores[randomInt(0, setores.length - 1)];
    const subcat = subcategoriasDb[randomInt(0, subcategoriasDb.length - 1)];
    const dataAquisicao = new Date(2020 + randomInt(0, 4), randomInt(0, 11), randomInt(1, 28));
    const valor = Number((randomInt(200, 15000) + Math.random() * 500).toFixed(2));
    const vidaUtil = [24, 36, 48, 60, 84][randomInt(0, 4)];
    const bem = await prisma.bem.create({
      data: {
        numeroPatrimonial: numPat,
        setorId: setor.id,
        subcategoriaId: subcat.id,
        marca: randomItem(MARCAS),
        modelo: randomItem([...MODELOS_MOVEIS, ...MODELOS_ELETRO]),
        numeroSerie: 'SN-' + randomInt(100000, 999999),
        valorAquisicao: valor,
        dataAquisicao,
        vidaUtilMeses: vidaUtil,
        estadoConservacao: randomItem(ESTADOS_CONSERVACAO),
        situacao: randomItem(SITUACOES),
        observacoes: randomInt(0, 10) > 8 ? 'Item para revisão' : null,
      },
    });
    bensCreated.push({ id: bem.id, setorId: setor.id, dataAquisicao: dataAquisicao });
  }
  const todosBens = await prisma.bem.findMany({ select: { id: true, setorId: true } });
  console.log('Total de bens no banco:', todosBens.length);

  console.log('Criando movimentações...');
  const tipos = ['TRANSFERENCIA', 'EMPRESTIMO', 'DEVOLUCAO'] as const;
  let movCount = 0;
  for (let m = 0; m < 550; m++) {
    const bem = todosBens[randomInt(0, todosBens.length - 1)];
    const setorOrigem = bem.setorId;
    let setorDestino: string | null = setores[randomInt(0, setores.length - 1)].id;
    if (setorDestino === setorOrigem) {
      const idx = setores.findIndex((s: { id: string }) => s.id === setorOrigem);
      setorDestino = setores[(idx + 1) % setores.length].id;
    }
    const tipo = randomItem(tipos);
    const dataMov = new Date(2022, randomInt(0, 11), randomInt(1, 28));
    try {
      await prisma.movimentacao.create({
        data: {
          bemId: bem.id,
          tipo,
          setorOrigemId: setorOrigem,
          setorDestinoId: tipo === 'TRANSFERENCIA' ? setorDestino : null,
          dataMovimentacao: dataMov,
          dataDevolucao: tipo === 'EMPRESTIMO' ? addMonths(dataMov, 1) : null,
          observacoes: 'Movimentação gerada pelo seed de teste.',
          userId: adminId,
        },
      });
      movCount++;
    } catch {
      // ignora duplicidade ou restrição
    }
  }
  console.log('Movimentações criadas:', movCount);

  console.log('Criando inventários...');
  let inv1 = await prisma.inventario.findFirst({ where: { descricao: 'Inventário Geral 2024' } });
  if (!inv1) {
    inv1 = await prisma.inventario.create({
      data: {
        descricao: 'Inventário Geral 2024',
        dataInicio: new Date(2024, 0, 1),
        dataFim: new Date(2024, 5, 30),
        status: 'FECHADO',
      },
    });
  }
  let inv2 = await prisma.inventario.findFirst({ where: { descricao: 'Inventário Parcial 2025' } });
  if (!inv2) {
    inv2 = await prisma.inventario.create({
      data: {
        descricao: 'Inventário Parcial 2025',
        dataInicio: new Date(2025, 0, 1),
        status: 'ABERTO',
      },
    });
  }
  const itensInv1 = await prisma.inventarioItem.count({ where: { inventarioId: inv1.id } });
  const sampleBens = todosBens.slice(0, 80);
  for (const b of sampleBens) {
    if (itensInv1 >= 80) break;
    const jaExiste = await prisma.inventarioItem.findFirst({ where: { inventarioId: inv1.id, bemId: b.id } });
    if (jaExiste) continue;
    await prisma.inventarioItem.create({
      data: {
        inventarioId: inv1.id,
        bemId: b.id,
        conferido: Math.random() > 0.2,
        dataConferencia: Math.random() > 0.2 ? new Date(2024, 4, 15) : null,
        userId: adminId,
      },
    });
  }
  for (const b of todosBens.slice(80, 150)) {
    const jaExiste = await prisma.inventarioItem.findFirst({ where: { inventarioId: inv2.id, bemId: b.id } });
    if (jaExiste) continue;
    await prisma.inventarioItem.create({
      data: { inventarioId: inv2.id, bemId: b.id, conferido: false },
    });
  }
  console.log('Inventários e itens criados.');

  console.log('Criando fornecedores e manutenções...');
  const fornNomes = [
    { nome: 'Assistência Técnica Info Ltda', contato: '(11) 3333-0000' },
    { nome: 'Manutenção Predial SA', contato: '(11) 4444-0000' },
    { nome: 'Refrigeração e Clima', contato: '(11) 5555-0000' },
  ];
  const forn: { id: string }[] = [];
  for (const f of fornNomes) {
    let found = await prisma.fornecedor.findFirst({ where: { nome: f.nome } });
    if (!found) found = await prisma.fornecedor.create({ data: f });
    forn.push(found);
  }
  for (let t = 0; t < 40; t++) {
    const b = todosBens[randomInt(0, todosBens.length - 1)];
    const dataInicio = new Date(2023, randomInt(0, 11), randomInt(1, 28));
    await prisma.manutencao.create({
      data: {
        bemId: b.id,
        tipo: randomItem(['PREVENTIVA', 'CORRETIVA']),
        dataInicio,
        dataFim: addMonths(dataInicio, 0),
        custo: randomInt(100, 2000) + 0.99,
        fornecedorId: forn[randomInt(0, forn.length - 1)].id,
        observacoes: 'Manutenção seed.',
      },
    });
  }
  console.log('Manutenções criadas.');

  console.log('Criando depreciações...');
  const bensParaDepreciacao = todosBens.slice(0, 150);
  const mesesRef = [new Date(2024, 0, 1), new Date(2024, 5, 1), new Date(2024, 11, 1)];
  for (const bem of bensParaDepreciacao) {
    const bemFull = await prisma.bem.findUnique({ where: { id: bem.id } });
    if (!bemFull) continue;
    const valorDep = Number(bemFull.valorAquisicao) / (bemFull.vidaUtilMeses || 60);
    for (const mes of mesesRef) {
      await prisma.depreciacao.create({
        data: {
          bemId: bem.id,
          mesReferencia: mes,
          valorDepreciado: Math.round(valorDep * 100) / 100,
          metodo: 'LINEAR',
        },
      });
    }
  }
  console.log('Depreciações criadas.');

  console.log('Criando baixas (amostra)...');
  const bensParaBaixa = todosBens.slice(400, 415);
  const motivos = ['OBSOLESCENCIA', 'PERDA', 'DOACAO', 'VENDA'] as const;
  for (const b of bensParaBaixa) {
    const jaTemBaixa = await prisma.baixa.findUnique({ where: { bemId: b.id } });
    if (jaTemBaixa) continue;
    await prisma.bem.update({ where: { id: b.id }, data: { situacao: 'BAIXADO' } });
    await prisma.baixa.create({
      data: {
        bemId: b.id,
        dataBaixa: new Date(2024, randomInt(0, 11), randomInt(1, 28)),
        motivo: randomItem(motivos),
        valorRealizado: randomInt(0, 10) > 6 ? randomInt(50, 500) + 0.5 : null,
        observacoes: 'Baixa seed teste.',
        userId: adminId,
      },
    });
  }
  console.log('Baixas criadas.');

  console.log('Demo seed concluído: 500 bens, movimentações, inventários, manutenções, depreciações e baixas.');
}

async function main(): Promise<void> {
  const adminId = await seedAdmin();
  await seedDemo(adminId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
