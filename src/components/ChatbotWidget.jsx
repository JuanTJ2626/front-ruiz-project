import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

function ChatbotWidget() {
  const { negocioActivo } = useApp();
  const inicializado = useRef(false);
  const scriptsLoaded = useRef(false);

  useEffect(() => {
    if (scriptsLoaded.current) return;
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const style = document.createElement('style');
      style.id = 'bp-hide-fab';
      style.textContent = `
        #bp-web-widget,
        #bp-web-widget-container,
        [id^="bp-web-widget"],
        [class*="bpFab"],
        [class*="bp-fab"],
        [class*="webchat-fab"],
        [class*="Fab"],
        iframe[id^="bp-"] {
          opacity: 0 !important;
          pointer-events: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    }, 1500);
    return () => { clearTimeout(timer); document.getElementById('bp-hide-fab')?.remove(); };
  }, []);

  useEffect(() => {
    if (!negocioActivo) return;
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
  }, []);

  useEffect(() => {
    if (!negocioActivo || !window.botpress?.sendMessage) return;
    window.botpress.sendMessage(`__INIT__:${negocioActivo}`);
  }, [negocioActivo]);

  return (
    <>
      <style>{`
        /* ── Bounce del cuerpo completo ── */
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25%       { transform: translateY(-5px) rotate(-1.5deg); }
          75%       { transform: translateY(-3px) rotate(1.5deg); }
        }

        /* ── Giro completo de lado a lado (cabeza) ── */
        @keyframes headLook {
          0%, 5%   { transform: rotate(0deg) translateX(0); }
          10%, 20% { transform: rotate(-8deg) translateX(-2px); }
          25%, 35% { transform: rotate(8deg) translateX(2px); }
          40%      { transform: rotate(-4deg) translateX(-1px); }
          50%,100% { transform: rotate(0deg) translateX(0); }
        }

        /* ── Parpadeo de ojos ── */
        @keyframes blinkEye {
          0%, 90%, 100% { transform: scaleY(1); }
          95%            { transform: scaleY(0.06); }
        }

        /* ── Pupila que "mira" ── */
        @keyframes pupilTrack {
          0%, 10%  { transform: translate(0, 0); }
          15%, 25% { transform: translate(-1.5px, 0.5px); }
          30%, 40% { transform: translate(1.5px, -0.5px); }
          45%, 50% { transform: translate(0, 1px); }
          55%,100% { transform: translate(0, 0); }
        }

        /* ── Boca hablando ── */
        @keyframes mouthTalk {
          0%, 100% { d: path("M 14 24 Q 21 24 28 24"); transform: scaleY(1); }
          20%, 60% { transform: scaleY(1.8); fill: #0a84ff; }
          40%, 80% { transform: scaleY(0.5); }
        }

        /* ── Brazos agitándose ── */
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

        /* ── Antena parpadeando ── */
        @keyframes antennaPulse {
          0%, 100% { r: 2.2; opacity: 1; fill: #0a84ff; }
          30%, 70% { r: 3.2; opacity: 0.6; fill: #22d3ee; }
          50%      { r: 4;   opacity: 1; fill: #ffffff; }
        }

        /* ── Sombra debajo del bot ── */
        @keyframes shadowPulse {
          0%, 100% { transform: scaleX(1); opacity: 0.25; }
          50%      { transform: scaleX(0.75); opacity: 0.12; }
        }

        /* ── Botón pecho que pulsa ── */
        @keyframes chestPulse {
          0%, 100% { r: 4; fill: #0a84ff; }
          50%      { r: 4.8; fill: #22d3ee; }
        }

        /* Clases */
        .robot-root {
          animation: robotFloat 2.8s ease-in-out infinite;
        }
        .robot-head {
          animation: headLook 7s ease-in-out infinite;
          transform-origin: 21px 17.5px;
        }
        .robot-eye {
          animation: blinkEye 4.5s infinite;
          transform-origin: center;
        }
        .robot-pupil {
          animation: pupilTrack 7s ease-in-out infinite;
        }
        .robot-mouth {
          animation: mouthTalk 1.2s ease-in-out infinite alternate;
          transform-origin: 21px 24px;
        }
        .robot-arm-l {
          animation: waveArmLeft 7s ease-in-out infinite;
          transform-origin: 8px 32px;
        }
        .robot-arm-r {
          animation: waveArmRight 7s ease-in-out infinite;
          transform-origin: 34px 32px;
        }
        .robot-antenna-dot {
          animation: antennaPulse 2s ease-in-out infinite;
        }
        .robot-chest {
          animation: chestPulse 1.8s ease-in-out infinite;
        }
        .robot-shadow {
          animation: shadowPulse 2.8s ease-in-out infinite;
        }
      `}</style>

      {/* Sombra en el suelo */}
      <div
        className="robot-shadow"
        style={{
          position: 'fixed',
          bottom: '8px',
          right: '26px',
          width: '60px',
          height: '10px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.3)',
          filter: 'blur(6px)',
          zIndex: 999998,
          pointerEvents: 'none',
        }}
      />

      <div
        className="robot-root"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          zIndex: 999999,
          pointerEvents: 'none',
          background: 'linear-gradient(160deg, #1c1c1e 0%, #2c2c2e 100%)',
          outline: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {/* Reflejo de vidrio superior */}
        <div style={{
          position: 'absolute',
          top: '6px', left: '12px', right: '12px',
          height: '28px', borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Robot SVG */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="44" height="46" viewBox="0 0 42 46" fill="none">

            {/* BRAZOS (detrás de cuerpo) */}
            <rect className="robot-arm-l" x="1" y="28" width="8" height="6" rx="3" fill="#d1d1d6"/>
            <rect className="robot-arm-r" x="33" y="28" width="8" height="6" rx="3" fill="#d1d1d6"/>

            {/* CUERPO */}
            <rect x="9" y="27" width="24" height="15" rx="5" fill="#d1d1d6"/>
            {/* Botón pecho */}
            <circle className="robot-chest" cx="21" cy="34" r="4" fill="#0a84ff"/>
            <circle cx="21" cy="34" r="1.8" fill="white"/>
            {/* Líneas laterales */}
            <line x1="11" y1="31" x2="15" y2="31" stroke="#aeaeb2" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="27" y1="31" x2="31" y2="31" stroke="#aeaeb2" strokeWidth="1.2" strokeLinecap="round"/>

            {/* CUELLO */}
            <rect x="18" y="24" width="6" height="4" rx="2" fill="#c7c7cc"/>

            {/* CABEZA (animada: gira) */}
            <g className="robot-head">
              {/* Antena */}
              <line x1="21" y1="1" x2="21" y2="7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
              <circle className="robot-antenna-dot" cx="21" cy="1" r="2.2" fill="#0a84ff"/>

              {/* Cabeza */}
              <rect x="7" y="7" width="28" height="19" rx="6" fill="#e5e5ea"/>

              {/* Ojo izquierdo */}
              <g className="robot-eye">
                <rect x="10.5" y="11.5" width="9" height="9" rx="3" fill="#1c1c1e"/>
                <circle cx="12.5" cy="13.5" r="2.2" fill="white" fillOpacity="0.95"/>
                <circle className="robot-pupil" cx="12.5" cy="13.5" r="1.1" fill="#0a84ff"/>
              </g>

              {/* Ojo derecho */}
              <g className="robot-eye">
                <rect x="22.5" y="11.5" width="9" height="9" rx="3" fill="#1c1c1e"/>
                <circle cx="24.5" cy="13.5" r="2.2" fill="white" fillOpacity="0.95"/>
                <circle className="robot-pupil" cx="24.5" cy="13.5" r="1.1" fill="#0a84ff"/>
              </g>

              {/* Boca */}
              <rect className="robot-mouth" x="14" y="23" width="14" height="2.5" rx="1.2" fill="#aeaeb2"/>
            </g>

          </svg>
        </div>
      </div>
    </>
  );
}

export default ChatbotWidget;
