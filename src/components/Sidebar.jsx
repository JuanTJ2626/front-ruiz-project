import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import './Sidebar.css';

/* ── Burbuja Esférica ── */
const LoginStyleBubble = ({ isHovered }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Escala general para que la esfera entera crezca
    const targetScale = isHovered ? 2.5 : 0.8;
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.08)
    );

    // Animaciones exactas del Login
    meshRef.current.rotation.y = Math.sin(t / 4) / 2;
    meshRef.current.rotation.z = t / 5;
    meshRef.current.position.y = Math.sin(t / 2) * 0.5;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ¡ESFERA PURA! */}
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#1E3A8A" // Azul oscuro del login
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
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    if (isHovered) {
      // Ocultar icono de menú
      gsap.to(iconRef.current, { opacity: 0, scale: 0.5, duration: 0.3 });
      // Mostrar todo el contenido (links)
      gsap.to(contentRef.current, {
        opacity: 1,
        scale: 1,
        pointerEvents: 'auto',
        duration: 0.5,
        delay: 0.1,
        ease: "back.out(1.2)"
      });
    } else {
      // Ocultar contenido
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.8,
        pointerEvents: 'none',
        duration: 0.3
      });
      // Mostrar icono de menú
      gsap.to(iconRef.current, { opacity: 1, scale: 1, duration: 0.4, delay: 0.2 });
    }
  }, [isHovered]);

  const navItems = [
    { label: 'Dashboard', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg> },
    { label: 'Productos', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>, active: true },
    { label: 'Clientes', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { label: 'Reportes', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
    { label: 'Configuración', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
  ];

  return (
    <aside
      className={`sidebar-wrapper ${isHovered ? 'is-expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
    >
      <div className="sidebar-container">

        {/* Fondo 3D: La burbuja ESFÉRICA pura */}
        <div className="sidebar-3d-bg">
          <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[-10, -10, -5]} intensity={2} color="#1E3A8A" />
            <LoginStyleBubble isHovered={isHovered} />
          </Canvas>
        </div>

        {/* Icono de menú visible cuando está CERRADA */}
        <div className="menu-icon-closed" ref={iconRef}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>

        {/* Contenido HTML (Oculto cuando está cerrada, visible cuando se expande) */}
        <div className="sidebar-content" ref={contentRef} style={{ opacity: 0, pointerEvents: 'none', position: 'absolute' }}>
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <span className="logo-text">Ruiz Pro</span>
          </div>

          <nav className="nav-links">
            {navItems.map((item, index) => (
              <div key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
                <div className="nav-icon">{item.icon}</div>
                <span className="nav-label">{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={onLogout}>
              <div className="nav-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <span className="logout-text">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
