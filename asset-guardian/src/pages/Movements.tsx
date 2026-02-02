import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowRight } from 'lucide-react';
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
  fetchMovimentacoes,
  createMovimentacao,
  type MovimentacaoResponse,
  type TipoMovimentacao,
  type CreateMovimentacaoBody,
} from '@/lib/api-movimentacoes';
import { fetchBens } from '@/lib/api-bens';
import { fetchSetores } from '@/lib/api-estrutura';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TIPO_CONFIG: Record<string, { label: string; className: string }> = {
  TRANSFERENCIA: { label: 'Transferência', className: 'bg-primary/10 text-primary' },
  EMPRESTIMO: { label: 'Empréstimo', className: 'bg-warning/10 text-warning' },
  MANUTENCAO: { label: 'Manutenção', className: 'bg-muted text-muted-foreground' },
  DEVOLUCAO: { label: 'Devolução', className: 'bg-success/10 text-success' },
};

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function Movements() {
  const [searchParams] = useSearchParams();
  const bemIdFromQuery = searchParams.get('bemId') ?? undefined;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['movimentacoes', page, bemIdFromQuery],
    queryFn: () =>
      fetchMovimentacoes({
        page,
        limit: 20,
        bemId: bemIdFromQuery,
      }),
  });

  const movimentacoes = data?.data ?? [];
  const total = data?.total ?? 0;
  const filteredMovimentacoes = movimentacoes.filter((m) => {
    const matchTipo = !typeFilter || typeFilter === 'all' || m.tipo === typeFilter;
    const matchSearch =
      !searchTerm.trim() ||
      (m.numeroPatrimonial?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTipo && matchSearch;
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Movimentações</h1>
          <p className="text-sm text-muted-foreground">
            Histórico de movimentações patrimoniais
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      <div className="card-corporate p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Input
              placeholder="Buscar por número patrimonial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter || 'all'} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(TIPO_CONFIG).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Erro ao carregar movimentações.'}
        </div>
      )}

      {isLoading ? (
        <div className="card-corporate flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMovimentacoes.length === 0 ? (
            <div className="card-corporate p-8 text-center text-muted-foreground">
              Nenhuma movimentação encontrada.
            </div>
          ) : (
            filteredMovimentacoes.map((mov) => (
              <MovementCard key={mov.id} mov={mov} />
            ))
          )}
        </div>
      )}

      {total > 20 && !bemIdFromQuery && (
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

      <DialogNovaMovimentacao
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          setDialogOpen(false);
          invalidate();
          toast({ title: 'Movimentação registrada com sucesso.' });
        }}
        onError={(msg) =>
          toast({ title: 'Erro ao registrar movimentação', description: msg, variant: 'destructive' })
        }
      />
    </div>
  );
}

function MovementCard({ mov }: { mov: MovimentacaoResponse }) {
  const type = TIPO_CONFIG[mov.tipo] ?? {
    label: mov.tipo,
    className: 'bg-muted text-muted-foreground',
  };
  return (
    <div className="card-corporate p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-primary">
                {mov.numeroPatrimonial ?? mov.bemId}
              </span>
              <span className={cn('status-badge', type.className)}>{type.label}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{mov.setorOrigemNome ?? '—'}</span>
              <ArrowRight className="h-4 w-4" />
              <span>{mov.setorDestinoNome ?? '—'}</span>
            </div>
            {mov.observacoes && (
              <p className="mt-2 text-sm text-muted-foreground">{mov.observacoes}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            {formatDateTime(mov.dataMovimentacao)}
          </p>
          {mov.dataDevolucao && (
            <p className="text-xs text-muted-foreground">
              Devolução: {formatDateTime(mov.dataDevolucao)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DialogNovaMovimentacao({
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
  const [tipo, setTipo] = useState<TipoMovimentacao>('TRANSFERENCIA');
  const [setorOrigemId, setSetorOrigemId] = useState('');
  const [setorDestinoId, setSetorDestinoId] = useState('');
  const [dataMovimentacao, setDataMovimentacao] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const { data: bensData } = useQuery({
    queryKey: ['bens-list', 1, 100],
    queryFn: () => fetchBens({ page: 1, limit: 100 }),
    enabled: open,
  });
  const { data: setoresData } = useQuery({
    queryKey: ['setores'],
    queryFn: () => fetchSetores({ limit: 200 }),
    enabled: open,
  });

  const bens = bensData?.data ?? [];
  const setores = setoresData?.data ?? [];

  const mutation = useMutation({
    mutationFn: (body: CreateMovimentacaoBody) => createMovimentacao(body),
    onSuccess: () => {
      setBemId('');
      setTipo('TRANSFERENCIA');
      setSetorOrigemId('');
      setSetorDestinoId('');
      setDataMovimentacao(new Date().toISOString().slice(0, 16));
      setDataDevolucao('');
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
    const dataMov = dataMovimentacao.includes('T')
      ? new Date(dataMovimentacao).toISOString()
      : `${dataMovimentacao}:00.000Z`;
    if (tipo === 'TRANSFERENCIA' && !setorDestinoId) {
      onError('Para transferência, informe o setor de destino.');
      return;
    }
    const body: CreateMovimentacaoBody = {
      bemId,
      tipo,
      setorOrigemId: setorOrigemId && setorOrigemId !== '__none__' ? setorOrigemId : null,
      setorDestinoId: setorDestinoId && setorDestinoId !== '__none__' ? setorDestinoId : null,
      dataMovimentacao: dataMov,
      dataDevolucao:
        tipo === 'EMPRESTIMO' && dataDevolucao
          ? (dataDevolucao.includes('T')
              ? new Date(dataDevolucao).toISOString()
              : `${dataDevolucao}:00.000Z`)
          : null,
      observacoes: observacoes.trim() || null,
    };
    mutation.mutate(body);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Movimentação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Bem *</Label>
            <Select value={bemId} onValueChange={setBemId} required>
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
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoMovimentacao)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_CONFIG).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Setor origem (opcional)</Label>
<Select value={setorOrigemId || '__none__'} onValueChange={(v) => setSetorOrigemId(v === '__none__' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {setores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Setor destino {tipo === 'TRANSFERENCIA' ? '*' : '(opcional)'}</Label>
<Select value={setorDestinoId || '__none__'} onValueChange={(v) => setSetorDestinoId(v === '__none__' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {setores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataMovimentacao">Data da movimentação *</Label>
            <Input
              id="dataMovimentacao"
              type="datetime-local"
              value={dataMovimentacao.slice(0, 16)}
              onChange={(e) => setDataMovimentacao(e.target.value)}
            />
          </div>
          {tipo === 'EMPRESTIMO' && (
            <div className="space-y-2">
              <Label htmlFor="dataDevolucao">Previsão de devolução (opcional)</Label>
              <Input
                id="dataDevolucao"
                type="datetime-local"
                value={dataDevolucao}
                onChange={(e) => setDataDevolucao(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Opcional"
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
