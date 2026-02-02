import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Relatórios gerenciais e exportações
        </p>
      </div>
      <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Em breve</h2>
          <p className="text-sm text-muted-foreground">
            Esta seção estará disponível em uma próxima versão.
          </p>
        </div>
      </Card>
    </div>
  );
}
