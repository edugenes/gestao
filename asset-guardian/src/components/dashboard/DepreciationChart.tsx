import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchDepreciacaoHistorico } from '@/lib/api-dashboard';

function formatMonth(mes: string): string {
  try {
    if (!mes || typeof mes !== 'string') return mes ?? '—';
    const [ano, mesNum] = mes.split('-');
    if (!ano || !mesNum) return mes;
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mesIdx = parseInt(mesNum, 10) - 1;
    if (mesIdx < 0 || mesIdx >= meses.length) return mes;
    return `${meses[mesIdx]}/${ano.slice(2)}`;
  } catch {
    return mes ?? '—';
  }
}

export function DepreciationChart() {
  const { data: historico = [], error, isLoading } = useQuery({
    queryKey: ['dashboard-depreciacao-historico'],
    queryFn: fetchDepreciacaoHistorico,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const chartData = Array.isArray(historico)
    ? historico.map((item) => ({
        month: formatMonth(item?.mes ?? ''),
        valor: Number(item?.valorPatrimonial) || 0,
        depreciacao: Number(item?.depreciacaoMensal) || 0,
      }))
    : [];

  return (
    <div className="card-corporate p-6">
      <h3 className="section-title">Evolução Patrimonial</h3>
      <div className="h-72">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-destructive">
            Erro ao carregar dados.
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Nenhum dado de depreciação disponível.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 35%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 35%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                }}
                formatter={(value: number) =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(value)
                }
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="hsl(217, 91%, 35%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValor)"
                name="Valor Patrimonial"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
