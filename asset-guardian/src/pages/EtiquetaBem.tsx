import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchBemById } from '@/lib/api-bens';

/**
 * Página de etiqueta para impressão em etiquetadora.
 * O QR contém o número patrimonial; ao escanear, o app busca o bem.
 * Layout otimizado para impressão (uma etiqueta por página).
 */
export default function EtiquetaBem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: bem, isLoading, error } = useQuery({
    queryKey: ['bem', id],
    queryFn: () => fetchBemById(id!),
    enabled: !!id,
  });

  const handlePrint = () => {
    window.print();
  };

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
      <div className="space-y-4 p-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/bens')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <p className="text-destructive">Bem não encontrado.</p>
      </div>
    );
  }

  const descricao = [bem.marca, bem.modelo].filter(Boolean).join(' ') || bem.numeroPatrimonial;

  return (
    <div className="etiqueta-print-area space-y-6 p-6 print:p-0">
      {/* Barra de ações – oculta na impressão */}
      <div className="flex items-center gap-4 no-print">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/bens/${bem.id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-5 w-5" />
          Imprimir etiqueta
        </Button>
        <p className="text-sm text-muted-foreground">
          Use a impressora de etiquetas. O QR contém o número patrimonial para leitura no inventário.
        </p>
      </div>

      {/* Área da etiqueta – tamanho típico para etiquetadora (ex.: 50x30mm) */}
      <div className="etiqueta-container flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-white p-4 print:border-none print:border-0 print:shadow-none">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 bg-white p-1">
            <QRCodeSVG
              value={bem.numeroPatrimonial}
              size={120}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-2xl font-bold tracking-tight text-black">
              {bem.numeroPatrimonial}
            </p>
            <p className="mt-1 max-w-[180px] truncate text-sm text-black">
              {descricao}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .etiqueta-print-area, .etiqueta-print-area * { visibility: visible; }
          .etiqueta-print-area { position: fixed; left: 0; top: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: white; padding: 0; }
          .no-print { display: none !important; }
          .etiqueta-container {
            border: none !important;
            box-shadow: none !important;
            width: 50mm;
            min-height: 30mm;
          }
        }
      `}</style>
    </div>
  );
}
