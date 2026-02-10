import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createBem, type CreateBemBody } from '@/lib/api-bens';
import { invalidateDashboardQueries } from '@/lib/api-dashboard';
import {
  fetchCategorias,
  fetchSubcategoriasByCategoria,
} from '@/lib/api-bens';
import { fetchSetores } from '@/lib/api-estrutura';
import { useToast } from '@/hooks/use-toast';

const ESTADO_CONSERVACAO_OPTIONS = [
  { value: 'OTIMO', label: 'Ótimo' },
  { value: 'BOM', label: 'Bom' },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'RUIM', label: 'Ruim' },
  { value: 'PESSIMO', label: 'Péssimo' },
] as const;

const SITUACAO_OPTIONS = [
  { value: 'EM_USO', label: 'Em uso' },
  { value: 'EM_MANUTENCAO', label: 'Em manutenção' },
  { value: 'OCIOSO', label: 'Ocioso' },
  { value: 'BAIXADO', label: 'Baixado' },
] as const;

export default function NovoBem() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [numeroPatrimonial, setNumeroPatrimonial] = useState('');
  const [setorId, setSetorId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [subcategoriaId, setSubcategoriaId] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [valorAquisicao, setValorAquisicao] = useState('');
  const [dataAquisicao, setDataAquisicao] = useState('');
  const [vidaUtilMeses, setVidaUtilMeses] = useState('');
  const [garantiaMeses, setGarantiaMeses] = useState('');
  const [estadoConservacao, setEstadoConservacao] = useState<string>('BOM');
  const [situacao, setSituacao] = useState<string>('EM_USO');
  const [observacoes, setObservacoes] = useState('');

  const { data: setoresData } = useQuery({
    queryKey: ['setores'],
    queryFn: () => fetchSetores({ limit: 200 }),
  });
  const { data: categoriasData } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => fetchCategorias({ limit: 200 }),
  });
  const { data: subcategoriasData } = useQuery({
    queryKey: ['subcategorias', categoriaId],
    queryFn: () => fetchSubcategoriasByCategoria(categoriaId),
    enabled: !!categoriaId,
  });

  const setores = setoresData?.data ?? [];
  const categorias = categoriasData?.data ?? [];
  const subcategorias = subcategoriasData ?? [];

  const mutation = useMutation({
    mutationFn: (body: CreateBemBody) => createBem(body),
    onSuccess: (data) => {
      invalidateDashboardQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['bens'] });
      toast({ title: 'Bem patrimonial cadastrado. Imprima a etiqueta para colar no bem.' });
      navigate(`/bens/${data.id}/etiqueta`);
    },
    onError: (e: Error) => {
      toast({
        title: 'Erro ao cadastrar bem',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(String(valorAquisicao || '').replace(',', '.'));
    const vidaNum = parseInt(String(vidaUtilMeses || ''), 10);
    if (!numeroPatrimonial.trim()) {
      toast({ title: 'Informe o número patrimonial.', variant: 'destructive' });
      return;
    }
    if (!setorId) {
      toast({ title: 'Selecione o setor.', variant: 'destructive' });
      return;
    }
    if (Number.isNaN(valorNum) || valorNum <= 0) {
      toast({ title: 'Valor de aquisição inválido.', variant: 'destructive' });
      return;
    }
    if (!dataAquisicao) {
      toast({ title: 'Informe a data de aquisição.', variant: 'destructive' });
      return;
    }
    if (Number.isNaN(vidaNum) || vidaNum <= 0) {
      toast({ title: 'Vida útil em meses inválida.', variant: 'destructive' });
      return;
    }
    const body: CreateBemBody = {
      numeroPatrimonial: numeroPatrimonial.trim(),
      setorId,
      subcategoriaId: subcategoriaId && subcategoriaId !== '__none__' ? subcategoriaId : null,
      marca: marca.trim() || null,
      modelo: modelo.trim() || null,
      numeroSerie: numeroSerie.trim() || null,
      valorAquisicao: valorNum,
      dataAquisicao: dataAquisicao,
      vidaUtilMeses: vidaNum,
      garantiaMeses: garantiaMeses ? parseInt(garantiaMeses, 10) : null,
      estadoConservacao: estadoConservacao as CreateBemBody['estadoConservacao'],
      situacao: situacao as CreateBemBody['situacao'],
      observacoes: observacoes.trim() || null,
    };
    mutation.mutate(body);
  };

  const handleCategoriaChange = (value: string) => {
    setCategoriaId(value === '__none__' ? '' : value);
    setSubcategoriaId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/bens')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="page-title">Novo Bem Patrimonial</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre um novo bem com número patrimonial e localização
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="card-corporate">
          <CardHeader>
            <CardTitle>Dados do bem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="numeroPatrimonial">Número patrimonial *</Label>
                <Input
                  id="numeroPatrimonial"
                  value={numeroPatrimonial}
                  onChange={(e) => setNumeroPatrimonial(e.target.value)}
                  placeholder="Ex: 12345"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setorId">Setor *</Label>
                <Select value={setorId || undefined} onValueChange={setSetorId} required>
                  <SelectTrigger id="setorId">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Categoria (opcional)</Label>
                <Select value={categoriaId || '__none__'} onValueChange={handleCategoriaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma</SelectItem>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategoria (opcional)</Label>
                <Select
                  value={subcategoriaId || '__none__'}
                  onValueChange={(v) => setSubcategoriaId(v === '__none__' ? '' : v)}
                  disabled={!categoriaId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma</SelectItem>
                    {subcategorias.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Ex: Dell"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ex: OptiPlex 7090"
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroSerie">Número de série</Label>
                <Input
                  id="numeroSerie"
                  value={numeroSerie}
                  onChange={(e) => setNumeroSerie(e.target.value)}
                  placeholder="Opcional"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="valorAquisicao">Valor de aquisição (R$) *</Label>
                <Input
                  id="valorAquisicao"
                  type="text"
                  inputMode="decimal"
                  value={valorAquisicao}
                  onChange={(e) => setValorAquisicao(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataAquisicao">Data de aquisição *</Label>
                <Input
                  id="dataAquisicao"
                  type="date"
                  value={dataAquisicao}
                  onChange={(e) => setDataAquisicao(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vidaUtilMeses">Vida útil (meses) *</Label>
                <Input
                  id="vidaUtilMeses"
                  type="number"
                  min={1}
                  value={vidaUtilMeses}
                  onChange={(e) => setVidaUtilMeses(e.target.value)}
                  placeholder="Ex: 60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="garantiaMeses">Garantia (meses)</Label>
                <Input
                  id="garantiaMeses"
                  type="number"
                  min={1}
                  value={garantiaMeses}
                  onChange={(e) => setGarantiaMeses(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estadoConservacao">Estado de conservação *</Label>
                <Select
                  value={estadoConservacao}
                  onValueChange={setEstadoConservacao}
                >
                  <SelectTrigger id="estadoConservacao">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADO_CONSERVACAO_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="situacao">Situação</Label>
                <Select value={situacao} onValueChange={setSituacao}>
                  <SelectTrigger id="situacao">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SITUACAO_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Opcional"
                rows={3}
                maxLength={2000}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/bens')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : 'Cadastrar bem'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
