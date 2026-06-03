import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, BarChart3, Package, PieChart, Layers, Printer, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { fetchDashboardStats, fetchBensPorSituacao, fetchDepreciacaoHistorico } from '@/lib/api-dashboard';
import { fetchBens, fetchCategorias } from '@/lib/api-bens';
import { fetchSetores } from '@/lib/api-estrutura';

// ──────────────────────────────────────────────────────────
// Formatação contábil brasileira
// ──────────────────────────────────────────────────────────
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Valor numérico em formato contábil: "1.234,56" (sem símbolo R$) */
function formatDecimalBR(value: number | null | undefined): string {
  if (value == null) return '';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Data no formato DD/MM/YYYY */
function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
}

/** Label de situação legível */
const SITUACAO_LABEL: Record<string, string> = {
  EM_USO: 'Em uso',
  EM_MANUTENCAO: 'Em manutenção',
  OCIOSO: 'Ocioso',
  BAIXADO: 'Baixado',
};

// ──────────────────────────────────────────────────────────
// CSV contábil
// ──────────────────────────────────────────────────────────
type CsvRow = {
  'Número Patrimonial': string;
  'Descrição': string;
  'Setor': string;
  'Categoria': string;
  'Marca': string;
  'Modelo': string;
  'Valor Aquisição (R$)': string;
  'Data Aquisição': string;
  'Situação': string;
};

