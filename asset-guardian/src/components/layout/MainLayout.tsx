import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="transition-all duration-300 pl-14 md:pl-64">
        <Header />
        <main className="p-3 md:p-6">{children}</main>
      </div>
    </div>
  );
}
