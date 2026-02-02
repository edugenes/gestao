import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiPost, setApiToken, setOnUnauthorized } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'patrimonio_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) return JSON.parse(s) as User;
    } catch {
      // ignore
    }
    return null;
  });
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t: string | null) => {
    setApiToken(t);
    setTokenState(t);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(STORAGE_KEY);
  }, [setToken]);

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  useEffect(() => {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) {
      setLoading(false);
      setTokenState(null);
      return;
    }
    apiPost<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken: refresh }, { skipAuth: true })
      .then((data) => {
        setToken(data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        const payload = decodeJwtPayload(data.accessToken);
        const u: User = {
          id: payload.sub ?? '',
          email: payload.email ?? '',
          role: payload.role ?? 'CONSULTA',
        };
        setUser(u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem('refreshToken');
        localStorage.removeItem(STORAGE_KEY);
        setTokenState(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiPost<{ accessToken: string; refreshToken: string; expiresIn: string }>(
        '/auth/login',
        { email, password },
        { skipAuth: true }
      );
      setToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      const payload = decodeJwtPayload(data.accessToken);
      const u: User = {
        id: payload.sub ?? '',
        email: payload.email ?? '',
        role: payload.role ?? 'CONSULTA',
      };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    },
    [setToken]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, token, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function decodeJwtPayload(token: string): { sub?: string; email?: string; role?: string } {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return {};
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as { sub?: string; email?: string; role?: string };
  } catch {
    return {};
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
