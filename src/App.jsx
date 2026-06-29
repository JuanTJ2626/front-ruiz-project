import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductosPage from './components/ProductosPage';
import StockDashboard from './components/StockDashboard';
import ProveedoresDashboard from './components/ProveedoresDashboard';
import ClientesDashboard from './components/ClientesDashboard';
import ReportesDashboard from './components/ReportesDashboard';
import ConfiguracionDashboard from './components/ConfiguracionDashboard';
import { Toaster } from './components/ui/sonner';
import { clearAuthData } from './services/authService';

function AppShell() {
  const handleLogout = () => {
    clearAuthData();
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 ml-0 md:ml-40 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
        <Routes>
          <Route path="/"             element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/productos"    element={<ProductosPage />} />
          <Route path="/stock"        element={<StockDashboard />} />
          <Route path="/proveedores"  element={<ProveedoresDashboard />} />
          <Route path="/clientes"     element={<ClientesDashboard />} />
          <Route path="/reportes"     element={<ReportesDashboard />} />
          <Route path="/configuracion" element={<ConfiguracionDashboard />} />
          <Route path="*"             element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('token')
  );

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login onLogin={() => setIsAuthenticated(true)} />
      </>
    );
  }

  return (
    <AppProvider isAuthenticated={isAuthenticated}>
      <Toaster position="top-right" richColors />
      <AppShell />
    </AppProvider>
  );
}
