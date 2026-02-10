import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Settings, Building2, Palette, List, Info, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getSettings,
  saveSettings,
  ITENS_POR_PAGINA_OPTIONS,
  type InstituicaoConfig,
} from '@/lib/settings';
import {
  isApp,
  getStoredApiBaseUrl,
  setStoredApiBaseUrl,
  clearBaseUrlCache,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const THEME_OPTIONS = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
] as const;

export default function Configuracoes() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [instituicao, setInstituicao] = useState<InstituicaoConfig>({
    nome: '',
    cnpj: '',
    endereco: '',
  });
  const [itensPorPagina, setItensPorPagina] = useState(20);
  const [mounted, setMounted] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const s = getSettings();
    setInstituicao(s.instituicao);
    setItensPorPagina(s.itensPorPagina);
    if (isApp()) setApiBaseUrl(getStoredApiBaseUrl() || 'http://192.168.0.250:3001');
  }, []);

  const handleSaveInstituicao = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({ instituicao });
    toast({ title: 'Dados da instituição salvos.' });
  };

  const handleSavePreferencias = () => {
    saveSettings({ itensPorPagina });
    toast({ title: 'Preferências salvas.' });
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    toast({ title: 'Tema alterado.' });
  };

  const handleSaveServidor = (e: React.FormEvent) => {
    e.preventDefault();
    const url = apiBaseUrl.trim().replace(/\/$/, '');
    if (!url) {
      toast({ title: 'Informe a URL do servidor.', variant: 'destructive' });
      return;
    }
    setStoredApiBaseUrl(url);
    clearBaseUrlCache();
    toast({ title: 'Servidor salvo. As próximas requisições usarão esta URL.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Parâmetros do sistema e preferências de exibição
        </p>
      </div>

      {/* Servidor (só no app) */}
      {isApp() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Servidor (uso no app)
            </CardTitle>
            <CardDescription>
              URL do backend na rede local. Ex.: http://192.168.0.250:3001
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveServidor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-base-url">URL do servidor</Label>
                <Input
                  id="api-base-url"
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                  placeholder="http://192.168.0.250:3001"
                  type="url"
                />
              </div>
              <Button type="submit">Salvar e usar este servidor</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Aparência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Aparência
          </CardTitle>
          <CardDescription>
            Escolha o tema de exibição do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            {mounted ? (
              <Select
                value={theme ?? 'system'}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Sistema" />
                </SelectTrigger>
                <SelectContent>
                  {THEME_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 max-w-xs rounded-md border bg-muted animate-pulse" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dados da instituição */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados da instituição
          </CardTitle>
          <CardDescription>
            Nome, CNPJ e endereço para relatórios e documentos (apenas local)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveInstituicao} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inst-nome">Nome da instituição</Label>
              <Input
                id="inst-nome"
                value={instituicao.nome}
                onChange={(e) =>
                  setInstituicao((p) => ({ ...p, nome: e.target.value }))
                }
                placeholder="Ex: Hospital Municipal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inst-cnpj">CNPJ</Label>
              <Input
                id="inst-cnpj"
                value={instituicao.cnpj}
                onChange={(e) =>
                  setInstituicao((p) => ({ ...p, cnpj: e.target.value }))
                }
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inst-endereco">Endereço</Label>
              <Textarea
                id="inst-endereco"
                value={instituicao.endereco}
                onChange={(e) =>
                  setInstituicao((p) => ({ ...p, endereco: e.target.value }))
                }
                placeholder="Rua, número, bairro, cidade – CEP"
                rows={2}
              />
            </div>
            <Button type="submit">Salvar dados da instituição</Button>
          </form>
        </CardContent>
      </Card>

      {/* Preferências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Preferências de listagem
          </CardTitle>
          <CardDescription>
            Quantidade de itens por página nas listagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Itens por página</Label>
            <Select
              value={String(itensPorPagina)}
              onValueChange={(v) => setItensPorPagina(Number(v))}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITENS_POR_PAGINA_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSavePreferencias}>Salvar preferências</Button>
        </CardContent>
      </Card>

      {/* Sobre */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Sobre
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Ventrys</span> – Gestão de Patrimônio
          </p>
          <p>Versão 1.0.0</p>
          <p className="pt-2 border-t border-border mt-2">
            Desenvolvido por <span className="font-medium text-foreground">Eduardo Genes Vieira</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
