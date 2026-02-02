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
  fetchManutencoes,
  createManutencao,
  fetchFornecedores,
  type ManutencaoResponse,
  type TipoManutencao,
  type CreateManutencaoBody,
} from '@/lib/api-manutencoes';
import { fetchBens } from '@/lib/api-bens';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TIPO_CONFIG: Record<string, { label: string; className: string }> = {
  PREVENTIVA: { label: 'Preventiva', className: 'bg-success/10 text-success' },
  CORRETIVA: { label: 'Corretiva', className: 'bg-warning/10 text-warning' },
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

export default function Manutencao() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['manutencoes', page],
    queryFn: () => fetchManutencoes({ page, limit: 20 }),
  });

  const manutencoes = data?.data ?? [];
  const total = data?.total ?? 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manutenção</h1>
          <p className="text-sm text-muted-foreground">
            Registro de manutenções preventivas e corretivas
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Manutenção
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
                <TableHead>Tipo</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Custo (R$)</TableHead>
                <TableHead>Fornecedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manutencoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma manutenção registrada.
                  </TableCell>
                </TableRow>
              ) : (
                manutencoes.map((m) => {
                  const tipo = TIPO_CONFIG[m.tipo] ?? { label: m.tipo, className: '' };
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-sm">
                        {m.numeroPatrimonial ?? m.bemId}
                      </TableCell>
                      <TableCell>
                        <span className={cn('status-badge', tipo.className)}>{tipo.label}</span>
                      </TableCell>
                      <TableCell>{formatDate(m.dataInicio)}</TableCell>
                      <TableCell>{formatDate(m.dataFim)}</TableCell>
                      <TableCell>
                        {m.custo != null ? m.custo.toLocaleString('pt-BR') : '—'}
                      </TableCell>
                      <TableCell>{m.fornecedorNome ?? '—'}</TableCell>
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

      <DialogNovaManutencao
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          setDialogOpen(false);
          invalidate();
          toast({ title: 'Manutenção registrada.' });
        }}
        onError={(msg) => toast({ title: 'Erro', description: msg, variant: 'destructive' })}
      />
    </div>
  );
}

function DialogNovaManutencao({
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
  const [tipo, setTipo] = useState<TipoManutencao>('CORRETIVA');
  const [dataInicio, setDataInicio] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [dataFim, setDataFim] = useState('');
  const [custo, setCusto] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const { data: bensData } = useQuery({
    queryKey: ['bens-list', 1, 100],
    queryFn: () => fetchBens({ page: 1, limit: 100 }),
    enabled: open,
  });
  const { data: fornecedoresData } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => fetchFornecedores({ limit: 200 }),
    enabled: open,
  });

  const bens = bensData?.data ?? [];
  const fornecedores = fornecedoresData?.data ?? [];

  const mutation = useMutation({
    mutationFn: (body: CreateManutencaoBody) => createManutencao(body),
    onSuccess: () => {
      setBemId('');
      setTipo('CORRETIVA');
      setDataInicio(new Date().toISOString().slice(0, 10));
      setDataFim('');
      setCusto('');
      setFornecedorId('');
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
    const body: CreateManutencaoBody = {
      bemId,
      tipo,
      dataInicio: new Date(dataInicio).toISOString().slice(0, 10),
      dataFim: dataFim ? new Date(dataFim).toISOString().slice(0, 10) : null,
      custo: custo ? parseFloat(String(custo).replace(',', '.')) : null,
      fornecedorId: fornecedorId && fornecedorId !== '__none__' ? fornecedorId : null,
      observacoes: observacoes.trim() || null,
    };
    mutation.mutate(body);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Manutenção</DialogTitle>
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
            <Label>Tipo *</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoManutencao)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PREVENTIVA">Preventiva</SelectItem>
                <SelectItem value="CORRETIVA">Corretiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data de início *</Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataFim">Data de fim (opcional)</Label>
            <Input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custo">Custo (R$) opcional</Label>
            <Input
              id="custo"
              type="text"
              inputMode="decimal"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <Label>Fornecedor (opcional)</Label>
            <Select value={fornecedorId || '__none__'} onValueChange={(v) => setFornecedorId(v === '__none__' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhum</SelectItem>
                {fornecedores.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
