import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Assets from "./pages/Assets";
import AssetDetail from "./pages/AssetDetail";
import EtiquetaBem from "./pages/EtiquetaBem";
import EtiquetasLote from "./pages/EtiquetasLote";
import NovoBem from "./pages/NovoBem";
import EditarBem from "./pages/EditarBem";
import Movements from "./pages/Movements";
import Inventory from "./pages/Inventory";
import Estrutura from "./pages/Estrutura";
import Manutencao from "./pages/Manutencao";
import Depreciacao from "./pages/Depreciacao";
import Usuarios from "./pages/Usuarios";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Baixas from "./pages/Baixas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" storageKey="patrimonio-theme" enableSystem>
      <AuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bens"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Assets />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bens/novo"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <NovoBem />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bens/etiquetas"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EtiquetasLote />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bens/:id/editar"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EditarBem />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bens/:id/etiqueta"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EtiquetaBem />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bens/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AssetDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/movimentacoes"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Movements />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventario"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Inventory />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/estrutura"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Estrutura />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manutencao"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Manutencao />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/depreciacao"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Depreciacao />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Relatorios />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Usuarios />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Configuracoes />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/baixas"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Baixas />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
