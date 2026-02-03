import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, BarChart3, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchDashboardStats } from '@/lib/api-dashboard';
import { fetchBens } from '@/lib/api-bens';

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

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const { data: bensData } = useQuery({
    queryKey: ['relatorio-bens', 1, 5000],
    queryFn: () => fetchBens({ page: 1, limit: 5000 }),
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

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const all: Array<Record<string, string | number | null>> = [];
      let page = 1;
      const limit = 1000;
      while (true) {
        const res = await fetchBens({ page, limit });
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

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Resumo patrimonial, bens por setor e exportação
          </p>
        </div>
      </div>

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Download className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Exportar lista de bens</h3>
                <p className="text-sm text-muted-foreground">CSV (UTF-8) para uso em planilhas</p>
              </div>
            </div>
            <Button onClick={handleExportCsv} disabled={exporting}>
              {exporting ? 'Exportando…' : 'Exportar CSV'}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Bens por setor</h3>
        </div>
        {bensPorSetor.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Setor</th>
                  <th className="text-right">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {bensPorSetor.map(({ setor, qtd }) => (
                  <tr key={setor}>
                    <td>{setor}</td>
                    <td className="text-right font-medium">{qtd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
