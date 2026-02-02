import { AlertTriangle, Calendar, ClipboardCheck, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: number;
  type: 'inventory' | 'maintenance' | 'depreciation';
  title: string;
  description: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

const alerts: Alert[] = [
  {
    id: 1,
    type: 'inventory',
    title: 'Inventário Pendente',
    description: 'Setor de TI possui 15 bens aguardando conferência',
    date: '2024-01-28',
    priority: 'high',
  },
  {
    id: 2,
    type: 'maintenance',
    title: 'Manutenção Programada',
    description: 'Impressora HP LaserJet - Troca de toner',
    date: '2024-01-30',
    priority: 'medium',
  },
  {
    id: 3,
    type: 'maintenance',
    title: 'Manutenção Vencida',
    description: 'Ar condicionado Bloco B - Limpeza preventiva',
    date: '2024-01-25',
    priority: 'high',
  },
  {
    id: 4,
    type: 'depreciation',
    title: 'Depreciação Total',
    description: '23 bens atingiram depreciação total este mês',
    date: '2024-01-28',
    priority: 'low',
  },
];

const typeIcons = {
  inventory: ClipboardCheck,
  maintenance: Wrench,
  depreciation: Calendar,
};

const priorityStyles = {
  high: 'border-l-destructive bg-destructive/5',
  medium: 'border-l-warning bg-warning/5',
  low: 'border-l-info bg-info/5',
};

export function AlertsPanel() {
  return (
    <div className="card-corporate p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title mb-0">Alertas e Pendências</h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
          {alerts.filter((a) => a.priority === 'high').length}
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = typeIcons[alert.type];
          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border-l-4 p-3 transition-colors hover:bg-muted/50',
                priorityStyles[alert.priority]
              )}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  {alert.priority === 'high' && (
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {new Date(alert.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
