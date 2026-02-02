/**
 * Configurações do sistema persistidas em localStorage (apenas frontend).
 * Não substitui parâmetros do backend quando existirem.
 */

const STORAGE_KEY = 'patrimonio_config';

export interface InstituicaoConfig {
  nome: string;
  cnpj: string;
  endereco: string;
}

export interface SettingsConfig {
  instituicao: InstituicaoConfig;
  itensPorPagina: number;
}

const defaults: SettingsConfig = {
  instituicao: {
    nome: '',
    cnpj: '',
    endereco: '',
  },
  itensPorPagina: 20,
};

function load(): SettingsConfig {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s) as Partial<SettingsConfig>;
      return {
        instituicao: { ...defaults.instituicao, ...parsed.instituicao },
        itensPorPagina: parsed.itensPorPagina ?? defaults.itensPorPagina,
      };
    }
  } catch {
    // ignore
  }
  return { ...defaults };
}

let cached: SettingsConfig | null = null;

export function getSettings(): SettingsConfig {
  if (!cached) cached = load();
  return cached;
}

export function saveSettings(partial: Partial<SettingsConfig>): void {
  const current = getSettings();
  const next: SettingsConfig = {
    instituicao: { ...current.instituicao, ...partial.instituicao },
    itensPorPagina: partial.itensPorPagina ?? current.itensPorPagina,
  };
  cached = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export const ITENS_POR_PAGINA_OPTIONS = [10, 20, 50, 100] as const;
