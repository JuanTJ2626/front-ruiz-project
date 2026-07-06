import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

function ChatbotWidget() {
  const { negocioActivo } = useApp();
  const inicializado = useRef(false);
  const scriptsLoaded = useRef(false);

  // Cargar scripts de Botpress dinámicamente solo cuando el componente se monta
  useEffect(() => {
    if (scriptsLoaded.current) return;

    console.log('🤖 Cargando scripts de Botpress...');

    const script1 = document.createElement('script');
    script1.src = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js';
    script1.async = true;
    
    script1.onload = () => {
      console.log('✅ Script de Botpress inject.js cargado');
      
      // Cargar el segundo script después del primero
      const script2 = document.createElement('script');
      script2.src = 'https://files.bpcontent.cloud/2026/06/29/21/20260629215347-AM6D0IHR.js';
      script2.defer = true;
      
      script2.onload = () => {
        console.log('✅ Script de configuración de Botpress cargado');
      };
      
      script2.onerror = () => {
        console.error('❌ Error al cargar el script de configuración de Botpress');
      };
      
      document.body.appendChild(script2);
    };

    script1.onerror = () => {
      console.error('❌ Error al cargar inject.js de Botpress');
    };

    document.body.appendChild(script1);
    scriptsLoaded.current = true;

    // No removemos los scripts al desmontar para evitar recargas innecesarias
  }, []);

  // Ocultar burbuja original de Botpress después de un delay
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
      console.log('🎨 Estilos para ocultar widget original aplicados');
    }, 1500); // Espera 1.5s para que el widget se cargue primero

    return () => {
      clearTimeout(timer);
      document.getElementById('bp-hide-fab')?.remove();
    };
  }, []);

  useEffect(() => {
    if (!negocioActivo) return;
    const intentar = setInterval(() => {
      if (!window.botpress?.sendMessage) return;
      if (!inicializado.current) {
        window.botpress.on('ready', () => {
          const nId = localStorage.getItem('negocioId');
          if (nId) {
            window.botpress.sendMessage(`__INIT__:${nId}`);
            console.log('✅ negocioId enviado al bot (init):', nId);
          }
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
    console.log('🔄 negocioId actualizado en bot:', negocioActivo);
  }, [negocioActivo]);

  return (
    <>
      <style>{`
        @keyframes appleBreath {
          0%, 100% { box-shadow: 0 4px 24px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.12); }
          50%       { box-shadow: 0 8px 36px rgba(0,0,0,0.30), 0 2px 8px rgba(0,0,0,0.15); }
        }
        @keyframes appleFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        @keyframes appleBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95%            { transform: scaleY(0.05); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }

        .apple-bot {
          animation: appleBreath 3s ease-in-out infinite, appleFloat 4s ease-in-out infinite;
        }
        .apple-eye-l {
          animation: appleBlink 6s ease-in-out infinite;
          transform-origin: 18px 16px;
        }
        .apple-eye-r {
          animation: appleBlink 6s ease-in-out infinite 0.12s;
          transform-origin: 28px 16px;
        }
        .apple-dot {
          animation: dotPulse 2s ease-in-out infinite;
        }
      `}</style>

      <div
        className="apple-bot"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          zIndex: 999999,
          pointerEvents: 'none',
          /* Fondo negro profundo estilo Apple */
          background: 'linear-gradient(160deg, #1c1c1e 0%, #2c2c2e 100%)',
          /* Borde sutil como el vidrio de iPhone */
          outline: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        {/* Reflejo de vidrio superior */}
        <div style={{
          position: 'absolute',
          top: '6px',
          left: '12px',
          right: '12px',
          height: '28px',
          borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.13) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Robot SVG */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="42" height="44" viewBox="0 0 42 44" fill="none">

            {/* Antena */}
            <line x1="21" y1="3" x2="21" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Punto antena — pulsa en azul Apple */}
            <circle className="apple-dot" cx="21" cy="2" r="2.2" fill="#0a84ff"/>

            {/* Cabeza — gris claro como aluminio */}
            <rect x="7" y="8" width="28" height="19" rx="6" fill="#e5e5ea"/>

            {/* Ojo izquierdo */}
            <g className="apple-eye-l">
              <rect x="10.5" y="12.5" width="9" height="9" rx="3" fill="#1c1c1e"/>
              {/* brillo */}
              <circle cx="12.5" cy="14.5" r="2" fill="white" fillOpacity="0.9"/>
              <circle cx="12.5" cy="14.5" r="0.9" fill="#0a84ff"/>
            </g>

            {/* Ojo derecho */}
            <g className="apple-eye-r">
              <rect x="22.5" y="12.5" width="9" height="9" rx="3" fill="#1c1c1e"/>
              <circle cx="24.5" cy="14.5" r="2" fill="white" fillOpacity="0.9"/>
              <circle cx="24.5" cy="14.5" r="0.9" fill="#0a84ff"/>
            </g>

            {/* Boca — línea discreta */}
            <rect x="14" y="23.5" width="14" height="2" rx="1" fill="#aeaeb2"/>

            {/* Cuerpo — aluminio más oscuro */}
            <rect x="9" y="29" width="24" height="13" rx="5" fill="#d1d1d6"/>

            {/* Botón pecho azul Apple */}
            <circle cx="21" cy="35.5" r="4" fill="#0a84ff"/>
            <circle cx="21" cy="35.5" r="1.8" fill="white"/>

            {/* Líneas laterales decorativas */}
            <line x1="11" y1="33" x2="15" y2="33" stroke="#aeaeb2" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="27" y1="33" x2="31" y2="33" stroke="#aeaeb2" strokeWidth="1.2" strokeLinecap="round"/>

            {/* Brazos */}
            <rect x="2"  y="30" width="6" height="5" rx="2.5" fill="#d1d1d6"/>
            <rect x="34" y="30" width="6" height="5" rx="2.5" fill="#d1d1d6"/>
          </svg>
        </div>
      </div>
    </>
  );
}

export default ChatbotWidget;
