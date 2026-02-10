import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import {
  fetchDepreciacoes,
  createDepreciacao,
  type DepreciacaoResponse,
  type MetodoDepreciacao,
  type CreateDepreciacaoBody,
} from '@/lib/api-depreciacoes';
import { invalidateDashboardQueries } from '@/lib/api-dashboard';
import { fetchBens } from '@/lib/api-bens';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const METODO_CONFIG: Record<string, { label: string; className: string }> = {
  LINEAR: { label: 'Linear', className: 'bg-primary/10 text-primary' },
  ACELERADA: { label: 'Acelerada', className: 'bg-warning/10 text-warning' },
};

function formatMesRef(ym: string): string {
  if (!ym || ym.length < 7) return ym;
  const [y, m] = ym.split('-');
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${meses[parseInt(m, 10) - 1]}/${y}`;
}

export default function Depreciacao() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['depreciacoes', page],
    queryFn: () => fetchDepreciacoes({ page, limit: 20 }),
  });

  const depreciacoes = data?.data ?? [];
  const total = data?.total ?? 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['depreciacoes'] });
    invalidateDashboardQueries(queryClient);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Depreciação</h1>
          <p className="text-sm text-muted-foreground">
            Histórico de depreciação por bem (linear ou acelerada)
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Depreciação
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Erro ao carregar.'}
        </div>
      )}

      {isLoading ? (
        <Card className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patrimônio</TableHead>
                <TableHead>Mês ref.</TableHead>
                <TableHead>Valor depreciado (R$)</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depreciacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhuma depreciação registrada.
                  </TableCell>
                </TableRow>
              ) : (
                depreciacoes.map((d) => {
                  const metodo = METODO_CONFIG[d.metodo] ?? { label: d.metodo, className: '' };
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-sm">
                        {d.numeroPatrimonial ?? d.bemId}
                      </TableCell>
                      <TableCell>{formatMesRef(d.mesReferencia)}</TableCell>
                      <TableCell>{d.valorDepreciado.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        <span className={cn('status-badge', metodo.className)}>{metodo.label}</span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Página {page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page * 20 >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      <DialogNovaDepreciacao
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          setDialogOpen(false);
          invalidate();
          toast({ title: 'Depreciação registrada.' });
        }}
        onError={(msg) => toast({ title: 'Erro', description: msg, variant: 'destructive' })}
      />
    </div>
  );
}

function DialogNovaDepreciacao({
  open,
  onOpenChange,
  onSuccess,
  onError,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const now = new Date();
  const [bemId, setBemId] = useState('');
  const [mesReferencia, setMesReferencia] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );
  const [valorDepreciado, setValorDepreciado] = useState('');
  const [metodo, setMetodo] = useState<MetodoDepreciacao>('LINEAR');

  const { data: bensData } = useQuery({
    queryKey: ['bens-list', 1, 100],
    queryFn: () => fetchBens({ page: 1, limit: 100 }),
    enabled: open,
  });
  const bens = bensData?.data ?? [];

  const mutation = useMutation({
    mutationFn: (body: CreateDepreciacaoBody) => createDepreciacao(body),
    onSuccess: () => {
      setBemId('');
      setMesReferencia(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      setValorDepreciado('');
      setMetodo('LINEAR');
      onSuccess();
    },
    onError: (e: Error) => onError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bemId) {
      onError('Selecione o bem.');
      return;
    }
    const valor = parseFloat(String(valorDepreciado || '').replace(',', '.'));
    if (Number.isNaN(valor) || valor < 0) {
      onError('Informe o valor depreciado (número >= 0).');
      return;
    }
    mutation.mutate({
      bemId,
      mesReferencia,
      valorDepreciado: valor,
      metodo,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Depreciação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Bem *</Label>
            <Select value={bemId || undefined} onValueChange={setBemId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o bem" />
              </SelectTrigger>
              <SelectContent>
                {bens.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.numeroPatrimonial} {b.setorNome ? `– ${b.setorNome}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mesRef">Mês de referência (YYYY-MM) *</Label>
            <Input
              id="mesRef"
              type="month"
              value={mesReferencia}
              onChange={(e) => setMesReferencia(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valorDepreciado">Valor depreciado (R$) *</Label>
            <Input
              id="valorDepreciado"
              type="text"
              inputMode="decimal"
              value={valorDepreciado}
              onChange={(e) => setValorDepreciado(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <Label>Método *</Label>
            <Select value={metodo} onValueChange={(v) => setMetodo(v as MetodoDepreciacao)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LINEAR">Linear</SelectItem>
                <SelectItem value="ACELERADA">Acelerada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
