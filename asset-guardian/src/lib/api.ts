/**
 * Cliente HTTP para a API do backend Patrimônio.
 * Base URL: VITE_API_URL, app (Capacitor) usa localStorage API_BASE_URL, ou detecta automaticamente.
 * JWT: Authorization Bearer; refresh automático em 401.
 */

const STORAGE_API_BASE_URL = 'API_BASE_URL';

let cachedBaseUrl: string | null = null;

function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  // Verifica múltiplas formas de detectar Capacitor
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } }).Capacitor;
  if (cap) {
    // Método 1: isNativePlatform()
    if (cap.isNativePlatform?.()) return true;
    // Método 2: getPlatform() retorna 'android' ou 'ios'
    const platform = cap.getPlatform?.();
    if (platform === 'android' || platform === 'ios') return true;
  }
  // Método 3: Verifica se está em um WebView do Capacitor (userAgent ou protocol)
  if (window.location.protocol === 'capacitor:' || window.location.protocol === 'http:' && window.location.hostname === 'localhost') {
    // Se está em localhost mas não é navegador normal, pode ser Capacitor
    const ua = navigator.userAgent || '';
    if (ua.includes('Capacitor') || ua.includes('Android')) return true;
  }
  return false;
}

/**
 * Detecta a URL base da API.
 * - App (Capacitor): usa localStorage API_BASE_URL (configurável na tela Configuração)
 * - VITE_API_URL definido: usa ele
 * - Navegador: detecta por hostname/protocol (HTTPS 8443 = mesma origem, senão host:3001)
 */
function getBaseUrl(): string {
  if (cachedBaseUrl !== null) return cachedBaseUrl;

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    cachedBaseUrl = envUrl.trim();
    return cachedBaseUrl;
  }

  if (typeof window === 'undefined') {
    cachedBaseUrl = 'http://localhost:3001';
    return cachedBaseUrl;
  }

  // SEMPRE verifica localStorage primeiro (mesmo que não seja Capacitor)
  // Isso permite configurar URL manualmente em qualquer contexto
  const stored = localStorage.getItem(STORAGE_API_BASE_URL);
  if (stored && stored.trim()) {
    cachedBaseUrl = stored.trim().replace(/\/$/, '');
    console.log(`🔗 API (usando URL salva): ${cachedBaseUrl}`);
    return cachedBaseUrl;
  }

  // App Android/iOS: detecta Capacitor e usa padrão se não houver URL salva
  const isNative = isCapacitorNative();
  console.log(`📱 Capacitor detectado: ${isNative}`);
  console.log(`💾 URL salva no localStorage: ${stored || '(vazio)'}`);
  
  if (isNative) {
    // Padrão para app: usar IP comum
    cachedBaseUrl = 'http://192.168.0.250:3001';
    console.log(`🔗 API (app, padrão): ${cachedBaseUrl}`);
    console.log(`⚠️ Configure a URL do servidor em Configurações ou na tela de login`);
    return cachedBaseUrl;
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port || (protocol === 'https:' ? '443' : '80');

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
    cachedBaseUrl = 'http://localhost:3001';
  } else if (protocol === 'https:' && (port === '8443' || port === '443')) {
    cachedBaseUrl = window.location.origin;
  } else {
    const finalProtocol = protocol === 'https:' ? 'https:' : 'http:';
    cachedBaseUrl = `${finalProtocol}//${hostname}:3001`;
  }

  console.log(`🔗 API Base URL: ${cachedBaseUrl}`);
  return cachedBaseUrl;
}

/** Limpa o cache da URL da API (chame após alterar a URL no app). */
export function clearBaseUrlCache(): void {
  cachedBaseUrl = null;
}

/** Retorna a URL do servidor salva no app (só faz sentido no Capacitor). */
export function getStoredApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_API_BASE_URL) || '';
}

