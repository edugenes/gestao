import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  fetchBaixas,
  createBaixa,
  type BaixaResponse,
  type MotivoBaixa,
  type CreateBaixaBody,
} from '@/lib/api-baixas';
import { invalidateDashboardQueries } from '@/lib/api-dashboard';
import { fetchBens } from '@/lib/api-bens';
import { useToast } from '@/hooks/use-toast';

const MOTIVO_LABELS: Record<string, string> = {
  OBSOLESCENCIA: 'Obsolescência',
  PERDA: 'Perda',
  DOACAO: 'Doação',
  VENDA: 'Venda',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

export default function Baixas() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['baixas', page],
    queryFn: () => fetchBaixas({ page, limit: 20 }),
  });

  const baixas = data?.data ?? [];
  const total = data?.total ?? 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['baixas'] });
    invalidateDashboardQueries(queryClient);
    queryClient.invalidateQueries({ queryKey: ['bens'] });
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Baixa Patrimonial</h1>
          <p className="text-sm text-muted-foreground">
            Registro de baixas (irreversível). O bem passa a situação BAIXADO.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Baixa
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
                <TableHead>Data da baixa</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Valor realizado (R$)</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {baixas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma baixa registrada.
                  </TableCell>
                </TableRow>
              ) : (
                baixas.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-sm">
                      {b.numeroPatrimonial ?? b.bemId}
                    </TableCell>
                    <TableCell>{formatDate(b.dataBaixa)}</TableCell>
                    <TableCell>{MOTIVO_LABELS[b.motivo] ?? b.motivo}</TableCell>
                    <TableCell>
                      {b.valorRealizado != null ? b.valorRealizado.toLocaleString('pt-BR') : '—'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{b.observacoes ?? '—'}</TableCell>
                  </TableRow>
                ))
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

      <DialogNovaBaixa
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          setDialogOpen(false);
          invalidate();
          toast({ title: 'Baixa registrada.' });
        }}
        onError={(msg) => toast({ title: 'Erro', description: msg, variant: 'destructive' })}
      />
    </div>
  );
}

function DialogNovaBaixa({
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
  const [bemId, setBemId] = useState('');
  const [dataBaixa, setDataBaixa] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [motivo, setMotivo] = useState<MotivoBaixa>('OBSOLESCENCIA');
  const [valorRealizado, setValorRealizado] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const { data: bensData } = useQuery({
    queryKey: ['bens-list', 1, 200],
    queryFn: () => fetchBens({ page: 1, limit: 200 }),
    enabled: open,
  });
  const bens = (bensData?.data ?? []).filter((b) => b.situacao !== 'BAIXADO');

  const mutation = useMutation({
    mutationFn: (body: CreateBaixaBody) => createBaixa(body),
    onSuccess: () => {
      setBemId('');
      setDataBaixa(new Date().toISOString().slice(0, 10));
      setMotivo('OBSOLESCENCIA');
      setValorRealizado('');
      setObservacoes('');
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
    const body: CreateBaixaBody = {
      bemId,
      dataBaixa: new Date(dataBaixa).toISOString().slice(0, 10),
      motivo,
      valorRealizado: valorRealizado
        ? parseFloat(String(valorRealizado).replace(',', '.'))
        : null,
      observacoes: observacoes.trim() || null,
    };
    mutation.mutate(body);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Baixa Patrimonial</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Esta ação é irreversível. O bem passará a situação BAIXADO.
          </p>
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
            <Label htmlFor="dataBaixa">Data da baixa *</Label>
            <Input
              id="dataBaixa"
              type="date"
              value={dataBaixa}
              onChange={(e) => setDataBaixa(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Motivo *</Label>
            <Select value={motivo} onValueChange={(v) => setMotivo(v as MotivoBaixa)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOTIVO_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="valorRealizado">Valor realizado (R$) opcional</Label>
            <Input
              id="valorRealizado"
              type="text"
              inputMode="decimal"
              value={valorRealizado}
              onChange={(e) => setValorRealizado(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} variant="destructive">
              {mutation.isPending ? 'Registrando...' : 'Registrar baixa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
