import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchMovimentacoes } from '@/lib/api-movimentacoes';
import { cn } from '@/lib/utils';

const TIPO_LABELS: Record<string, string> = {
  TRANSFERENCIA: 'Transferência',
  EMPRESTIMO: 'Empréstimo',
  MANUTENCAO: 'Manutenção',
  DEVOLUCAO: 'Devolução',
};

const TIPO_CLASS: Record<string, string> = {
  TRANSFERENCIA: 'bg-primary/10 text-primary',
  EMPRESTIMO: 'bg-warning/10 text-warning',
  MANUTENCAO: 'bg-muted text-muted-foreground',
  DEVOLUCAO: 'bg-success/10 text-success',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

export function RecentMovements() {
  const { data } = useQuery({
    queryKey: ['movimentacoes', 1, 5],
    queryFn: () => fetchMovimentacoes({ page: 1, limit: 5 }),
    refetchOnWindowFocus: true,
  });

  const movements = data?.data ?? [];

  return (
    <div className="card-corporate p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-title mb-0">Movimentações Recentes</h3>
        <Link
          to="/movimentacoes"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver todas
        </Link>
      </div>
      <div className="space-y-4">
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma movimentação recente.</p>
        ) : (
          movements.map((mov) => (
            <div
              key={mov.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {mov.numeroPatrimonial ?? mov.bemId}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    {TIPO_LABELS[mov.tipo] ?? mov.tipo}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{mov.setorOrigemNome ?? '—'}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>{mov.setorDestinoNome ?? '—'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={cn('status-badge', TIPO_CLASS[mov.tipo] ?? '')}>
                  {TIPO_LABELS[mov.tipo] ?? mov.tipo}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(mov.dataMovimentacao)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