/** Salva a URL do servidor no app e limpa o cache. */
export function setStoredApiBaseUrl(url: string): void {
  const trimmed = url.trim().replace(/\/$/, '');
  localStorage.setItem(STORAGE_API_BASE_URL, trimmed);
  clearBaseUrlCache();
}

/** Indica se está rodando no app (Capacitor). */
export function isApp(): boolean {
  return isCapacitorNative();
}

// Função para obter BASE_URL (lazy evaluation)
function getBASE_URL(): string {
  return getBaseUrl();
}

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setApiToken(token: string | null) {
  accessToken = token;
}

export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb;
}

async function refreshToken(): Promise<string | null> {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) return null;
  const res = await fetch(`${getBASE_URL()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
  if (!data?.accessToken) return null;
  accessToken = data.accessToken;
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  return data.accessToken;
}

export type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, skipRefresh, headers = {}, ...init } = options;
  const baseUrl = getBASE_URL();
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const doRequest = async (token: string | null) => {
    const h: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (token && !skipAuth) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    // Timeout maior para app Android (30s) e logs detalhados
    console.log(`🌐 Fazendo requisição: ${init.method || 'GET'} ${url}`);
    console.log(`📋 Headers:`, h);
    
    // Criar AbortController para timeout de 30s (compatível com versões antigas)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log(`⏱️ Timeout após 30s na requisição para ${url}`);
    }, 30000);
    
    try {
      const response = await fetch(url, { 
        ...init, 
        headers: h,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  let res: Response;
  try {
    res = await doRequest(accessToken ?? undefined ?? null);
    console.log(`✅ Resposta recebida: ${res.status} ${res.statusText}`);
  } catch (err) {
    // Captura erros de rede antes mesmo de receber resposta (CORS, timeout, DNS, etc)
    const baseUrl = getBASE_URL();
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Erro na requisição para ${url}:`, errorMsg);
    
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('Network request failed') || errorMsg.includes('aborted')) {
      const isTimeout = errorMsg.includes('timeout') || errorMsg.includes('aborted');
      const timeoutMsg = isTimeout ? ' (timeout após 30s)' : '';
      throw new Error(`Não foi possível conectar ao servidor em ${baseUrl}${timeoutMsg}. Verifique:\n1. Backend está rodando?\n2. URL está correta?\n3. Firewall permite porta 3001?\n4. Celular e PC na mesma rede Wi‑Fi?`);
    }
    throw new Error(`Erro de rede ao acessar ${baseUrl}: ${errorMsg}`);
  }

  if (res.status === 401 && !skipAuth && !skipRefresh) {
    const newToken = await refreshToken();
    if (newToken) {
      res = await doRequest(newToken);
    } else {
      localStorage.removeItem('refreshToken');
      setApiToken(null);
      onUnauthorized?.();
      throw new Error('Sessão expirada');
    }
  }

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j.message) message = j.message;
    } catch {
      // use text
    }
    // Se for erro de rede (status 0 ou fetch failed), adiciona contexto
    if (res.status === 0 || message.includes('Failed to fetch') || message.includes('NetworkError')) {
      const baseUrl = getBASE_URL();
      throw new Error(`Não foi possível conectar ao servidor em ${baseUrl}. Verifique se o backend está rodando e se a URL está correta.`);
    }
    throw new Error(message || `Erro ${res.status}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) return res.json() as Promise<T>;
  const text = await res.text();
  throw new Error(
    text
      ? `Resposta inválida do servidor (não é JSON): ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`
      : 'Resposta inválida do servidor (corpo vazio ou não-JSON). Verifique a URL do servidor.'
  );
}

export const apiGet = <T>(path: string, options?: RequestOptions) =>
  api<T>(path, { ...options, method: 'GET' });
export const apiPost = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  api<T>(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const apiPatch = <T>(path: string, body?: unknown, options?: RequestOptions) =>
  api<T>(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
export const apiDelete = (path: string, options?: RequestOptions) =>
  api<void>(path, { ...options, method: 'DELETE' });
