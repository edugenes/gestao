import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, Loader2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchBensParaEtiquetas, type BemEtiquetaItem } from '@/lib/api-bens';
import { fetchSetores } from '@/lib/api-estrutura';
import { useToast } from '@/hooks/use-toast';

/** Valor usado no Select para "Todas" (Radix não permite value vazio em SelectItem). */
const SITUACAO_ALL = '__all__';

const SITUACAO_OPTIONS = [
  { value: SITUACAO_ALL, label: 'Todas' },
  { value: 'EM_USO', label: 'Em uso' },
  { value: 'EM_MANUTENCAO', label: 'Em manutenção' },
  { value: 'OCIOSO', label: 'Ocioso' },
  { value: 'BAIXADO', label: 'Baixado' },
];

function descricao(b: BemEtiquetaItem): string {
  return [b.marca, b.modelo].filter(Boolean).join(' ') || b.numeroPatrimonial;
}

/**
 * Página para gerar etiquetas com QR em lote para bens já cadastrados.
 * Permite filtrar por setor/situação, selecionar bens e imprimir em grid.
 * A lista de bens é carregada automaticamente ao abrir a página.
 */
export default function EtiquetasLote() {
  const { toast } = useToast();
  const [setorId, setSetorId] = useState<string>('');
  const [situacao, setSituacao] = useState<string>(SITUACAO_ALL);
  const [numeroPatrimonial, setNumeroPatrimonial] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPrintView, setShowPrintView] = useState(false);
  /** Filtros aplicados na última busca (vazios no mount = carrega todos) */
  const [appliedSetorId, setAppliedSetorId] = useState<string>('');
  const [appliedSituacao, setAppliedSituacao] = useState<string>('');
  const [appliedNumeroPatrimonial, setAppliedNumeroPatrimonial] = useState('');

  const { data: setoresData } = useQuery({
    queryKey: ['setores'],
    queryFn: () => fetchSetores({ limit: 200 }),
  });
  const setorOptions = (setoresData?.data ?? []).map((s) => ({
    value: s.id,
    label: s.nome,
  }));

  const {
    data: bensList = [],
    isLoading: loading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['bens-etiquetas', appliedSetorId, appliedSituacao, appliedNumeroPatrimonial],
    queryFn: () =>
      fetchBensParaEtiquetas({
        setorId: appliedSetorId || undefined,
        situacao: appliedSituacao && appliedSituacao !== SITUACAO_ALL ? appliedSituacao : undefined,
        numeroPatrimonial: appliedNumeroPatrimonial.trim() || undefined,
        limit: 2000,
      }),
  });

  useEffect(() => {
    if (bensList.length > 0) {
      setSelectedIds(new Set(bensList.map((b) => b.id)));
    }
  }, [bensList]);

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar a lista de bens.',
        variant: 'destructive',
      });
    }
  }, [isError, toast]);

  const handleCarregar = useCallback(() => {
    setAppliedSetorId(setorId);
    setAppliedSituacao(situacao === SITUACAO_ALL ? '' : situacao);
    setAppliedNumeroPatrimonial(numeroPatrimonial);
    refetch();
    toast({
      title: 'Filtros aplicados',
      description: 'Lista atualizada com os filtros selecionados.',
    });
  }, [setorId, situacao, numeroPatrimonial, refetch, toast]);

  const toggleSelectAll = () => {
    if (selectedIds.size === bensList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bensList.map((b) => b.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedBens = bensList.filter((b) => selectedIds.has(b.id));

  const handleGerarImpressao = () => {
    if (selectedBens.length === 0) {
      toast({
        title: 'Nenhum bem selecionado',
        description: 'Selecione ao menos um bem para gerar etiquetas.',
        variant: 'destructive',
      });
      return;
    }
    setShowPrintView(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (showPrintView) {
    return (
      <div className="etiquetas-lote-print-area space-y-6 p-6 print:p-0">
        <div className="flex flex-wrap items-center gap-4 no-print">
          <Button variant="ghost" size="icon" onClick={() => setShowPrintView(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-5 w-5" />
            Imprimir etiquetas
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedBens.length} etiqueta(s). Use impressora de etiquetas ou corte no tamanho desejado.
          </span>
        </div>

        <div className="etiquetas-grid grid grid-cols-2 gap-4 print:grid-cols-4 print:gap-2 print:gap-y-4 md:grid-cols-3">
          {selectedBens.map((bem) => (
            <div
              key={bem.id}
              className="etiqueta-cell flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-white p-4 print:border-none print:border-0 print:shadow-none print:w-[50mm] print:min-h-[30mm] print:inline-flex"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-white p-1">
                  <QRCodeSVG
                    value={bem.numeroPatrimonial}
                    size={80}
                    level="M"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-lg font-bold tracking-tight text-black">
                    {bem.numeroPatrimonial}
                  </p>
                  <p className="mt-0.5 max-w-[140px] truncate text-xs text-black">
                    {descricao(bem)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            .etiquetas-lote-print-area, .etiquetas-lote-print-area * { visibility: visible; }
            .no-print { display: none !important; }
            .etiquetas-lote-print-area { padding: 0; }
            .etiquetas-grid {
              display: grid !important;
              grid-template-columns: repeat(4, 50mm);
              gap: 4mm;
              padding: 10mm;
            }
            .etiqueta-cell {
              width: 50mm;
              min-height: 30mm;
              border: none !important;
              box-shadow: none !important;
              page-break-inside: avoid;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Etiquetas em lote</h1>
          <p className="text-sm text-muted-foreground">
            Gere QR codes para itens já cadastrados. Filtre, selecione e imprima em uma única folha.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Filtros</h2>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full min-w-[200px] max-w-[240px]">
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Setor</label>
            <Select value={setorId || 'all'} onValueChange={(v) => setSetorId(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os setores</SelectItem>
                {setorOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full min-w-[160px] max-w-[200px]">
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Situação</label>
            <Select value={situacao} onValueChange={setSituacao}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
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
          <div className="w-full min-w-[200px] max-w-[280px]">
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Número patrimonial</label>
            <Input
              placeholder="Busca parcial (opcional)"
              value={numeroPatrimonial}
              onChange={(e) => setNumeroPatrimonial(e.target.value)}
            />
          </div>
          <Button onClick={handleCarregar} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando…
              </>
            ) : (
              'Aplicar filtros'
            )}
          </Button>
        </div>
      </Card>

      {bensList.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{bensList.length} bem(ns) carregado(s)</span>
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selecionado(s)
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {selectedIds.size === bensList.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </Button>
              <Button onClick={handleGerarImpressao} disabled={selectedIds.size === 0}>
                <Printer className="mr-2 h-4 w-4" />
                Gerar etiquetas para impressão
              </Button>
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80">
                <tr>
                  <th className="w-12 px-4 py-2 text-left">
                    <Checkbox
                      checked={selectedIds.size === bensList.length && bensList.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Nº patrimonial</th>
                  <th className="px-4 py-2 text-left font-medium">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {bensList.map((b) => (
                  <tr key={b.id} className="border-t border-border hover:bg-muted/50">
                    <td className="w-12 px-4 py-2">
                      <Checkbox
                        checked={selectedIds.has(b.id)}
                        onCheckedChange={() => toggleSelect(b.id)}
                        aria-label={`Selecionar ${b.numeroPatrimonial}`}
                      />
                    </td>
                    <td className="px-4 py-2 font-mono">{b.numeroPatrimonial}</td>
                    <td className="px-4 py-2 text-muted-foreground">{descricao(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {bensList.length === 0 && !loading && (
        <Card className="p-8 text-center text-muted-foreground">
          Nenhum bem encontrado com os filtros atuais. Ajuste os filtros e clique em &quot;Aplicar filtros&quot; ou aguarde o carregamento.
        </Card>
      )}
    </div>
  );
}
