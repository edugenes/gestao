import { useQuery } from '@tanstack/react-query';
import { Package, DollarSign, AlertTriangle, TrendingDown } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DepreciationChart } from '@/components/dashboard/DepreciationChart';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { RecentMovements } from '@/components/dashboard/RecentMovements';
import { fetchDashboardStats } from '@/lib/api-dashboard';
import { fetchSetores } from '@/lib/api-estrutura';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchOnWindowFocus: true,
  });
  const { data: setoresData } = useQuery({
    queryKey: ['setores'],
    queryFn: () => fetchSetores({ limit: 500 }),
  });

  const totalBens = stats?.totalBens ?? 0;
  const totalValorPatrimonial = stats?.totalValorPatrimonial ?? 0;
  const depreciacaoMensal = stats?.depreciacaoMensal ?? 0;
  const mesRefDepreciacao = stats?.mesReferenciaDepreciacao ?? null;
  const pendencias = stats?.pendencias ?? 0;
  const totalSetores = setoresData?.total ?? setoresData?.data?.length ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title text-xl sm:text-2xl">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Visão geral do patrimônio institucional
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Bens"
          value={totalBens.toLocaleString('pt-BR')}
          subtitle={totalSetores > 0 ? `Em ${totalSetores} setores` : undefined}
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Valor Patrimonial"
          value={totalValorPatrimonial > 0 ? formatCurrency(totalValorPatrimonial) : '—'}
          subtitle={totalValorPatrimonial > 0 ? 'Bens ativos (excl. baixados)' : 'Consulte Relatórios'}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Pendências"
          value={String(pendencias)}
          subtitle="Itens aguardando conferência"
          icon={AlertTriangle}
          variant="warning"
          to="/inventario"
        />
        <StatCard
          title="Depreciação Mensal"
          value={depreciacaoMensal > 0 ? formatCurrency(depreciacaoMensal) : '—'}
          subtitle={
            depreciacaoMensal > 0 && mesRefDepreciacao
              ? `Ref. ${mesRefDepreciacao.slice(5)}/${mesRefDepreciacao.slice(0, 4)}`
              : 'Consulte Depreciação'
          }
          icon={TrendingDown}
          variant="info"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DepreciationChart />
        <StatusChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AlertsPanel />
        <RecentMovements />
      </div>
    </div>
  );
}
