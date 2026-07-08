import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

function ChatbotWidget() {
  const { negocioActivo } = useApp();
  const inicializado = useRef(false);
  const scriptsLoaded = useRef(false);
  const [chatOpen, setChatOpen] = useState(false);

  const rol = localStorage.getItem('rol') || 'EMPLEADO';
  const esAdmin = rol === 'ADMIN';

  // ── EMPLEADO: ocultar todo lo de Botpress ──────────────────────────────────
  useEffect(() => {
    if (esAdmin) return;

    const ocultarTodo = () => {
      if (!document.getElementById('bp-empleado-hide')) {
        const style = document.createElement('style');
        style.id = 'bp-empleado-hide';
        style.textContent = `
          #bp-web-widget,
          #bp-web-widget-container,
          [id^="bp-web"],
          [id*="botpress"],
          [class*="bpFab"],
          [class*="bp-fab"],
          [class*="webchat"],
          iframe[id^="bp-"],
          iframe[src*="botpress"],
          iframe[src*="bpcontent"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(style);
      }
      document
        .querySelectorAll('[id^="bp-"], [id*="botpress"], iframe[src*="botpress"], iframe[src*="bpcontent"]')
        .forEach(el => { el.style.display = 'none'; });
    };

    ocultarTodo();
    const intervalo = setInterval(ocultarTodo, 500);
    const observer = new MutationObserver(ocultarTodo);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(intervalo);
      observer.disconnect();
    };
  }, [esAdmin]);

  // ── ADMIN: cargar scripts de Botpress ─────────────────────────────────────
  useEffect(() => {
    if (!esAdmin || scriptsLoaded.current) return;
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js';
    script1.async = true;
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://files.bpcontent.cloud/2026/06/29/21/20260629215347-AM6D0IHR.js';
      script2.defer = true;
      document.body.appendChild(script2);
    };
    document.body.appendChild(script1);
    scriptsLoaded.current = true;
  }, [esAdmin]);

  // ── ADMIN: ocultar el fab nativo de Botpress (usamos nuestro robot) ────────
  useEffect(() => {
    if (!esAdmin) return;
    const timer = setTimeout(() => {
      if (!document.getElementById('bp-hide-fab')) {
        const style = document.createElement('style');
        style.id = 'bp-hide-fab';
        style.textContent = `
          #bp-web-widget-container > *:first-child,
          [class*="bpFab"],
          [class*="bp-fab"],
          [class*="webchat-fab"],
          [class*="Fab"] {
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [esAdmin]);

  // ── ADMIN: inicializar bot con negocio activo ──────────────────────────────
  useEffect(() => {
    if (!esAdmin || !negocioActivo) return;
    const intentar = setInterval(() => {
      if (!window.botpress?.sendMessage) return;
      if (!inicializado.current) {
        window.botpress.on('ready', () => {
          const nId = localStorage.getItem('negocioId');
          if (nId) window.botpress.sendMessage(`__INIT__:${nId}`);
        });
        inicializado.current = true;
      }
      clearInterval(intentar);
    }, 300);
    return () => clearInterval(intentar);
  }, [esAdmin, negocioActivo]);

  useEffect(() => {
    if (!esAdmin || !negocioActivo || !window.botpress?.sendMessage) return;
    window.botpress.sendMessage(`__INIT__:${negocioActivo}`);
  }, [esAdmin, negocioActivo]);

  // ── Abrir/cerrar el chat de Botpress desde nuestro botón ──────────────────
  const toggleChat = () => {
    if (window.botpress?.open && window.botpress?.close) {
      chatOpen ? window.botpress.close() : window.botpress.open();
    } else if (window.botpress?.toggle) {
      window.botpress.toggle();
    }
    setChatOpen(prev => !prev);
  };

  // No renderizar nada para EMPLEADO
  if (!esAdmin) return null;

  return (
    <>
      <style>{`
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25%       { transform: translateY(-5px) rotate(-1.5deg); }
          75%       { transform: translateY(-3px) rotate(1.5deg); }
        }
        @keyframes headLook {
          0%, 5%   { transform: rotate(0deg) translateX(0); }
          10%, 20% { transform: rotate(-8deg) translateX(-2px); }
          25%, 35% { transform: rotate(8deg) translateX(2px); }
          40%      { transform: rotate(-4deg) translateX(-1px); }
          50%,100% { transform: rotate(0deg) translateX(0); }
        }
        @keyframes blinkEye {
          0%, 90%, 100% { transform: scaleY(1); }
          95%            { transform: scaleY(0.06); }
        }
        @keyframes pupilTrack {
          0%, 10%  { transform: translate(0, 0); }
          15%, 25% { transform: translate(-1.5px, 0.5px); }
          30%, 40% { transform: translate(1.5px, -0.5px); }
          45%, 50% { transform: translate(0, 1px); }
          55%,100% { transform: translate(0, 0); }
        }
        @keyframes waveArmLeft {
          0%, 60%, 100%  { transform: rotate(0deg); }
          65%, 75%  { transform: rotate(-20deg) translateY(-3px); }
          70%       { transform: rotate(-28deg) translateY(-5px); }
        }
        @keyframes waveArmRight {
          0%, 60%, 100%  { transform: rotate(0deg); }
          65%, 75%  { transform: rotate(20deg) translateY(-3px); }
          70%       { transform: rotate(28deg) translateY(-5px); }
        }
        @keyframes antennaPulse {
          0%, 100% { r: 2.2; opacity: 1; fill: #0a84ff; }
          30%, 70% { r: 3.2; opacity: 0.6; fill: #22d3ee; }
          50%      { r: 4;   opacity: 1; fill: #ffffff; }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: scaleX(1); opacity: 0.25; }
          50%      { transform: scaleX(0.75); opacity: 0.12; }
        }
        @keyframes chestPulse {
          0%, 100% { r: 4; fill: #0a84ff; }
          50%      { r: 4.8; fill: #22d3ee; }
        }
        .robot-root  { animation: robotFloat 2.8s ease-in-out infinite; }
        .robot-head  { animation: headLook 7s ease-in-out infinite; transform-origin: 21px 17.5px; }
        .robot-eye   { animation: blinkEye 4.5s infinite; transform-origin: center; }
        .robot-pupil { animation: pupilTrack 7s ease-in-out infinite; }
        .robot-arm-l { animation: waveArmLeft 7s ease-in-out infinite; transform-origin: 8px 32px; }
        .robot-arm-r { animation: waveArmRight 7s ease-in-out infinite; transform-origin: 34px 32px; }
        .robot-antenna-dot { animation: antennaPulse 2s ease-in-out infinite; }
        .robot-chest { animation: chestPulse 1.8s ease-in-out infinite; }
        .robot-shadow { animation: shadowPulse 2.8s ease-in-out infinite; }
      `}</style>

      {/* Sombra en el suelo */}
      <div
        className="robot-shadow"
        style={{
          position: 'fixed', bottom: '8px', right: '26px',
          width: '60px', height: '10px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.3)', filter: 'blur(6px)',
          zIndex: 999998, pointerEvents: 'none',
        }}
      />

      {/* Botón robot — abre/cierra el chat de Botpress */}
      <div
        className="robot-root"
        onClick={toggleChat}
        title="Abrir asistente"
        style={{
          position: 'fixed', bottom: '16px', right: '16px',
          width: '76px', height: '76px', borderRadius: '50%',
          zIndex: 999999, cursor: 'pointer',
          background: 'linear-gradient(160deg, #1c1c1e 0%, #2c2c2e 100%)',
          outline: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {/* Reflejo de vidrio */}
        <div style={{
          position: 'absolute', top: '6px', left: '12px', right: '12px',
          height: '28px', borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="44" height="46" viewBox="0 0 42 46" fill="none">
            <rect className="robot-arm-l" x="1" y="28" width="8" height="6" rx="3" fill="#d1d1d6"/>
            <rect className="robot-arm-r" x="33" y="28" width="8" height="6" rx="3" fill="#d1d1d6"/>
            <rect x="9" y="27" width="24" height="15" rx="5" fill="#d1d1d6"/>
            <circle className="robot-chest" cx="21" cy="34" r="4" fill="#0a84ff"/>
            <circle cx="21" cy="34" r="1.8" fill="white"/>
            <line x1="11" y1="31" x2="15" y2="31" stroke="#aeaeb2" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="27" y1="31" x2="31" y2="31" stroke="#aeaeb2" strokeWidth="1.2" strokeLinecap="round"/>
            <rect x="18" y="24" width="6" height="4" rx="2" fill="#c7c7cc"/>
            <g className="robot-head">
              <line x1="21" y1="1" x2="21" y2="7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
              <circle className="robot-antenna-dot" cx="21" cy="1" r="2.2" fill="#0a84ff"/>
              <rect x="7" y="7" width="28" height="19" rx="6" fill="#e5e5ea"/>
              <g className="robot-eye">
                <rect x="10.5" y="11.5" width="9" height="9" rx="3" fill="#1c1c1e"/>
                <circle cx="12.5" cy="13.5" r="2.2" fill="white" fillOpacity="0.95"/>
                <circle className="robot-pupil" cx="12.5" cy="13.5" r="1.1" fill="#0a84ff"/>
              </g>
              <g className="robot-eye">
                <rect x="22.5" y="11.5" width="9" height="9" rx="3" fill="#1c1c1e"/>
                <circle cx="24.5" cy="13.5" r="2.2" fill="white" fillOpacity="0.95"/>
                <circle className="robot-pupil" cx="24.5" cy="13.5" r="1.1" fill="#0a84ff"/>
              </g>
              <rect className="robot-mouth" x="14" y="23" width="14" height="2.5" rx="1.2" fill="#aeaeb2"/>
            </g>
          </svg>
        </div>
      </div>
    </>
  );
}

export default ChatbotWidget;
