import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { useRol } from '../hooks/useRol';
import { APP_NAME, APP_LOGO, APP_LOGO_WHITE, APP_ICON } from '../assets/brand';

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
          color="#1E3A8A"
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
    { id: 'dashboard', label: 'Dashboard', roles: ['ADMIN', 'EMPLEADO'], icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg> },
    { id: 'productos', label: 'Productos', roles: ['ADMIN', 'EMPLEADO'], icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg> },
    { id: 'stock', label: 'Stock', roles: ['ADMIN', 'EMPLEADO'], icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg> },
    { id: 'proveedores', label: 'Proveedores', roles: ['ADMIN'], icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg> },
    { id: 'reportes', label: 'Reportes', roles: ['ADMIN'], icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
    { id: 'configuracion', label: 'Configuración', roles: ['ADMIN'], icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(rol));

  return (
    <aside
      ref={containerRef}
      className={cn(
        'fixed z-[1000000] flex transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        // Desktop
        'md:top-0 md:bottom-auto md:h-screen md:flex-col md:items-center md:py-[30px] md:translate-x-0',
        isHovered ? 'md:left-0' : 'md:left-[30px]',
        // Mobile
        'bottom-4 left-1/2 -translate-x-1/2 flex-row items-end gap-4 md:gap-0'
      )}
    >
      <div
        className={cn(
          "sidebar-bubble relative flex h-[65px] w-[65px] shrink-0 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105",
          isDarkMode
            ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            : "border-slate-200/50 bg-white/80 hover:border-slate-300 hover:bg-white"
        )}
        onClick={() => setIsDarkMode(!isDarkMode)}
        title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
      >
        {isDarkMode ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 drop-shadow-[0_2px_4px_rgba(15,23,42,0.3)]">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </div>

      <div
        className={cn(
          'sidebar-container relative md:my-auto flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          isHovered
            ? 'sidebar-container-expanded cursor-default border border-cyan-500/20 bg-[rgba(10,12,18,0.85)] shadow-[0_24px_60px_rgba(0,0,0,0.6),inset_0_0_50px_rgba(6,182,212,0.07)] backdrop-blur-[24px] md:h-[560px] md:w-[240px] md:rounded-[32px] h-[75px] w-[95vw] rounded-[24px]'
            : 'cursor-pointer rounded-full h-[80px] w-[80px] md:h-[100px] md:w-[100px]'
        )}
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        onClick={() => window.innerWidth < 768 && setIsHovered(!isHovered)}
      >
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[200%] w-[130%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_15px_45px_rgba(30,58,138,0.4)] [&_canvas]:!h-full [&_canvas]:!w-full">
          <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[-10, -10, -5]} intensity={2} color="#1E3A8A" />
            <LoginStyleBubble isHovered={isHovered} />
          </Canvas>
        </div>

        <div
          ref={iconRef}
          className="pointer-events-none absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <span className="text-[11px] font-bold tracking-wide text-white/80">MENÚ</span>
        </div>

        <div
          ref={contentRef}
          className="absolute inset-0 z-10 flex md:flex-col flex-row bg-transparent"
          style={{ opacity: 0, pointerEvents: 'none' }}
        >
          {/* ── Header: logo ── */}
          <div className="hidden md:flex shrink-0 items-center justify-center px-5 pt-6 pb-4">
            {APP_LOGO_WHITE ? (
              <img
                src={APP_LOGO_WHITE}
                alt={APP_NAME}
                className="h-14 w-auto max-w-[180px] object-contain"
                draggable={false}
              />
            ) : APP_LOGO ? (
              <img
                src={APP_LOGO}
                alt={APP_NAME}
                className="h-14 w-auto max-w-[180px] object-contain"
                draggable={false}
              />
            ) : (
              <span className="whitespace-nowrap font-heading text-[1.15rem] font-extrabold tracking-tight bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            )}
          </div>

          {/* ── Negocio ── */}
          <div className="hidden md:block shrink-0 px-4 pb-3">
            {negocios.length > 1 ? (
              <>
                <p className="mb-1 px-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/25">Negocio activo</p>
                <select
                  value={negocioActivo || ''}
                  onChange={e => cambiarNegocio(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-[7px] text-[11px] font-semibold text-white backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                  {negocios.map(n => (
                    <option key={n.id} value={n.id} className="bg-slate-900 text-white">{n.nombre}</option>
                  ))}
                </select>
              </>
            ) : negocios.length === 1 ? (
              <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/25">Negocio</p>
                <p className="mt-0.5 truncate text-[11px] font-bold text-cyan-300">{negocios[0].nombre}</p>
              </div>
            ) : null}
          </div>

          {/* ── Nav ── */}
          <nav className="flex flex-1 md:flex-col flex-row items-center md:items-stretch justify-evenly md:justify-start gap-[4px] md:gap-[3px] px-2 py-2 md:overflow-y-auto md:px-3 md:py-1 w-full">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <div
                  key={item.id}
                  onClick={(e) => { e.stopPropagation(); navigate(`/${item.id}`); window.innerWidth < 768 && setIsHovered(false); }}
                  className={cn(
                    'group relative flex cursor-pointer md:items-center flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 rounded-[18px] md:rounded-2xl px-2 py-2 md:px-3 md:py-[10px] text-[10px] md:text-[0.88rem] font-semibold transition-all duration-200 select-none flex-1 md:flex-none',
                    isActive
                      ? 'bg-gradient-to-r md:from-cyan-500/18 md:to-emerald-500/10 from-cyan-500/25 to-emerald-500/25 text-teal-300 md:shadow-[inset_0_0_0_1px_rgba(6,182,212,0.22)]'
                      : 'text-white/50 hover:bg-white/[0.06] hover:text-white/90'
                  )}
                >
                  <span className={cn(
                    'nav-icon flex w-[18px] md:w-[18px] shrink-0 items-center justify-center transition-colors duration-200',
                    isActive ? 'text-teal-400' : 'text-white/40 group-hover:text-white/70'
                  )}>
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap leading-none mt-1 md:mt-0">{item.label}</span>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <div
        className={cn(
          "sidebar-bubble relative flex h-[55px] w-[55px] md:h-[65px] md:w-[65px] shrink-0 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105",
          isDarkMode
            ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            : "border-slate-200/50 bg-white/80 hover:border-slate-300 hover:bg-white",
          isHovered && "md:pointer-events-none md:scale-0 md:opacity-0"
        )}
        onClick={onLogout}
        title="Cerrar sesión"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(
          "transition-colors duration-300",
          isDarkMode ? "text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" : "text-slate-700 drop-shadow-[0_2px_4px_rgba(15,23,42,0.3)]"
        )}>
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </div>
    </aside>
  );
};

export default Sidebar;
