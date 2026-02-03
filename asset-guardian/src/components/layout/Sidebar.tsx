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
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Building className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">Ventrys</span>
              <span className="text-xs text-sidebar-foreground/60">Gestão de Patrimônio</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Building className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'nav-item',
                    isActive ? 'nav-item-active' : 'nav-item-inactive',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted"
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