function buildBensCsv(rows: CsvRow[], total: number): string {
  const HEADERS: (keyof CsvRow)[] = [
    'Número Patrimonial',
    'Descrição',
    'Setor',
    'Categoria',
    'Marca',
    'Modelo',
    'Valor Aquisição (R$)',
    'Data Aquisição',
    'Situação',
  ];

  const esc = (v: string) => {
    if (v.includes(';') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  const lines: string[] = [];
  lines.push(HEADERS.map(esc).join(';'));
  for (const row of rows) {
    lines.push(HEADERS.map((h) => esc(row[h] ?? '')).join(';'));
  }
  // Linha de totais
  const totalLine: string[] = HEADERS.map((h) => {
    if (h === 'Número Patrimonial') return esc(`TOTAL: ${rows.length} bens`);
    if (h === 'Valor Aquisição (R$)') return esc(formatDecimalBR(total));
    return '';
  });
  lines.push(totalLine.join(';'));
  return lines.join('\r\n');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ──────────────────────────────────────────────────────────
// Tipos e ordenação da tabela
// ──────────────────────────────────────────────────────────
type SortCol = 'numeroPatrimonial' | 'setorNome' | 'subcategoriaNome' | 'situacao' | 'valorAquisicao' | 'dataAquisicao';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 50;

// ──────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────
export default function Relatorios() {
  const [exporting, setExporting] = useState(false);
  const [filtroSetorId, setFiltroSetorId] = useState<string>('todos');
  const [filtroSituacao, setFiltroSituacao] = useState<string>('todas');
  const [filtroNumero, setFiltroNumero] = useState('');
  const [filtroCategoriaId, setFiltroCategoriaId] = useState<string>('todas');
  const [filtroValorMin, setFiltroValorMin] = useState('');
  const [filtroValorMax, setFiltroValorMax] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [mostrarGraficos, setMostrarGraficos] = useState(true);

  // Paginação e ordenação da tabela
  const [tablePage, setTablePage] = useState(1);
  const [sortCol, setSortCol] = useState<SortCol>('numeroPatrimonial');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (col: SortCol) => {
    if (col === sortCol) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
    setTablePage(1);
  };

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const { data: setoresData } = useQuery({
    queryKey: ['setores', 1, 1000],
    queryFn: () => fetchSetores({ page: 1, limit: 1000 }),
  });

  const { data: categoriasData } = useQuery({
    queryKey: ['categorias-relatorios'],
    queryFn: () => fetchCategorias({ limit: 500 }),
  });

  const { data: bensData, isFetching } = useQuery({
    queryKey: [
      'relatorio-bens',
      filtroSetorId,
      filtroSituacao,
      filtroNumero,
      filtroCategoriaId,
      filtroValorMin,
      filtroValorMax,
      filtroDataInicio,
      filtroDataFim,
    ],
    queryFn: () =>
      fetchBens({
        page: 1,
        limit: 5000,
        setorId: filtroSetorId !== 'todos' ? filtroSetorId : undefined,
        situacao: filtroSituacao !== 'todas' ? filtroSituacao : undefined,
        numeroPatrimonial: filtroNumero.trim() || undefined,
        categoriaId: filtroCategoriaId !== 'todas' ? filtroCategoriaId : undefined,
        valorMin: filtroValorMin ? Number(filtroValorMin.replace(',', '.')) : undefined,
        valorMax: filtroValorMax ? Number(filtroValorMax.replace(',', '.')) : undefined,
        dataInicio: filtroDataInicio || undefined,
        dataFim: filtroDataFim || undefined,
      }),
  });

  const bens = bensData?.data ?? [];
  const totalBens = bensData?.total ?? 0;
  const categorias = categoriasData?.data ?? [];

  // Valor total filtrado
  const valorTotal = useMemo(
    () => bens.reduce((acc, b) => acc + (b.valorAquisicao ?? 0), 0),
    [bens]
  );

  // Ordenação client-side
  const bensSorted = useMemo(() => {
    return [...bens].sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';
      switch (sortCol) {
        case 'numeroPatrimonial': va = a.numeroPatrimonial ?? ''; vb = b.numeroPatrimonial ?? ''; break;
        case 'setorNome': va = a.setorNome ?? ''; vb = b.setorNome ?? ''; break;
        case 'subcategoriaNome': va = a.subcategoriaNome ?? ''; vb = b.subcategoriaNome ?? ''; break;
        case 'situacao': va = a.situacao ?? ''; vb = b.situacao ?? ''; break;
        case 'valorAquisicao': va = a.valorAquisicao ?? 0; vb = b.valorAquisicao ?? 0; break;
        case 'dataAquisicao': va = a.dataAquisicao ?? ''; vb = b.dataAquisicao ?? ''; break;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [bens, sortCol, sortDir]);

  // Paginação client-side
  const totalPages = Math.max(1, Math.ceil(bensSorted.length / PAGE_SIZE));
  const bensPage = bensSorted.slice((tablePage - 1) * PAGE_SIZE, tablePage * PAGE_SIZE);

  // Reset de página ao mudar filtros/ordenação
  const resetPage = () => setTablePage(1);

  // Gráfico bens por setor
  const bensPorSetor = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of bens) {
      const nome = b.setorNome ?? b.setorId ?? 'Sem setor';
      map.set(nome, (map.get(nome) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([setor, qtd]) => ({ setor, qtd }))
      .sort((a, b) => b.qtd - a.qtd);
  }, [bens]);

  const { data: bensPorSituacao } = useQuery({
    queryKey: ['dashboard-bens-por-situacao'],
    queryFn: fetchBensPorSituacao,
  });

  const { data: depreciacaoHistorico } = useQuery({
    queryKey: ['dashboard-depreciacao-historico'],
    queryFn: fetchDepreciacaoHistorico,
  });

  // ── Exportar CSV contábil com todos os filtros ativos ──
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const all: CsvRow[] = [];
      let totalExport = 0;
      let page = 1;
      const limit = 1000;
      while (true) {
        const res = await fetchBens({
          page,
          limit,
          setorId: filtroSetorId !== 'todos' ? filtroSetorId : undefined,
          situacao: filtroSituacao !== 'todas' ? filtroSituacao : undefined,
          numeroPatrimonial: filtroNumero.trim() || undefined,
          categoriaId: filtroCategoriaId !== 'todas' ? filtroCategoriaId : undefined,
          valorMin: filtroValorMin ? Number(filtroValorMin.replace(',', '.')) : undefined,
          valorMax: filtroValorMax ? Number(filtroValorMax.replace(',', '.')) : undefined,
          dataInicio: filtroDataInicio || undefined,
          dataFim: filtroDataFim || undefined,
        });
        for (const b of res.data ?? []) {
          const valor = b.valorAquisicao ?? 0;
          totalExport += valor;
          all.push({
            'Número Patrimonial': b.numeroPatrimonial ?? '',
            'Descrição': [b.marca, b.modelo].filter(Boolean).join(' '),
            'Setor': b.setorNome ?? '',
            'Categoria': b.subcategoriaNome ?? '',
            'Marca': b.marca ?? '',
            'Modelo': b.modelo ?? '',
            'Valor Aquisição (R$)': formatDecimalBR(valor),
            'Data Aquisição': formatDateBR(b.dataAquisicao),
            'Situação': SITUACAO_LABEL[b.situacao ?? ''] ?? b.situacao ?? '',
          });
        }
        if ((res.data?.length ?? 0) < limit) break;
        page++;
      }
      const csv = buildBensCsv(all, totalExport);
      // BOM UTF-8 para Excel abrir corretamente
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      downloadBlob(blob, `bens-patrimonio-${new Date().toISOString().slice(0, 10)}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Ícone de ordenação ──
  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col) return <ChevronsUpDown className="inline h-3 w-3 ml-1 opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp className="inline h-3 w-3 ml-1" />
      : <ChevronDown className="inline h-3 w-3 ml-1" />;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Resumo patrimonial, filtros avançados, gráficos opcionais e exportação
          </p>
        </div>
      </div>

      {/* ── Filtros ── */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Setor</Label>
            <Select value={filtroSetorId} onValueChange={(v) => { setFiltroSetorId(v); resetPage(); }}>
              <SelectTrigger><SelectValue placeholder="Todos os setores" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                {setoresData?.data.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Situação do bem</Label>
            <Select value={filtroSituacao} onValueChange={(v) => { setFiltroSituacao(v); resetPage(); }}>
              <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="EM_USO">Em uso</SelectItem>
                <SelectItem value="EM_MANUTENCAO">Em manutenção</SelectItem>
                <SelectItem value="OCIOSO">Ocioso</SelectItem>
                <SelectItem value="BAIXADO">Baixado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Nº patrimonial (contém)</Label>
            <Input
              value={filtroNumero}
              onChange={(e) => { setFiltroNumero(e.target.value); resetPage(); }}
              placeholder="Ex: 2013000"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Categoria</Label>
            <Select value={filtroCategoriaId} onValueChange={(v) => { setFiltroCategoriaId(v); resetPage(); }}>
              <SelectTrigger><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Valor mín. (R$)</Label>
            <Input
              value={filtroValorMin}
              onChange={(e) => { setFiltroValorMin(e.target.value); resetPage(); }}
              placeholder="Ex: 1000"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Valor máx. (R$)</Label>
            <Input
              value={filtroValorMax}
              onChange={(e) => { setFiltroValorMax(e.target.value); resetPage(); }}
              placeholder="Ex: 50000"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Data aquisição (de)</Label>
            <Input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => { setFiltroDataInicio(e.target.value); resetPage(); }}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Data aquisição (até)</Label>
            <Input
              type="date"
              value={filtroDataFim}
              onChange={(e) => { setFiltroDataFim(e.target.value); resetPage(); }}
            />
          </div>

          <div className="flex items-center justify-start gap-3">
            <Switch id="toggle-graficos" checked={mostrarGraficos} onCheckedChange={setMostrarGraficos} />
            <Label htmlFor="toggle-graficos" className="text-sm">Mostrar gráficos</Label>
          </div>
        </div>
      </Card>

      {/* ── Cards de resumo + ações ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Resumo da seleção</h3>
              <p className="text-2xl font-bold text-foreground">
                {isFetching ? '…' : bens.length} bens
              </p>
              <p className="text-sm text-muted-foreground">
                Valor total filtrado: <span className="font-semibold text-foreground">{formatCurrency(valorTotal)}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Patrimônio geral: {stats?.totalBens ?? 0} bens ·{' '}
                {stats?.totalValorPatrimonial != null ? formatCurrency(stats.totalValorPatrimonial) : '—'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Download className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Relatório de bens</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize abaixo, imprima ou exporte para planilha.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button onClick={handleExportCsv} disabled={exporting || isFetching}>
                {exporting ? 'Exportando…' : 'Exportar CSV'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Tabela de pré-visualização ── */}
      <Card className="p-4 overflow-x-auto print:border-none">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-semibold">Bens encontrados</h2>
            <p className="text-xs text-muted-foreground">
              {isFetching
                ? 'Carregando…'
                : `${bens.length} bens · Valor total: ${formatCurrency(valorTotal)}`}
            </p>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                disabled={tablePage === 1}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span>
                Página {tablePage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                disabled={tablePage === totalPages}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {bens.length === 0 && !isFetching ? (
          <p className="text-sm text-muted-foreground">Nenhum bem encontrado para os filtros selecionados.</p>
        ) : (
          <>
            <table className="min-w-full text-xs md:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th
                    className="px-2 py-2 text-left font-medium cursor-pointer select-none whitespace-nowrap"
                    onClick={() => handleSort('numeroPatrimonial')}
                  >
                    Nº patrimonial <SortIcon col="numeroPatrimonial" />
                  </th>
                  <th
                    className="px-2 py-2 text-left font-medium cursor-pointer select-none"
                    onClick={() => handleSort('setorNome')}
                  >
                    Setor <SortIcon col="setorNome" />
                  </th>
                  <th
                    className="px-2 py-2 text-left font-medium cursor-pointer select-none"
                    onClick={() => handleSort('subcategoriaNome')}
                  >
                    Categoria <SortIcon col="subcategoriaNome" />
                  </th>
                  <th
                    className="px-2 py-2 text-left font-medium cursor-pointer select-none"
                    onClick={() => handleSort('situacao')}
                  >
                    Situação <SortIcon col="situacao" />
                  </th>
                  <th
                    className="px-2 py-2 text-right font-medium cursor-pointer select-none whitespace-nowrap"
                    onClick={() => handleSort('valorAquisicao')}
                  >
                    Valor aquisição <SortIcon col="valorAquisicao" />
                  </th>
                  <th
                    className="px-2 py-2 text-left font-medium cursor-pointer select-none whitespace-nowrap"
                    onClick={() => handleSort('dataAquisicao')}
                  >
                    Data aquisição <SortIcon col="dataAquisicao" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {bensPage.map((b) => (
                  <tr key={b.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20">
                    <td className="px-2 py-1 font-mono">{b.numeroPatrimonial}</td>
                    <td className="px-2 py-1">{b.setorNome ?? '—'}</td>
                    <td className="px-2 py-1">{b.subcategoriaNome ?? '—'}</td>
                    <td className="px-2 py-1">{SITUACAO_LABEL[b.situacao ?? ''] ?? b.situacao ?? '—'}</td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {b.valorAquisicao != null ? formatCurrency(b.valorAquisicao) : '—'}
                    </td>
                    <td className="px-2 py-1">
                      {b.dataAquisicao ? formatDateBR(b.dataAquisicao) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Linha de totais */}
              {bens.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/40 font-semibold">
                    <td className="px-2 py-2 text-xs" colSpan={4}>
                      Total: {bens.length} bem{bens.length !== 1 ? 'ns' : ''}
                      {totalBens > bens.length && ` (de ${totalBens} no banco)`}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-xs">
                      {formatCurrency(valorTotal)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>

            {/* Paginação inferior */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setTablePage(1)}
                  disabled={tablePage === 1}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                  disabled={tablePage === 1}
                >
                  ‹
                </Button>
                <span>
                  {tablePage} / {totalPages} — mostrando {(tablePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(tablePage * PAGE_SIZE, bens.length)} de {bens.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                  disabled={tablePage === totalPages}
                >
                  ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setTablePage(totalPages)}
                  disabled={tablePage === totalPages}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ── Gráficos ── */}
      {mostrarGraficos && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Bens por setor (amostra filtrada)</h3>
            </div>
            {bensPorSetor.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
            ) : (
              <div className="space-y-2">
                {bensPorSetor.slice(0, 10).map(({ setor, qtd }) => {
                  const perc = bens.length > 0 ? Math.round((qtd / bens.length) * 100) : 0;
                  return (
                    <div key={setor}>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="truncate pr-4">{setor}</span>
                        <span>{qtd} ({perc}%)</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${Math.min(100, (qtd / (bensPorSetor[0]?.qtd || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {bensPorSetor.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Mostrando top 10 setores de {bensPorSetor.length}.
                  </p>
                )}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Bens por situação (geral)</h3>
            </div>
            {bensPorSituacao == null || bensPorSituacao.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
            ) : (
              <div className="space-y-2">
                {(() => {
                  const total = bensPorSituacao.reduce((acc, i) => acc + i.quantidade, 0);
                  return bensPorSituacao.map((item) => {
                    const perc = total > 0 ? Math.round((item.quantidade / total) * 100) : 0;
                    const label = SITUACAO_LABEL[item.situacao] ?? item.situacao;
                    return (
                      <div key={item.situacao}>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{label}</span>
                          <span>{item.quantidade} ({perc}%)</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary/70"
                            style={{ width: `${perc}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </Card>

          <Card className="p-6 md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Histórico de depreciação (últimos meses)</h3>
            </div>
            {depreciacaoHistorico == null || depreciacaoHistorico.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado de depreciação disponível.</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-12 text-xs text-muted-foreground">
                  <div className="col-span-2">Mês</div>
                  <div className="col-span-5 text-right">Valor patrimonial</div>
                  <div className="col-span-5 text-right">Depreciação mensal</div>
                </div>
                {depreciacaoHistorico.map((item) => (
                  <div key={item.mes} className="grid grid-cols-12 items-center gap-2 text-sm">
                    <div className="col-span-2">{item.mes}</div>
                    <div className="col-span-5 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-2 rounded-full bg-primary/40" style={{ width: '100%' }} />
                      </div>
                      <span className="w-28 text-right text-xs">{formatCurrency(item.valorPatrimonial)}</span>
                    </div>
                    <div className="col-span-5 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${Math.min(100, (item.depreciacaoMensal / (stats?.totalValorPatrimonial || 1)) * 300)}%`,
                          }}
                        />
                      </div>
                      <span className="w-28 text-right text-xs">{formatCurrency(item.depreciacaoMensal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
