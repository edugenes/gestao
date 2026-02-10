import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, QrCode, Check, AlertTriangle, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  fetchInventarios,
  fetchItensByInventario,
  createInventario,
  closeInventario,
  addInventarioItem,
  updateInventarioItem,
  type InventarioItemResponse,
  type TipoInventario,
} from '@/lib/api-inventarios';
import { fetchSetores, type SetorItem } from '@/lib/api-estrutura';
import { invalidateDashboardQueries } from '@/lib/api-dashboard';
import { fetchBens } from '@/lib/api-bens';
import { QrScanner } from '@/components/QrScanner';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ItemStatus = 'encontrado' | 'divergente' | 'nao_encontrado' | 'pendente';

function itemToStatus(item: InventarioItemResponse): ItemStatus {
  if (!item.conferido) return 'pendente';
  if (item.divergencia?.toLowerCase().includes('não encontrado') ?? false) return 'nao_encontrado';
  if (item.divergencia) return 'divergente';
  return 'encontrado';
}

const statusConfig: Record<
  ItemStatus,
  { label: string; icon: typeof Check; className: string }
> = {
  encontrado: {
    label: 'Encontrado',
    icon: Check,
    className: 'bg-success/10 text-success',
  },
  divergente: {
    label: 'Divergente',
    icon: AlertTriangle,
    className: 'bg-warning/10 text-warning',
  },
  nao_encontrado: {
    label: 'Não Encontrado',
    icon: X,
    className: 'bg-destructive/10 text-destructive',
  },
  pendente: {
    label: 'Pendente',
    icon: Search,
    className: 'bg-muted text-muted-foreground',
  },
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
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

export default function Inventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSetorId, setSelectedSetorId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogNovo, setDialogNovo] = useState(false);
  const [dialogAddItem, setDialogAddItem] = useState(false);
  const [dialogConferir, setDialogConferir] = useState<InventarioItemResponse | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const { data: inventariosData } = useQuery({
    queryKey: ['inventarios', page],
    queryFn: () => fetchInventarios({ page, limit: 20 }),
  });

  const inventarios = inventariosData?.data ?? [];
  const totalInventarios = inventariosData?.total ?? 0;
  const selectedInventario = selectedId
    ? inventarios.find((i) => i.id === selectedId) ?? null
    : inventarios[0] ?? null;
  const effectiveId = selectedInventario?.id ?? selectedId ?? null;

  useEffect(() => {
    if (inventarios.length > 0 && !selectedId) {
      setSelectedId(inventarios[0].id);
    }
  }, [inventarios, selectedId]);

  const { data: itensData } = useQuery({
    queryKey: ['inventario-itens', effectiveId],
    queryFn: () => fetchItensByInventario(effectiveId!),
    enabled: !!effectiveId,
  });

  const itens = itensData ?? [];
  const filteredItens = itens.filter(
    (item) =>
      !searchTerm.trim() ||
      (item.numeroPatrimonial?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const stats = {
    total: itens.length,
    encontrados: itens.filter((i) => itemToStatus(i) === 'encontrado').length,
    divergentes: itens.filter((i) => itemToStatus(i) === 'divergente').length,
    naoEncontrados: itens.filter((i) => itemToStatus(i) === 'nao_encontrado').length,
    pendentes: itens.filter((i) => itemToStatus(i) === 'pendente').length,
  };
  const progress = stats.total > 0 ? ((stats.total - stats.pendentes) / stats.total) * 100 : 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['inventarios'] });
    queryClient.invalidateQueries({ queryKey: ['inventario'] });
    queryClient.invalidateQueries({ queryKey: ['inventario-itens'] });
    // Atualiza o dashboard quando inventários/itens são criados ou atualizados
    invalidateDashboardQueries(queryClient);
  };

  // Setores para seleção rápida do local de conferência (frontend por enquanto)
  const { data: setoresData } = useQuery({
    queryKey: ['setores', 1, 500],
    queryFn: () => fetchSetores({ page: 1, limit: 500 }),
  });
  const setores: SetorItem[] = setoresData?.data ?? [];

  const handleQrScan = async (decodedText: string) => {
    const numero = decodedText.trim();
    if (!numero || !effectiveId) return;
    const item = itens.find(
      (i) => (i.numeroPatrimonial ?? '').trim().toLowerCase() === numero.toLowerCase()
    );
    if (!item) {
      toast({
        title: 'Bem não está neste inventário',
        description: `Número: ${numero}. Adicione o bem ao inventário primeiro.`,
        variant: 'destructive',
      });
      return;
    }
    if (item.conferido) {
      toast({ title: 'Item já conferido', description: item.numeroPatrimonial ?? numero });
      return;
    }
    try {
      await updateInventarioItem(item.id, {
        conferido: true,
        dataConferencia: new Date().toISOString(),
      });
      invalidate();
      toast({ title: 'Item conferido', description: item.numeroPatrimonial ?? numero });
    } catch (e) {
      toast({ title: 'Erro ao conferir', description: (e as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <QrScanner
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onScan={handleQrScan}
        title="Ler QR Code – conferir item"
        onError={(message) =>
          toast({
            title: 'Erro ao acessar câmera',
            description: message,
            variant: 'destructive',
          })
        }
      />
      <div className="page-header flex-col gap-3 sm:flex-row">
        <div>
          <h1 className="page-title text-xl sm:text-2xl">Inventário</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Conferência de bens patrimoniais
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => {
              if (!effectiveId) {
                toast({
                  title: 'Selecione um inventário',
                  description: 'Escolha o inventário ativo antes de ler o QR Code.',
                  variant: 'destructive',
                });
                return;
              }
              if (!selectedSetorId) {
                toast({
                  title: 'Selecione o setor',
                  description: 'Informe o setor em que está conferindo antes de ler o QR Code.',
                  variant: 'destructive',
                });
                return;
              }
              setQrOpen(true);
            }} 
            disabled={!effectiveId || selectedInventario?.status !== 'ABERTO'}
            className="flex-1 sm:flex-initial"
          >
            <QrCode className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Ler QR Code</span>
            <span className="xs:hidden">QR</span>
          </Button>
          <Button onClick={() => setDialogNovo(true)} className="flex-1 sm:flex-initial">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Novo Inventário</span>
            <span className="xs:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {inventarios.length > 0 && (
        <div className="card-corporate p-3 sm:p-4">
          <Label className="text-xs sm:text-sm text-muted-foreground">Inventário ativo</Label>
          <Select
            value={effectiveId ?? undefined}
            onValueChange={(v) => setSelectedId(v)}
          >
            <SelectTrigger className="mt-1 w-full sm:max-w-md">
              <SelectValue placeholder="Selecione um inventário" />
            </SelectTrigger>
            <SelectContent>
              {inventarios.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.descricao} – {i.status} ({formatDate(i.dataInicio).slice(0, 10)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Setor atual para conferência (apenas frontend por enquanto) */}
      {setores.length > 0 && (
        <div className="card-corporate p-3 sm:p-4">
          <Label className="text-xs sm:text-sm text-muted-foreground">Setor atual da conferência</Label>
          <Select
            value={selectedSetorId ?? undefined}
            onValueChange={(v) => setSelectedSetorId(v)}
          >
            <SelectTrigger className="mt-1 w-full sm:max-w-md">
              <SelectValue placeholder="Selecione o setor em que está conferindo" />
            </SelectTrigger>
            <SelectContent>
              {setores.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome} {s.codigo ? `(${s.codigo})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedInventario && (
        <>
          <div className="card-corporate p-4 sm:p-6">
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold truncate">{selectedInventario.descricao}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Início: {formatDate(selectedInventario.dataInicio)}
                </p>
              </div>
              <Badge variant="outline" className="text-xs sm:text-sm shrink-0">
                {selectedInventario.status === 'ABERTO' ? 'Em andamento' : 'Fechado'}
              </Badge>
            </div>

            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso da conferência</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
              <div className="rounded-lg bg-success/10 p-2.5 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold text-success">{stats.encontrados}</p>
                <p className="text-[10px] sm:text-xs text-success leading-tight">Encontrados</p>
              </div>
              <div className="rounded-lg bg-warning/10 p-2.5 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold text-warning">{stats.divergentes}</p>
                <p className="text-[10px] sm:text-xs text-warning leading-tight">Divergentes</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-2.5 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold text-destructive">{stats.naoEncontrados}</p>
                <p className="text-[10px] sm:text-xs text-destructive leading-tight">Não Encontrados</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold text-muted-foreground">{stats.pendentes}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Pendentes</p>
              </div>
            </div>

            {selectedInventario.status === 'ABERTO' && (
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" onClick={() => setDialogAddItem(true)} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Adicionar bem ao inventário</span>
                  <span className="xs:hidden">Adicionar bem</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (confirm('Fechar este inventário? Não será possível adicionar mais itens.')) {
                      closeInventario(selectedInventario.id)
                        .then(() => {
                          invalidate();
                          toast({ title: 'Inventário fechado.' });
                        })
                        .catch((e: Error) =>
                          toast({ title: 'Erro', description: e.message, variant: 'destructive' })
                        );
                    }
                  }}
                >
                  Fechar inventário
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número patrimonial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3">
            {filteredItens.length === 0 ? (
              <div className="card-corporate p-8 text-center text-muted-foreground">
                Nenhum item neste inventário.
              </div>
            ) : (
              filteredItens.map((item) => (
                <InventoryItemRow
                  key={item.id}
                  item={item}
                  onConferir={() => setDialogConferir(item)}
                />
              ))
            )}
          </div>
        </>
      )}

      {inventarios.length === 0 && (
        <div className="card-corporate p-8 text-center text-muted-foreground">
          Nenhum inventário cadastrado. Crie um inventário para começar.
        </div>
      )}

      <DialogNovoInventario
        open={dialogNovo}
        onOpenChange={setDialogNovo}
        onSuccess={() => {
          setDialogNovo(false);
          invalidate();
          toast({ title: 'Inventário criado.' });
        }}
        onError={(msg) =>
          toast({ title: 'Erro ao criar inventário', description: msg, variant: 'destructive' })
        }
      />

      {effectiveId && (
        <DialogAddItem
          open={dialogAddItem}
          onOpenChange={setDialogAddItem}
          inventarioId={effectiveId}
          onSuccess={() => {
            setDialogAddItem(false);
            invalidate();
            toast({ title: 'Bem adicionado ao inventário.' });
          }}
          onError={(msg) =>
            toast({ title: 'Erro', description: msg, variant: 'destructive' })
          }
        />
      )}

      {dialogConferir && (
        <DialogConferirItem
          item={dialogConferir}
          open={!!dialogConferir}
          onOpenChange={(open) => !open && setDialogConferir(null)}
          onSuccess={() => {
            setDialogConferir(null);
            invalidate();
            toast({ title: 'Item conferido.' });
          }}
          onError={(msg) =>
            toast({ title: 'Erro', description: msg, variant: 'destructive' })
          }
        />
      )}
    </div>
  );
}

function InventoryItemRow({
  item,
  onConferir,
}: {
  item: InventarioItemResponse;
  onConferir: () => void;
}) {
  const status = itemToStatus(item);
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  return (
    <div className="card-corporate flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', config.className)}>
          <StatusIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs sm:text-sm font-medium text-primary break-all">
              {item.numeroPatrimonial ?? item.bemId}
            </span>
            <span className={cn('status-badge text-[10px] sm:text-xs', config.className)}>{config.label}</span>
          </div>
          {item.divergencia && (
            <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground break-words">{item.divergencia}</p>
          )}
        </div>
      </div>
      <div className="text-left sm:text-right w-full sm:w-auto">
        {item.conferido ? (
          <p className="text-xs text-muted-foreground">
            {formatDate(item.dataConferencia)}
          </p>
        ) : (
          <Button size="sm" onClick={onConferir} className="w-full sm:w-auto">
            Conferir
          </Button>
        )}
      </div>
    </div>
  );
}

function DialogNovoInventario({
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
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [tipo, setTipo] = useState<TipoInventario>('GERAL');
  const mutation = useMutation({
    mutationFn: () =>
      createInventario({
        descricao,
        dataInicio: new Date(dataInicio).toISOString().slice(0, 10),
        tipo,
      }),
    onSuccess: () => {
      setDescricao('');
      setDataInicio(new Date().toISOString().slice(0, 10));
      setTipo('GERAL');
      onSuccess();
    },
    onError: (e: Error) => onError(e.message),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) {
      onError('Informe a descrição.');
      return;
    }
    mutation.mutate();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Inventário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Inventário Mensal - Janeiro 2024"
            />
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
            <Label>Tipo de inventário *</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoInventario)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GERAL">Inventário geral (100% dos bens)</SelectItem>
                <SelectItem value="PARCIAL">Inventário parcial/manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogAddItem({
  open,
  onOpenChange,
  inventarioId,
  onSuccess,
  onError,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  inventarioId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [bemId, setBemId] = useState('');
  const [divergencia, setDivergencia] = useState('');
  const { data: bensData } = useQuery({
    queryKey: ['bens-list', 1, 200],
    queryFn: () => fetchBens({ page: 1, limit: 200 }),
    enabled: open,
  });
  const bens = bensData?.data ?? [];
  const mutation = useMutation({
    mutationFn: () =>
      addInventarioItem({
        inventarioId,
        bemId,
        divergencia: divergencia.trim() || null,
      }),
    onSuccess: () => {
      setBemId('');
      setDivergencia('');
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
    mutation.mutate();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar bem ao inventário</DialogTitle>
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
            <Label htmlFor="divergencia">Divergência (opcional)</Label>
            <Input
              id="divergencia"
              value={divergencia}
              onChange={(e) => setDivergencia(e.target.value)}
              placeholder="Ex: Não encontrado no local"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogConferirItem({
  item,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: {
  item: InventarioItemResponse;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [divergencia, setDivergencia] = useState(item.divergencia ?? '');
  const mutation = useMutation({
    mutationFn: () =>
      updateInventarioItem(item.id, {
        conferido: true,
        dataConferencia: new Date().toISOString(),
        divergencia: divergencia.trim() || null,
      }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (e: Error) => onError(e.message),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conferir item – {item.numeroPatrimonial ?? item.bemId}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="divergencia">Divergência (opcional)</Label>
            <Input
              id="divergencia"
              value={divergencia}
              onChange={(e) => setDivergencia(e.target.value)}
              placeholder="Ex: Não encontrado no local, setor diferente"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Conferir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
