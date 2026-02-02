import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface AssetFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sectorFilter: string;
  onSectorChange: (value: string) => void;
  onClearFilters: () => void;
  /** Opções de setor da API (id -> nome) */
  setorOptions?: Array<{ value: string; label: string }>;
}

export function AssetFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  sectorFilter,
  onSectorChange,
  onClearFilters,
  setorOptions = [],
}: AssetFiltersProps) {
  const hasFilters = searchTerm || statusFilter || categoryFilter || sectorFilter;

  return (
    <div className="card-corporate p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número patrimonial ou descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="manutencao">Em Manutenção</SelectItem>
            <SelectItem value="baixado">Baixado</SelectItem>
            <SelectItem value="transferido">Transferido</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            <SelectItem value="informatica">Informática</SelectItem>
            <SelectItem value="mobiliario">Mobiliário</SelectItem>
            <SelectItem value="equipamentos">Equipamentos</SelectItem>
            <SelectItem value="veiculos">Veículos</SelectItem>
            <SelectItem value="eletrodomesticos">Eletrodomésticos</SelectItem>
          </SelectContent>
        </Select>

        {/* Sector Filter */}
        <Select value={sectorFilter} onValueChange={onSectorChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos setores</SelectItem>
            {setorOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtros ativos:</span>
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              Busca: "{searchTerm}"
            </Badge>
          )}
          {statusFilter && statusFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Status: {statusFilter}
            </Badge>
          )}
          {categoryFilter && categoryFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Categoria: {categoryFilter}
            </Badge>
          )}
          {sectorFilter && sectorFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Setor: {sectorFilter}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
