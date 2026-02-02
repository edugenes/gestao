import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit,
  ArrowLeftRight,
  Printer,
  QrCode,
  Package,
  MapPin,
  DollarSign,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchBemById, fetchBemHistorico } from '@/lib/api-bens';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  EM_USO: { label: 'Em uso', className: 'status-active' },
  EM_MANUTENCAO: { label: 'Manutenção', className: 'status-maintenance' },
  BAIXADO: { label: 'Baixado', className: 'status-inactive' },
  OCIOSO: { label: 'Ocioso', className: 'status-transferred' },
};

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: bem, isLoading, error } = useQuery({
    queryKey: ['bem', id],
    queryFn: () => fetchBemById(id!),
    enabled: !!id,
  });

  const { data: historico = [] } = useQuery({
    queryKey: ['bem-historico', id],
    queryFn: () => fetchBemHistorico(id!),
    enabled: !!id,
  });

  if (!id) {
    navigate('/bens', { replace: true });
    return null;
  }
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (error || !bem) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/bens')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <p className="text-destructive">Bem não encontrado.</p>
      </div>
    );
  }

  const status = statusConfig[bem.situacao] ?? { label: bem.situacao, className: 'status-active' };
  const descricao = [bem.marca, bem.modelo].filter(Boolean).join(' ') || bem.numeroPatrimonial;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/bens')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="page-title">{descricao}</h1>
            <span className={cn('status-badge', status.className)}>{status.label}</span>
          </div>
          <p className="mt-1 font-mono text-sm text-primary">{bem.numeroPatrimonial}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <QrCode className="mr-2 h-4 w-4" />
            QR Code
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/bens/${bem.id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/movimentacoes?bemId=${bem.id}`)}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Movimentar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="geral" className="gap-2">
            <Package className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="localizacao" className="gap-2">
            <MapPin className="h-4 w-4" />
            Localização
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <div className="card-corporate p-6">
            <h3 className="section-title">Dados Gerais</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Número Patrimonial</label>
                <p className="mt-1 font-mono font-medium">{bem.numeroPatrimonial}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Marca</label>
                <p className="mt-1">{bem.marca ?? '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Modelo</label>
                <p className="mt-1">{bem.modelo ?? '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Número de Série</label>
                <p className="mt-1 font-mono text-sm">{bem.numeroSerie ?? '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Subcategoria</label>
                <p className="mt-1">
                  <Badge variant="outline">{bem.subcategoriaNome ?? '-'}</Badge>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Estado de Conservação</label>
                <p className="mt-1">{bem.estadoConservacao}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Observações</label>
                <p className="mt-1 text-muted-foreground">{bem.observacoes ?? '-'}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="localizacao">
          <div className="card-corporate p-6">
            <h3 className="section-title">Localização</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Setor</label>
                <p className="mt-1 font-medium">{bem.setorNome ?? '-'}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financeiro">
          <div className="card-corporate p-6">
            <h3 className="section-title">Informações Financeiras</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Data de Aquisição</label>
                <p className="mt-1">
                  {new Date(bem.dataAquisicao).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Valor de Aquisição</label>
                <p className="mt-1 text-lg font-semibold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bem.valorAquisicao)}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Vida Útil</label>
                <p className="mt-1">{bem.vidaUtilMeses} meses</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historico">
          <div className="card-corporate p-6">
            <h3 className="section-title">Histórico de Alterações</h3>
            {historico.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma alteração registrada.</p>
            ) : (
              <div className="relative space-y-4">
                {historico.map((item, index) => (
                  <div key={item.id} className="relative flex gap-4 pb-4">
                    {index !== historico.length - 1 && (
                      <div className="absolute left-[15px] top-8 h-full w-0.5 bg-border" />
                    )}
                    <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                      <History className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm font-medium">
                        {item.campo}: {item.valorAnterior ?? '-'} → {item.valorNovo ?? '-'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
