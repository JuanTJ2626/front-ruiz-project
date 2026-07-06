import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductosPage from './pages/ProductosPage';
import StockDashboard from './pages/StockDashboard';
import ProveedoresDashboard from './pages/ProveedoresDashboard';
import ClientesDashboard from './pages/ClientesDashboard';
import ReportesDashboard from './pages/ReportesDashboard';
import ConfiguracionDashboard from './pages/ConfiguracionDashboard';
import ChatbotWidget from './components/ChatbotWidget';
import { Toaster } from './components/ui/sonner';
import { clearAuthData } from './services/authService';
import { getRol } from './services/config';

// Bloquea rutas exclusivas de ADMIN — redirige al dashboard si es EMPLEADO
function RequireAdmin({ children }) {
  const rol = getRol() || 'EMPLEADO';
  return rol === 'ADMIN' ? children : <Navigate to="/dashboard" replace />;
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAuthData();
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onLogout={handleLogout} onHoverChange={setSidebarOpen} />
      <main
        className="flex-1"
        style={{
          marginLeft: sidebarOpen ? '224px' : '56px',
          transition: 'margin-left 220ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Routes>
          <Route path="/"              element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/productos"     element={<ProductosPage />} />
          <Route path="/stock"         element={<StockDashboard />} />
          <Route path="/proveedores"   element={<RequireAdmin><ProveedoresDashboard /></RequireAdmin>} />
          <Route path="/clientes"      element={<RequireAdmin><ClientesDashboard /></RequireAdmin>} />
          <Route path="/reportes"      element={<RequireAdmin><ReportesDashboard /></RequireAdmin>} />
          <Route path="/configuracion" element={<RequireAdmin><ConfiguracionDashboard /></RequireAdmin>} />
          <Route path="*"              element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <ChatbotWidget />
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
