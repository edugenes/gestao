import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetTable, type Asset } from '@/components/assets/AssetTable';
import { AssetFilters } from '@/components/assets/AssetFilters';
import { fetchBens } from '@/lib/api-bens';
import { fetchSetores } from '@/lib/api-estrutura';
import { getSettings } from '@/lib/settings';
import { useToast } from '@/hooks/use-toast';

function situacaoToStatus(situacao: string): Asset['status'] {
  switch (situacao) {
    case 'EM_USO':
      return 'ativo';
    case 'EM_MANUTENCAO':
      return 'manutencao';
    case 'BAIXADO':
      return 'baixado';
    case 'OCIOSO':
      return 'transferido';
    default:
      return 'ativo';
  }
}

function bemToAsset(b: {
  id: string;
  numeroPatrimonial: string;
  setorNome?: string;
  subcategoriaNome?: string | null;
  marca: string | null;
  modelo: string | null;
  valorAquisicao: number;
  situacao: string;
  dataAquisicao: string;
}): Asset {
  return {
    id: b.id,
    patrimonio: b.numeroPatrimonial,
    descricao: [b.marca, b.modelo].filter(Boolean).join(' ') || '-',
    categoria: b.subcategoriaNome ?? '-',
    setor: b.setorNome ?? '-',
    responsavel: '-',
    valor: b.valorAquisicao,
    status: situacaoToStatus(b.situacao),
    dataAquisicao: b.dataAquisicao.slice(0, 10),
  };
}

export default function Assets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const situacaoParam = statusFilter && statusFilter !== 'all'
    ? (statusFilter === 'ativo' ? 'EM_USO' : statusFilter === 'manutencao' ? 'EM_MANUTENCAO' : statusFilter === 'baixado' ? 'BAIXADO' : 'OCIOSO')
    : undefined;

  const limit = getSettings().itensPorPagina;
  const { data, isLoading, error } = useQuery({
    queryKey: ['bens', page, limit, searchTerm, situacaoParam, sectorFilter],
    queryFn: () =>
      fetchBens({
        page,
        limit,
        numeroPatrimonial: searchTerm || undefined,
        situacao: situacaoParam,
        setorId: sectorFilter && sectorFilter !== 'all' ? sectorFilter : undefined,
      }),
  });

  const { data: setoresData } = useQuery({
    queryKey: ['setores'],
    queryFn: () => fetchSetores({ limit: 200 }),
  });
  const setorOptions = (setoresData?.data ?? []).map((s) => ({ value: s.id, label: s.nome }));

  const assets: Asset[] = data?.data?.map(bemToAsset) ?? [];
  const total = data?.total ?? 0;

  const handleView = (asset: Asset) => {
    navigate(`/bens/${asset.id}`);
  };

  const handleEdit = (asset: Asset) => {
    navigate(`/bens/${asset.id}/editar`);
  };

  const handleTransfer = (asset: Asset) => {
    navigate(`/movimentacoes?bemId=${asset.id}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
    setSectorFilter('');
    setPage(1);
  };

  if (error) {
    toast({
      title: 'Erro ao carregar bens',
      description: error instanceof Error ? error.message : 'Tente novamente.',
      variant: 'destructive',
    });
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bens Patrimoniais</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todos os bens patrimoniais da instituição
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => navigate('/bens/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Bem
          </Button>
        </div>
      </div>

      <AssetFilters
        searchTerm={searchTerm}
        onSearchChange={(v) => { setSearchTerm(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
        categoryFilter={categoryFilter}
        onCategoryChange={(v) => { setCategoryFilter(v); setPage(1); }}
        sectorFilter={sectorFilter}
        onSectorChange={(v) => { setSectorFilter(v); setPage(1); }}
        onClearFilters={clearFilters}
        setorOptions={setorOptions}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Carregando...' : (
            <>
              Exibindo <span className="font-medium">{assets.length}</span> de{' '}
              <span className="font-medium">{total}</span> bens
            </>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="card-corporate flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <AssetTable
          assets={assets}
          onView={handleView}
          onEdit={handleEdit}
          onTransfer={handleTransfer}
        />
      )}

      {total > limit && (
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
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
