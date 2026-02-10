import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchInventarios, fetchItensByInventario } from '@/lib/api-inventarios';

interface Alert {
  id: string;
  type: 'inventory';
  title: string;
  description: string;
  date: string;
  priority: 'high' | 'medium';
}

const typeIcons = {
  inventory: ClipboardCheck,
};

const priorityStyles = {
  high: 'border-l-destructive bg-destructive/5',
  medium: 'border-l-warning bg-warning/5',
};

function InventarioAlert({ inventarioId, descricao, dataInicio }: { inventarioId: string; descricao: string; dataInicio: string }) {
  const { data: itens = [] } = useQuery({
    queryKey: ['inventario-itens', inventarioId],
    queryFn: () => fetchItensByInventario(inventarioId),
  });

  const pendentes = itens.filter((item) => !item.conferido).length;
  const total = itens.length;
  const priority: 'high' | 'medium' = pendentes > 0 ? 'high' : 'medium';
  const Icon = typeIcons.inventory;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border-l-4 p-3 transition-colors hover:bg-muted/50',
        priorityStyles[priority]
      )}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">Inventário Pendente</p>
          {priority === 'high' && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
        </div>
        <p className="text-xs text-muted-foreground">
          {pendentes > 0
            ? `${descricao}: ${pendentes} ${pendentes === 1 ? 'item' : 'itens'} aguardando conferência${total > 0 ? ` (${total} ${total === 1 ? 'item' : 'itens'} no total)` : ''}`
            : `${descricao}: aguardando itens`}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {new Date(dataInicio).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}

export function AlertsPanel() {
  // Busca inventários abertos
  const { data: inventariosData, error, isLoading } = useQuery({
    queryKey: ['inventarios', 'ABERTO'],
    queryFn: () => fetchInventarios({ status: 'ABERTO', limit: 10 }),
    refetchOnWindowFocus: true,
  });

  const inventariosAbertos = inventariosData?.data ?? [];
  const highPriorityCount = inventariosAbertos.length;

  return (
    <div className="card-corporate p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title mb-0">Alertas e Pendências</h3>
        {highPriorityCount > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
            {highPriorityCount}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Erro ao carregar inventários.</p>
        ) : inventariosAbertos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum inventário aberto no momento.</p>
        ) : (
          inventariosAbertos.map((inv) => (
            <InventarioAlert
              key={inv.id}
              inventarioId={inv.id}
              descricao={inv.descricao}
              dataInicio={inv.dataInicio}
            />
          ))
        )}
      </div>
    </div>
  );
}
