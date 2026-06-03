import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  ArrowLeftRight,
  ClipboardCheck,
  Wrench,
  TrendingDown,
  Archive,
  FileText,
  Building2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { can, MENU_ROLES } from '@/lib/permissions';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/bens', icon: Package, label: 'Bens Patrimoniais' },
  { path: '/bens/etiquetas', icon: Tag, label: 'Etiquetas em lote' },
  { path: '/movimentacoes', icon: ArrowLeftRight, label: 'Movimentações' },
  { path: '/inventario', icon: ClipboardCheck, label: 'Inventário' },
  { path: '/manutencao', icon: Wrench, label: 'Manutenção' },
  { path: '/depreciacao', icon: TrendingDown, label: 'Depreciação' },
  { path: '/baixas', icon: Archive, label: 'Baixa Patrimonial' },
  { path: '/relatorios', icon: FileText, label: 'Relatórios' },
  { path: '/estrutura', icon: Building2, label: 'Estrutura Organizacional' },
  { path: '/usuarios', icon: Users, label: 'Usuários e Permissões' },
  { path: '/configuracoes', icon: Settings, label: 'Configurações' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role ?? 'CONSULTA';

  const visibleItems = menuItems.filter((item) => {
    const required = MENU_ROLES[item.path];
    if (!required) return true;
    return can(role, ...required);
  });

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300',
        // No mobile: sempre colapsada (apenas ícones, 14 = 3.5rem)
        // Em telas médias+: pode expandir/colapsar
        collapsed ? 'w-14' : 'w-14 md:w-64'
      )}
    >
      {/* Header com logo institucional */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-2 md:px-4">
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center">
            <img
              src="/logo-fpf.png"
              alt="Logomarca"
              className="h-9 w-9 object-contain"
            />
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <img
                src="/logo-fpf.png"
                alt="Logomarca"
                className="h-9 w-9 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Patrimônio
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Controle de ativos
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 py-4 md:px-3">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'nav-item',
                    isActive ? 'nav-item-active' : 'nav-item-inactive',
                    'justify-center md:justify-start',
                    collapsed ? 'px-2' : 'px-2 md:px-3'
                  )}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="hidden md:inline">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle - apenas em telas médias+ */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
