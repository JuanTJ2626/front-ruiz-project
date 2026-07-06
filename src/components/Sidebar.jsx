import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { useRol } from '../hooks/useRol';

const LoginStyleBubble = ({ isHovered }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const targetScale = isHovered ? 2.5 : 0.8;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.08));
    meshRef.current.rotation.y = Math.sin(t / 4) / 2;
    meshRef.current.rotation.z = t / 5;
    meshRef.current.position.y = Math.sin(t / 2) * 0.5;
  });

  return (
    <group position={[0, 0, 0]}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#06b6d4"
          attach="material"
          distort={isHovered ? 0.6 : 0.4}
          speed={isHovered ? 2.0 : 1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </group>
  );
};

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePage = location.pathname.replace('/', '') || 'dashboard';
  const [isHovered, setIsHovered] = useState(false);

  const { negocios = [], negocioActivo, cambiarNegocio } = useApp();
  const { rol } = useRol();

  // Persiste el tema en localStorage — arranca en claro si no hay preferencia guardada
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return false; // siempre claro por defecto
  });

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    gsap.killTweensOf([iconRef.current, contentRef.current]);

    if (isHovered) {
      gsap.to(iconRef.current, { opacity: 0, scale: 0.5, duration: 0.3 });
      gsap.to(contentRef.current, {
        opacity: 1,
        scale: 1,
        pointerEvents: 'auto',
        duration: 0.5,
        delay: 0.1,
        ease: "back.out(1.2)"
      });
    } else {
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.8,
        pointerEvents: 'none',
        duration: 0.3
      });
      gsap.to(iconRef.current, { opacity: 1, scale: 1, duration: 0.4, delay: 0.2 });
    }
  }, [isHovered]);

  const allNavItems = [
    { id: 'dashboard',     label: 'Dashboard',     roles: ['ADMIN', 'EMPLEADO'], icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg> },
    { id: 'productos',     label: 'Productos',     roles: ['ADMIN', 'EMPLEADO'], icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg> },
    { id: 'stock',         label: 'Stock',         roles: ['ADMIN', 'EMPLEADO'], icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg> },
    { id: 'proveedores',   label: 'Proveedores',   roles: ['ADMIN'],             icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg> },
    { id: 'clientes',      label: 'Clientes',      roles: ['ADMIN'],             icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { id: 'reportes',      label: 'Reportes',      roles: ['ADMIN'],             icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
    { id: 'configuracion', label: 'Configuración', roles: ['ADMIN'],             icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(rol));

  return (
    <aside
      ref={containerRef}
      className={cn(
        'fixed top-0 left-[30px] z-[1000] flex h-screen flex-col items-center py-[30px] transition-[left] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        isHovered && 'left-0'
      )}
    >
      <div
        className="sidebar-bubble relative flex h-[65px] w-[65px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-[16px] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:border-cyan-500/50 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(6,182,212,0.3)] [&_svg]:h-[22px] [&_svg]:w-[22px] [&_svg]:transition-all [&_svg]:duration-300 hover:[&_svg]:text-teal-300"
        onClick={() => setIsDarkMode(!isDarkMode)}
        title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
      >
        {isDarkMode ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </div>

      <div
        className={cn(
          'sidebar-container relative my-auto flex flex-col items-center justify-center',
          isHovered
            ? 'sidebar-container-expanded h-[560px] w-[260px] cursor-default rounded-[40px] border border-cyan-500/25 bg-[rgba(15,15,20,0.4)] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_60px_rgba(6,182,212,0.08),inset_0_0_60px_rgba(16,185,129,0.05)] backdrop-blur-[20px]'
            : 'h-[100px] w-[100px] cursor-pointer rounded-full'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[200%] w-[130%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_15px_45px_rgba(6,182,212,0.4)] [&_canvas]:!h-full [&_canvas]:!w-full">
          <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[-10, -10, -5]} intensity={2} color="#06b6d4" />
            <LoginStyleBubble isHovered={isHovered} />
          </Canvas>
        </div>

        <div
          ref={iconRef}
          className="pointer-events-none absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>

        <div
          ref={contentRef}
          className="absolute top-0 left-0 z-10 flex h-full w-full flex-col items-center justify-center bg-transparent py-10"
          style={{ opacity: 0, pointerEvents: 'none', position: 'absolute' }}
        >
          <div className="mb-8 flex items-center justify-center gap-3 text-white">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/40 to-emerald-500/40 text-white shadow-[0_4px_15px_rgba(6,182,212,0.4)] backdrop-blur-[10px]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <span className="whitespace-nowrap font-heading text-2xl font-extrabold tracking-tight bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              INVENT-PRO
            </span>
          </div>

          {/* Selector de negocio activo */}
          {negocios.length > 1 && (
            <div className="mb-5 w-[86%]">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">Negocio activo</p>
              <select
                value={negocioActivo || ''}
                onChange={e => cambiarNegocio(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                {negocios.map(n => (
                  <option key={n.id} value={n.id} className="bg-slate-900 text-white">{n.nombre}</option>
                ))}
              </select>
            </div>
          )}
          {negocios.length === 1 && (
            <div className="mb-5 w-[86%]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">Negocio</p>
              <p className="text-xs font-bold text-cyan-300 truncate">{negocios[0].nombre}</p>
            </div>
          )}

          <nav className="flex w-full flex-col items-center gap-2">
            {navItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex w-[86%] cursor-pointer items-center justify-start gap-4 rounded-2xl px-[1.2rem] py-[0.8rem] transition-all duration-300',
                  activePage === item.id
                    ? 'border border-cyan-500/25 bg-cyan-500/12 text-teal-300 shadow-[0_4px_15px_rgba(0,0,0,0.2)] [&_.nav-icon]:text-teal-400'
                    : 'text-zinc-400 hover:bg-white/8 hover:text-white'
                )}
                onClick={() => navigate(`/${item.id}`)}
              >
                <div className="nav-icon flex w-6 shrink-0 items-center justify-center">{item.icon}</div>
                <span className="whitespace-nowrap font-sans text-[0.95rem] font-semibold">{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="mt-auto flex w-full justify-center">
            <button
              className="flex w-[86%] cursor-pointer items-center justify-start gap-4 rounded-2xl border border-transparent bg-red-500/10 px-[1.2rem] py-[0.8rem] font-sans text-[0.95rem] font-semibold text-red-300 transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-200"
              onClick={onLogout}
            >
              <div className="nav-icon flex w-6 shrink-0 items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <span className="whitespace-nowrap">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className="sidebar-bubble relative flex h-[65px] w-[65px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-[16px] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 hover:border-cyan-500/50 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(6,182,212,0.3)] [&_svg]:h-[22px] [&_svg]:w-[22px] [&_svg]:transition-all [&_svg]:duration-300 hover:[&_svg]:text-teal-300"
        onClick={onLogout}
        title="Cerrar sesión"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </div>
    </aside>
  );
};

export default Sidebar;
