import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  fetchUnidades,
  fetchPredios,
  fetchAndares,
  fetchSetores,
  fetchCentrosCusto,
  createUnidade,
  createPredio,
  createAndar,
  createSetor,
  createCentroCusto,
  type UnidadeItem,
  type PredioItem,
  type AndarItem,
  type SetorItem,
  type CentroCustoItem,
} from '@/lib/api-estrutura';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const limit = 200;

export default function Estrutura() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogUnidade, setDialogUnidade] = useState(false);
  const [dialogPredio, setDialogPredio] = useState(false);
  const [dialogAndar, setDialogAndar] = useState(false);
  const [dialogSetor, setDialogSetor] = useState(false);
  const [dialogCentroCusto, setDialogCentroCusto] = useState(false);

  const { data: unidadesData } = useQuery({
    queryKey: ['estrutura', 'unidades'],
    queryFn: () => fetchUnidades({ limit }),
  });
  const { data: prediosData } = useQuery({
    queryKey: ['estrutura', 'predios'],
    queryFn: () => fetchPredios({ limit }),
  });
  const { data: andaresData } = useQuery({
    queryKey: ['estrutura', 'andares'],
    queryFn: () => fetchAndares({ limit }),
  });
  const { data: setoresData } = useQuery({
    queryKey: ['estrutura', 'setores'],
    queryFn: () => fetchSetores({ limit }),
  });
  const { data: centrosData } = useQuery({
    queryKey: ['estrutura', 'centros-custo'],
    queryFn: () => fetchCentrosCusto({ limit }),
  });

  const unidades = unidadesData?.data ?? [];
  const predios = prediosData?.data ?? [];
  const andares = andaresData?.data ?? [];
  const setores = setoresData?.data ?? [];
  const centrosCusto = centrosData?.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['estrutura'] });
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Estrutura Organizacional</h1>
          <p className="text-sm text-muted-foreground">
            Unidades, prédios, andares, setores e centros de custo
          </p>
        </div>
      </div>

      <Tabs defaultValue="unidades" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="unidades">Unidades</TabsTrigger>
          <TabsTrigger value="predios">Prédios</TabsTrigger>
          <TabsTrigger value="andares">Andares</TabsTrigger>
          <TabsTrigger value="setores">Setores</TabsTrigger>
          <TabsTrigger value="centros">Centros de Custo</TabsTrigger>
        </TabsList>

        <TabsContent value="unidades" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setDialogUnidade(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Unidade
            </Button>
          </div>
          <UnidadesTable items={unidades} />
          <DialogUnidade
            open={dialogUnidade}
            onOpenChange={setDialogUnidade}
            onSuccess={() => {
              setDialogUnidade(false);
              invalidate();
              toast({ title: 'Unidade criada com sucesso.' });
            }}
            onError={(msg) => toast({ title: 'Erro', description: msg, variant: 'destructive' })}
          />
        </TabsContent>

        <TabsContent value="predios" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setDialogPredio(true)} disabled={unidades.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Prédio
            </Button>
          </div>
          <PrediosTable items={predios} unidades={unidades} />
          <DialogPredio
            open={dialogPredio}
            onOpenChange={setDialogPredio}
            unidades={unidades}
            onSuccess={() => {
              setDialogPredio(false);
              invalidate();
              toast({ title: 'Prédio criado com sucesso.' });
            }}
            onError={(msg) => toast({ title: 'Erro', description: msg, variant: 'destructive' })}
          />
        </TabsContent>

        <TabsContent value="andares" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setDialogAndar(true)} disabled={predios.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Andar
            </Button>
          </div>
          <AndaresTable items={andares} predios={predios} unidades={unidades} />
          <DialogAndar
            open={dialogAndar}
            onOpenChange={setDialogAndar}
            predios={predios}
            unidades={unidades}
            onSuccess={() => {
              setDialogAndar(false);
              invalidate();
              toast({ title: 'Andar criado com sucesso.' });
            }}
            onError={(msg) => toast({ title: 'Erro', description: msg, variant: 'destructive' })}
          />
        </TabsContent>

        <TabsContent value="setores" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setDialogSetor(true)} disabled={andares.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Setor
            </Button>
          </div>
          <SetoresTable
            items={setores}
            andares={andares}
            predios={predios}
            unidades={unidades}
          />
          <DialogSetor
            open={dialogSetor}
            onOpenChange={setDialogSetor}
            andares={andares}
            centrosCusto={centrosCusto}
            onSuccess={() => {
              setDialogSetor(false);
              invalidate();
              toast({ title: 'Setor criado com sucesso.' });
            }}
            onError={(msg) => toast({ title: 'Erro', description: msg, variant: 'destructive' })}
          />
        </TabsContent>

        <TabsContent value="centros" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setDialogCentroCusto(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Centro de Custo
            </Button>
          </div>
          <CentrosCustoTable items={centrosCusto} />
          <DialogCentroCusto
            open={dialogCentroCusto}
            onOpenChange={setDialogCentroCusto}
            onSuccess={() => {
              setDialogCentroCusto(false);
              invalidate();
              toast({ title: 'Centro de custo criado com sucesso.' });
            }}
            onError={(msg) => toast({ title: 'Erro', description: msg, variant: 'destructive' })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UnidadesTable({ items }: { items: UnidadeItem[] }) {
  return (
    <div className="card-corporate overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Código</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
                Nenhuma unidade cadastrada.
              </TableCell>
            </TableRow>
          ) : (
            items.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nome}</TableCell>
                <TableCell>{u.codigo ?? '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function PrediosTable({
  items,
  unidades,
}: {
  items: PredioItem[];
  unidades: UnidadeItem[];
}) {
  const unidadeNome = (id: string) => unidades.find((u) => u.id === id)?.nome ?? id;
  return (
    <div className="card-corporate overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Unidade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Nenhum prédio cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell>{p.codigo ?? '-'}</TableCell>
                <TableCell>{unidadeNome(p.unidadeId)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function AndaresTable({
  items,
  predios,
  unidades,
}: {
  items: AndarItem[];
  predios: PredioItem[];
  unidades: UnidadeItem[];
}) {
  const predioNome = (id: string) => predios.find((p) => p.id === id)?.nome ?? id;
  return (
    <div className="card-corporate overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Prédio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Nenhum andar cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            items.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.nome}</TableCell>
                <TableCell>{a.codigo ?? '-'}</TableCell>
                <TableCell>{predioNome(a.predioId)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function SetoresTable({
  items,
  andares,
  predios,
  unidades,
}: {
  items: SetorItem[];
  andares: AndarItem[];
  predios: PredioItem[];
  unidades: UnidadeItem[];
}) {
  const andarNome = (id: string) => andares.find((a) => a.id === id)?.nome ?? id;
  return (
    <div className="card-corporate overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Andar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Nenhum setor cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            items.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.nome}</TableCell>
                <TableCell>{s.codigo ?? '-'}</TableCell>
                <TableCell>{andarNome(s.andarId)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function CentrosCustoTable({ items }: { items: CentroCustoItem[] }) {
  return (
    <div className="card-corporate overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descrição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
                Nenhum centro de custo cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            items.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.codigo}</TableCell>
                <TableCell>{c.descricao}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function DialogUnidade({
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
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const mutation = useMutation({
    mutationFn: () => createUnidade({ nome, codigo: codigo || undefined }),
    onSuccess: () => {
      setNome('');
      setCodigo('');
      onSuccess();
    },
    onError: (e: Error) => onError(e.message),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      onError('Informe o nome.');
      return;
    }
    mutation.mutate();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Unidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unidade-nome">Nome *</Label>
            <Input
              id="unidade-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Sede"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unidade-codigo">Código (opcional)</Label>
            <Input
              id="unidade-codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: SEDE"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogPredio({
  open,
  onOpenChange,
  unidades,
  onSuccess,
  onError,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  unidades: UnidadeItem[];
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [unidadeId, setUnidadeId] = useState('');
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const mutation = useMutation({
    mutationFn: () =>
      createPredio({
        unidadeId,
        nome,
        codigo: codigo || undefined,
      }),
    onSuccess: () => {
      setUnidadeId('');
      setNome('');
      setCodigo('');
      onSuccess();
    },
    onError: (e: Error) => onError(e.message),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidadeId || !nome.trim()) {
      onError('Selecione a unidade e informe o nome.');
      return;
    }
    mutation.mutate();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Prédio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Unidade *</Label>
            <Select value={unidadeId || undefined} onValueChange={setUnidadeId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="predio-nome">Nome *</Label>
            <Input
              id="predio-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Bloco A"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="predio-codigo">Código (opcional)</Label>
            <Input
              id="predio-codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: BL-A"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogAndar({
  open,
  onOpenChange,
  predios,
  unidades,
  onSuccess,
  onError,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  predios: PredioItem[];
  unidades: UnidadeItem[];
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [unidadeId, setUnidadeId] = useState('');
  const [predioId, setPredioId] = useState('');
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const prediosFiltrados = unidadeId
    ? predios.filter((p) => p.unidadeId === unidadeId)
    : predios;
  const mutation = useMutation({
    mutationFn: () =>
      createAndar({
        predioId,
        nome,
        codigo: codigo || undefined,
      }),
    onSuccess: () => {
      setUnidadeId('');
      setPredioId('');
      setNome('');
      setCodigo('');
      onSuccess();
    },
    onError: (e: Error) => onError(e.message),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!predioId || !nome.trim()) {
      onError('Selecione o prédio e informe o nome.');
      return;
    }
    mutation.mutate();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Andar</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Unidade (filtrar)</Label>
            <Select value={unidadeId || undefined} onValueChange={(v) => { setUnidadeId(v); setPredioId(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Prédio *</Label>
            <Select value={predioId || undefined} onValueChange={setPredioId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o prédio" />
              </SelectTrigger>
              <SelectContent>
                {prediosFiltrados.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="andar-nome">Nome *</Label>
            <Input
              id="andar-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Térreo, 1º andar"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="andar-codigo">Código (opcional)</Label>
            <Input
              id="andar-codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: T0"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogSetor({
  open,
  onOpenChange,
  andares,
  centrosCusto,
  onSuccess,
  onError,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  andares: AndarItem[];
  centrosCusto: CentroCustoItem[];
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [andarId, setAndarId] = useState('');
  const [centroCustoId, setCentroCustoId] = useState<string>('');
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const mutation = useMutation({
    mutationFn: () =>
      createSetor({
        andarId,
        nome,
        codigo: codigo || undefined,
        centroCustoId: centroCustoId && centroCustoId !== '__none__' ? centroCustoId : null,
      }),
    onSuccess: () => {
      setAndarId('');
      setCentroCustoId('');
      setNome('');
      setCodigo('');
      onSuccess();
    },
    onError: (e: Error) => onError(e.message),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!andarId || !nome.trim()) {
      onError('Selecione o andar e informe o nome.');
      return;
    }
    mutation.mutate();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Setor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Andar *</Label>
            <Select value={andarId || undefined} onValueChange={setAndarId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o andar" />
              </SelectTrigger>
              <SelectContent>
                {andares.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Centro de custo (opcional)</Label>
            <Select value={centroCustoId || '__none__'} onValueChange={(v) => setCentroCustoId(v === '__none__' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhum</SelectItem>
                {centrosCusto.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.codigo} – {c.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="setor-nome">Nome *</Label>
            <Input
              id="setor-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: TI, Administrativo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setor-codigo">Código (opcional)</Label>
            <Input
              id="setor-codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: TI"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogCentroCusto({
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
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const mutation = useMutation({
    mutationFn: () => createCentroCusto({ codigo, descricao }),
    onSuccess: () => {
      setCodigo('');
      setDescricao('');
      onSuccess();
    },
    onError: (e: Error) => onError(e.message),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !descricao.trim()) {
      onError('Informe código e descrição.');
      return;
    }
    mutation.mutate();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Centro de Custo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cc-codigo">Código *</Label>
            <Input
              id="cc-codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: CC001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-descricao">Descrição *</Label>
            <Input
              id="cc-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Administração Geral"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
