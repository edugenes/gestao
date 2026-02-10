import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';
import { fetchBensPorSituacao } from '@/lib/api-dashboard';

const SITUACAO_LABELS: Record<string, string> = {
  EM_USO: 'Em Uso',
  EM_MANUTENCAO: 'Em Manutenção',
  OCIOSO: 'Ocioso',
  BAIXADO: 'Baixado',
};

const SITUACAO_COLORS: Record<string, string> = {
  EM_USO: 'hsl(142, 76%, 36%)', // success (verde)
  EM_MANUTENCAO: 'hsl(38, 92%, 50%)', // warning (amarelo/laranja)
  OCIOSO: 'hsl(199, 89%, 48%)', // info (azul)
  BAIXADO: 'hsl(0, 72%, 51%)', // destructive (vermelho)
};

function StatusTooltipContent({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const textColor = 'hsl(var(--card-foreground))';
  return (
    <div
      className="rounded-lg border px-3 py-2 shadow-md"
      style={{
        backgroundColor: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
      }}
    >
      <span style={{ color: textColor, fontSize: '12px' }}>
        {item.name}: <strong>{item.value?.toLocaleString('pt-BR')}</strong>
      </span>
    </div>
  );
}

export function StatusChart() {
  const { data: situacoesData = [], error, isLoading } = useQuery({
    queryKey: ['dashboard-bens-por-situacao'],
    queryFn: fetchBensPorSituacao,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const chartData = Array.isArray(situacoesData)
    ? situacoesData
        .filter((item) => item && item.quantidade > 0)
        .map((item) => ({
          name: SITUACAO_LABELS[item.situacao] ?? item.situacao,
          value: Number(item.quantidade) || 0,
          color: SITUACAO_COLORS[item.situacao] ?? 'hsl(var(--muted-foreground))',
        }))
    : [];

  return (
    <div className="card-corporate p-6">
      <h3 className="section-title">Bens por Status</h3>
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
            Nenhum dado disponível.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<StatusTooltipContent />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span
                    style={{
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px',
                    }}
                  >
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
