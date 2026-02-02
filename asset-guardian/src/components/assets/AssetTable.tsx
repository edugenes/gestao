import { useState } from 'react';
import { Eye, Edit, ArrowLeftRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Asset {
  id: string;
  patrimonio: string;
  descricao: string;
  categoria: string;
  setor: string;
  responsavel: string;
  valor: number;
  status: 'ativo' | 'manutencao' | 'baixado' | 'transferido';
  dataAquisicao: string;
}

interface AssetTableProps {
  assets: Asset[];
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onTransfer: (asset: Asset) => void;
}

const statusConfig = {
  ativo: { label: 'Ativo', className: 'status-active' },
  manutencao: { label: 'Manutenção', className: 'status-maintenance' },
  baixado: { label: 'Baixado', className: 'status-inactive' },
  transferido: { label: 'Transferido', className: 'status-transferred' },
};

export function AssetTable({ assets, onView, onEdit, onTransfer }: AssetTableProps) {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="card-corporate overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th className="w-12">
              <Checkbox
                checked={selectedAssets.length === assets.length}
                onCheckedChange={toggleSelectAll}
              />
            </th>
            <th>Patrimônio</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Setor</th>
            <th>Responsável</th>
            <th className="text-right">Valor</th>
            <th>Status</th>
            <th className="w-24">Ações</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const status = statusConfig[asset.status];
            return (
              <tr key={asset.id} className="group">
                <td>
                  <Checkbox
                    checked={selectedAssets.includes(asset.id)}
                    onCheckedChange={() => toggleSelect(asset.id)}
                  />
                </td>
                <td>
                  <span className="font-mono text-sm font-medium text-primary">
                    {asset.patrimonio}
                  </span>
                </td>
                <td>
                  <span className="font-medium">{asset.descricao}</span>
                </td>
                <td>
                  <Badge variant="outline">{asset.categoria}</Badge>
                </td>
                <td>{asset.setor}</td>
                <td>{asset.responsavel}</td>
                <td className="text-right font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(asset.valor)}
                </td>
                <td>
                  <span className={cn('status-badge', status.className)}>
                    {status.label}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onView(asset)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(asset)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onTransfer(asset)}>
                          <ArrowLeftRight className="mr-2 h-4 w-4" />
                          Movimentar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
