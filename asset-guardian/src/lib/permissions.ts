/**
 * Utilitário de permissões por papel (RBAC) – frontend.
 *
 * Hierarquia: ADMIN > GESTOR > OPERADOR > CONSULTA
 *
 * Regras de negócio:
 *  - CONSULTA: apenas leitura (visualizar bens, inventários, relatórios, dashboard)
 *  - OPERADOR: leitura + operações de inventário (conferir itens) + manutenção
 *  - GESTOR:   OPERADOR + criar/editar/excluir bens, registrar baixas, fechar inventários
 *  - ADMIN:    acesso total, incluindo gestão de usuários e estrutura organizacional
 */

export type AppRole = 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'CONSULTA';

/** Verifica se o papel possui ao menos uma das permissões requeridas. */
export function can(userRole: string | undefined, ...roles: AppRole[]): boolean {
  if (!userRole) return false;
  return roles.includes(userRole as AppRole);
}

/** Itens do menu com restrição de papel (undefined = todos podem ver). */
export const MENU_ROLES: Record<string, AppRole[] | undefined> = {
  '/':              undefined,
  '/bens':          undefined,
  '/bens/etiquetas': undefined,
  '/movimentacoes': ['ADMIN', 'GESTOR', 'OPERADOR'],
  '/inventario':    undefined,
  '/manutencao':    ['ADMIN', 'GESTOR', 'OPERADOR'],
  '/depreciacao':   ['ADMIN', 'GESTOR'],
  '/baixas':        ['ADMIN', 'GESTOR'],
  '/relatorios':    undefined,
  '/estrutura':     ['ADMIN', 'GESTOR'],
  '/usuarios':      ['ADMIN'],
  '/configuracoes': undefined,
};
