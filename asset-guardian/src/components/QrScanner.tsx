import { useEffect, useRef, useId } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface QrScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
  title?: string;
  onError?: (message: string) => void;
}

export function QrScanner({ open, onClose, onScan, title = 'Ler QR Code', onError }: QrScannerProps) {
  const id = useId().replace(/:/g, '');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = `qr-reader-${id}`;

  useEffect(() => {
    if (!open) return;

    const start = async () => {
      try {
        const scanner = new Html5Qrcode(containerId);
        // No mobile, usar qrbox maior (80% da largura mínima)
        // No desktop, usar tamanho fixo menor
        const isMobile = window.innerWidth < 640;
        const qrboxSize = isMobile ? Math.min(window.innerWidth * 0.8, 300) : 250;
        
        await scanner.start(
          { facingMode: 'environment' },
          { 
            fps: 10, // Mais FPS para melhor responsividade
            qrbox: { width: qrboxSize, height: qrboxSize },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            onScan(decodedText);
            scanner.stop().catch(() => {});
            onClose();
          },
          () => {}
        );
        scannerRef.current = scanner;
      } catch (err) {
        console.error('Erro ao iniciar câmera:', err);
        const message =
          err instanceof Error
            ? err.message
            : 'Não foi possível acessar a câmera deste dispositivo.';
        onError?.(
          `${message} Verifique se o navegador tem permissão para usar a câmera e se está usando o modo seguro (https ou rede local confiável).`
        );
      }
    };

    start();
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      scannerRef.current = null;
    };
  }, [open, containerId, onScan, onClose]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-full w-full h-[100dvh] sm:h-auto sm:max-w-md sm:rounded-lg p-0 sm:p-6 flex flex-col">
        <DialogHeader className="px-4 pt-4 sm:px-0 sm:pt-0 shrink-0">
          <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div id={containerId} className="w-full flex-1 rounded-lg overflow-hidden bg-muted min-h-[60vh] sm:min-h-[240px] sm:flex-none" />
        <div className="px-4 pb-4 pt-2 sm:px-0 sm:pb-0 shrink-0">
          <Button variant="outline" onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
