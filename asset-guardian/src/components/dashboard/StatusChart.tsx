import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';

const data = [
  { name: 'Ativo', value: 1245, color: 'hsl(142, 76%, 36%)' },
  { name: 'Em Manutenção', value: 87, color: 'hsl(38, 92%, 50%)' },
  { name: 'Baixado', value: 156, color: 'hsl(0, 72%, 51%)' },
  { name: 'Transferido', value: 42, color: 'hsl(199, 89%, 48%)' },
];

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
  return (
    <div className="card-corporate p-6">
      <h3 className="section-title">Bens por Status</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
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
      </div>
    </div>
  );
}
