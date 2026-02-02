import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', valor: 2400000, depreciacao: 120000 },
  { month: 'Fev', valor: 2380000, depreciacao: 119000 },
  { month: 'Mar', valor: 2360000, depreciacao: 118000 },
  { month: 'Abr', valor: 2340000, depreciacao: 117000 },
  { month: 'Mai', valor: 2320000, depreciacao: 116000 },
  { month: 'Jun', valor: 2300000, depreciacao: 115000 },
];

export function DepreciationChart() {
  return (
    <div className="card-corporate p-6">
      <h3 className="section-title">Evolução Patrimonial</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
      </div>
    </div>
  );
}
