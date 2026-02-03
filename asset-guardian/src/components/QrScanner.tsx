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
}

export function QrScanner({ open, onClose, onScan, title = 'Ler QR Code' }: QrScannerProps) {
  const id = useId().replace(/:/g, '');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = `qr-reader-${id}`;

  useEffect(() => {
    if (!open) return;

    const start = async () => {
      try {
        const scanner = new Html5Qrcode(containerId);
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 5, qrbox: { width: 250, height: 250 } },
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div id={containerId} className="rounded-lg overflow-hidden bg-muted min-h-[240px]" />
        <Button variant="outline" onClick={onClose} className="w-full">
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
