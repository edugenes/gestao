import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, BarChart3, Package, PieChart, Layers, Printer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { fetchDashboardStats, fetchBensPorSituacao, fetchDepreciacaoHistorico } from '@/lib/api-dashboard';
import { fetchBens } from '@/lib/api-bens';
import { fetchSetores } from '@/lib/api-estrutura';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function buildBensCsv(rows: Array<Record<string, string | number | null>>): string {
  const headers = ['Número Patrimonial', 'Setor', 'Subcategoria', 'Marca', 'Modelo', 'Valor Aquisição', 'Data Aquisição', 'Situação'];
  const escape = (v: string | number | null) => {
    const s = v == null ? '' : String(v);
    return s.includes(';') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(';'), ...rows.map((r) => headers.map((h) => escape(r[h] ?? null)).join(';'))].join('\r\n');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Relatorios() {
  const [exporting, setExporting] = useState(false);
  const [filtroSetorId, setFiltroSetorId] = useState<string | 'todos'>('todos');
  const [filtroSituacao, setFiltroSituacao] = useState<string | 'todas'>('todas');
  const [filtroNumero, setFiltroNumero] = useState('');
  const [mostrarGraficos, setMostrarGraficos] = useState(true);

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const { data: setoresData } = useQuery({
    queryKey: ['setores', 1, 1000],
    queryFn: () => fetchSetores({ page: 1, limit: 1000 }),
  });

  const { data: bensData } = useQuery({
    queryKey: ['relatorio-bens', 1, 5000, filtroSetorId, filtroSituacao, filtroNumero],
    queryFn: () =>
      fetchBens({
        page: 1,
        limit: 5000,
        setorId: filtroSetorId !== 'todos' ? filtroSetorId : undefined,
        situacao: filtroSituacao !== 'todas' ? filtroSituacao : undefined,
        numeroPatrimonial: filtroNumero.trim() || undefined,
      }),
  });

  const bens = bensData?.data ?? [];
  const totalBens = bensData?.total ?? 0;

  const bensPorSetor = (() => {
    const map = new Map<string, number>();
    for (const b of bens) {
      const nome = b.setorNome ?? b.setorId ?? 'Sem setor';
      map.set(nome, (map.get(nome) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([setor, qtd]) => ({ setor, qtd }))
      .sort((a, b) => b.qtd - a.qtd);
  })();

  const { data: bensPorSituacao } = useQuery({
    queryKey: ['dashboard-bens-por-situacao'],
    queryFn: fetchBensPorSituacao,
  });

  const { data: depreciacaoHistorico } = useQuery({
    queryKey: ['dashboard-depreciacao-historico'],
    queryFn: fetchDepreciacaoHistorico,
  });

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const all: Array<Record<string, string | number | null>> = [];
      let page = 1;
      const limit = 1000;
      while (true) {
        const res = await fetchBens({
          page,
          limit,
          setorId: filtroSetorId !== 'todos' ? filtroSetorId : undefined,
          situacao: filtroSituacao !== 'todas' ? filtroSituacao : undefined,
          numeroPatrimonial: filtroNumero.trim() || undefined,
        });
        for (const b of res.data ?? []) {
          all.push({
            'Número Patrimonial': b.numeroPatrimonial,
            'Setor': b.setorNome ?? null,
            'Subcategoria': b.subcategoriaNome ?? null,
            'Marca': b.marca ?? null,
            'Modelo': b.modelo ?? null,
            'Valor Aquisição': b.valorAquisicao,
            'Data Aquisição': b.dataAquisicao?.slice(0, 10) ?? null,
            'Situação': b.situacao ?? null,
          });
        }
        if ((res.data?.length ?? 0) < limit) break;
        page++;
      }
      const csv = buildBensCsv(all);
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      downloadBlob(blob, `bens-patrimonio-${new Date().toISOString().slice(0, 10)}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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

      {/* Filtros principais */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Setor</Label>
            <Select
              value={filtroSetorId}
              onValueChange={(v) => setFiltroSetorId(v as typeof filtroSetorId)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os setores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                {setoresData?.data.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Situação do bem</Label>
            <Select
              value={filtroSituacao}
              onValueChange={(v) => setFiltroSituacao(v as typeof filtroSituacao)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
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
              onChange={(e) => setFiltroNumero(e.target.value)}
              placeholder="Ex: 2013000"
            />
          </div>

          <div className="flex items-center justify-start gap-3">
            <Switch
              id="toggle-graficos"
              checked={mostrarGraficos}
              onCheckedChange={setMostrarGraficos}
            />
            <Label htmlFor="toggle-graficos" className="text-sm">
              Mostrar gráficos
            </Label>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Resumo patrimonial</h3>
              <p className="text-2xl font-bold text-foreground">{stats?.totalBens ?? 0} bens</p>
              <p className="text-sm text-muted-foreground">
                Valor total: {stats?.totalValorPatrimonial != null ? formatCurrency(stats.totalValorPatrimonial) : '—'}
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
              <Button onClick={handleExportCsv} disabled={exporting}>
                {exporting ? 'Exportando…' : 'Exportar CSV'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabela principal do relatório */}
      <Card className="p-4 overflow-x-auto print:border-none">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold">Bens encontrados</h2>
            <p className="text-xs text-muted-foreground">
              Exibindo {bens.length} de {totalBens} bens filtrados.
            </p>
          </div>
        </div>
        {bens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum bem encontrado para os filtros selecionados.</p>
        ) : (
          <table className="min-w-full text-xs md:text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-2 py-2 text-left font-medium">Nº patrimonial</th>
                <th className="px-2 py-2 text-left font-medium">Setor</th>
                <th className="px-2 py-2 text-left font-medium">Subcategoria</th>
                <th className="px-2 py-2 text-left font-medium">Situação</th>
                <th className="px-2 py-2 text-right font-medium whitespace-nowrap">Valor aquisição</th>
                <th className="px-2 py-2 text-left font-medium whitespace-nowrap">Data aquisição</th>
              </tr>
            </thead>
            <tbody>
              {bens.map((b) => (
                <tr key={b.id} className="border-b border-border/60 last:border-0">
                  <td className="px-2 py-1 font-mono">{b.numeroPatrimonial}</td>
                  <td className="px-2 py-1">{b.setorNome ?? '—'}</td>
                  <td className="px-2 py-1">{b.subcategoriaNome ?? '—'}</td>
                  <td className="px-2 py-1">{b.situacao}</td>
                  <td className="px-2 py-1 text-right">
                    {b.valorAquisicao != null ? formatCurrency(b.valorAquisicao) : '—'}
                  </td>
                  <td className="px-2 py-1">
                    {b.dataAquisicao ? new Date(b.dataAquisicao).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

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
                  const perc = totalBens > 0 ? Math.round((qtd / totalBens) * 100) : 0;
                  return (
                    <div key={setor}>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="truncate pr-4">{setor}</span>
                        <span>
                          {qtd} ({perc}%)
                        </span>
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
                    const labelMap: Record<string, string> = {
                      EM_USO: 'Em uso',
                      EM_MANUTENCAO: 'Em manutenção',
                      OCIOSO: 'Ocioso',
                      BAIXADO: 'Baixado',
                    };
                    const label = labelMap[item.situacao] ?? item.situacao;
                    return (
                      <div key={item.situacao}>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{label}</span>
                          <span>
                            {item.quantidade} ({perc}%)
                          </span>
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
                        <div
                          className="h-2 rounded-full bg-primary/40"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <span className="w-28 text-right text-xs">
                        {formatCurrency(item.valorPatrimonial)}
                      </span>
                    </div>
                    <div className="col-span-5 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.depreciacaoMensal / (stats?.totalValorPatrimonial || 1)) * 300,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="w-28 text-right text-xs">
                        {formatCurrency(item.depreciacaoMensal)}
                      </span>
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
