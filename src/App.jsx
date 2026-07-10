import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductosPage from './pages/ProductosPage';
import StockDashboard from './pages/StockDashboard';
import ProveedoresDashboard from './pages/ProveedoresDashboard';
import ReportesDashboard from './pages/ReportesDashboard';
import ConfiguracionDashboard from './pages/ConfiguracionDashboard';
import ChatbotWidget from './components/ChatbotWidget';
import { Toaster } from './components/ui/sonner';
import { clearAuthData } from './services/authService';
import { getRol } from './services/config';
import { cn } from './lib/utils';

// Bloquea rutas exclusivas de ADMIN — redirige al dashboard si es EMPLEADO
function RequireAdmin({ children }) {
  const rol = getRol() || 'EMPLEADO';
  // Permitir acceso tanto a ADMIN como a SUPER_ADMIN
  return (rol === 'ADMIN' || rol === 'SUPER_ADMIN') ? children : <Navigate to="/dashboard" replace />;
}

// Detecta cuando el teclado virtual está abierto en mobile (input/textarea enfocado)
// y añade la clase 'keyboard-open' al body para ocultar elementos flotantes via CSS
function useHideOnKeyboard() {
  useEffect(() => {
    if (window.innerWidth >= 768) return; // solo mobile

    const INPUTS = 'input, textarea, select, [contenteditable]';
    let hideTimer = null;
    let showTimer = null;

    const hide = () => {
      clearTimeout(showTimer);
      document.body.classList.add('keyboard-open');
    };

    const show = () => {
      clearTimeout(hideTimer);
      // Espera para ver si el foco se fue a otro input o si el modal se cerró
      showTimer = setTimeout(() => {
        if (!document.querySelector(`${INPUTS}:focus`)) {
          document.body.classList.remove('keyboard-open');
        }
      }, 300);
    };

    const onFocusIn  = (e) => { if (e.target.matches(INPUTS)) hide(); };
    const onFocusOut = (e) => { if (e.target.matches(INPUTS)) show(); };

    // Fallback: si el usuario toca fuera del modal/dialog el foco puede ir a body/document
    const onPointerDown = (e) => {
      if (!e.target.matches(INPUTS)) {
        showTimer = setTimeout(() => {
          if (!document.querySelector(`${INPUTS}:focus`)) {
            document.body.classList.remove('keyboard-open');
          }
        }, 400);
      }
    };

    // Fallback adicional: cuando se pulsa Escape o se cierra un dialog
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setTimeout(() => document.body.classList.remove('keyboard-open'), 200);
      }
    };

    // Observer para detectar cuando desaparece el dialog/modal del DOM
    const observer = new MutationObserver(() => {
      if (!document.querySelector(`${INPUTS}:focus`)) {
        setTimeout(() => {
          if (!document.querySelector(`${INPUTS}:focus`)) {
            document.body.classList.remove('keyboard-open');
          }
        }, 200);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('focusin',    onFocusIn);
    document.addEventListener('focusout',   onFocusOut);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown',    onKeyDown);

    return () => {
      document.removeEventListener('focusin',    onFocusIn);
      document.removeEventListener('focusout',   onFocusOut);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown',    onKeyDown);
      observer.disconnect();
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
      document.body.classList.remove('keyboard-open');
    };
  }, []);
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useHideOnKeyboard();

  const handleLogout = () => {
    clearAuthData();
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onLogout={handleLogout} onHoverChange={setSidebarOpen} />
      <main
        className={cn(
          "flex-1 transition-[margin] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] pb-32 md:pb-0 md:rounded-l-[2.5rem] md:overflow-hidden md:shadow-[inset_25px_0_50px_-12px_rgba(0,0,0,0.25)] md:border-l border-white/20 dark:border-white/5",
          sidebarOpen ? "md:ml-[224px]" : "md:ml-[80px]"
        )}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/stock" element={<StockDashboard />} />
          <Route path="/proveedores" element={<RequireAdmin><ProveedoresDashboard /></RequireAdmin>} />
          <Route path="/reportes" element={<RequireAdmin><ReportesDashboard /></RequireAdmin>} />
          <Route path="/configuracion" element={<RequireAdmin><ConfiguracionDashboard /></RequireAdmin>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
