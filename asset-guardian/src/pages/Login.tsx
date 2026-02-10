import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Loader2, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isApp, getStoredApiBaseUrl, setStoredApiBaseUrl, clearBaseUrlCache } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [configOpen, setConfigOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const appMode = isApp();

  useEffect(() => {
    if (appMode) setServerUrl(getStoredApiBaseUrl() || 'http://192.168.0.250:3001');
  }, [appMode]);

  const handleSaveServidor = () => {
    const url = serverUrl.trim().replace(/\/$/, '');
    if (!url) {
      toast({ title: 'Informe a URL do servidor.', variant: 'destructive' });
      return;
    }
    // Salva e limpa cache para usar imediatamente
    setStoredApiBaseUrl(url);
    clearBaseUrlCache();
    console.log(`✅ URL do servidor salva: ${url}`);
    toast({ title: 'Servidor salvo. Tente fazer login novamente.' });
    setConfigOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha login e senha.',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      // Garante uso da URL mais recente salva no app
      clearBaseUrlCache();
      await login(email.trim(), password);
      toast({ title: 'Login realizado', description: 'Bem-vindo ao sistema.' });
      navigate('/', { replace: true });
    } catch (err) {
      toast({
        title: 'Erro no login',
        description: err instanceof Error ? err.message : 'Login ou senha inválidos.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-8 rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold">Ventrys</h1>
          <p className="text-center text-sm text-muted-foreground">
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Login</Label>
            <Input
              id="email"
              type="text"
              placeholder="Ex: admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar (APP)'
            )}
          </Button>
          {appMode && (
            <Dialog open={configOpen} onOpenChange={setConfigOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="w-full text-muted-foreground">
                  <Wifi className="mr-2 h-4 w-4" />
                  Configurar servidor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>URL do servidor</DialogTitle>
                  <DialogDescription>
                    Informe o endereço do backend na rede. Ex.: http://192.168.0.250:3001
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-2">
                  <Label htmlFor="login-server-url">URL</Label>
                  <Input
                    id="login-server-url"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="http://192.168.0.250:3001"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveServidor}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </form>
      </div>
    </div>
  );
}
