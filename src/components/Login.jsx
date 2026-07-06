import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { loginUser, registerUser, setAuthData } from '../services/authService';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

/* ── Siempre modo claro en login ─────────────────────────── */
const ensureLightMode = () => document.documentElement.classList.remove('dark');

/* ── Esfera 3D animada (diseño original) ─────────────────── */
const AnimatedShape = ({ color, distort, speed, position, scale }) => {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t / 4) / 2;
      meshRef.current.rotation.z = t / 5;
      meshRef.current.position.y = position[1] + Math.sin(t / 2) * 0.5;
    }
  });
  return (
    <group position={position} scale={scale}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial color={color} distort={distort} speed={speed} roughness={0.2} metalness={0.8} />
      </Sphere>
    </group>
  );
};

const Background3D = () => (
  <div className="pointer-events-none absolute inset-0 z-0">
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={2} color="#1E3A8A" />
      <AnimatedShape color="#1E3A8A" distort={0.5} speed={1.5} position={[2.5, 0, -2]} scale={1.5} />
      <AnimatedShape color="#722F37" distort={0.6} speed={2} position={[-3, 1.5, -4]} scale={1.3} />
      <AnimatedShape color="#0f172a" distort={0.4} speed={1} position={[-2, -2, -1]} scale={1} />
    </Canvas>
  </div>
);

/* ── Login principal ─────────────────────────────────────── */
const Login = ({ onLogin }) => {
  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isRegistering, setIsReg] = useState(false);
  const [loading, setLoading]     = useState(false);

  const containerRef = useRef(null);
  const cardRef      = useRef(null);

  useEffect(() => { ensureLightMode(); }, []);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.out' }
    );
    tl.fromTo(cardRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' },
      '-=0.5'
    );
    tl.fromTo(cardRef.current.querySelectorAll('.gsap-stagger'),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
      '-=0.4'
    );
  }, { scope: containerRef });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      if (isRegistering) {
        const data = await registerUser({ username, password, email });
        if (data?.token) {
          setAuthData(data);
          toast.success('¡Cuenta creada! Bienvenido.');
          onLogin();
        }
      } else {
        const data = await loginUser({ username, password });
        if (data?.token) {
          setAuthData(data);
          toast.success('Sesión iniciada correctamente');
          onLogin();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="login-bg fixed inset-0 z-[100] flex min-h-screen w-full items-center justify-center overflow-hidden px-4 font-sans"
    >
      <Background3D />

      <div ref={cardRef} className="login-card mx-auto shrink-0">
        {/* Logo */}
        <div className="gsap-stagger mb-6 flex items-center justify-center opacity-90 drop-shadow-[0_4px_6px_rgba(0,0,0,0.05)]">
          <span className="font-heading text-[1.1rem] font-bold tracking-[0.15em] whitespace-nowrap bg-gradient-to-br from-teal-600 to-cyan-500 bg-clip-text text-transparent">
            INVENT-PRO
          </span>
        </div>

        <h1 className="gsap-stagger mb-2 text-center font-heading text-[1.75rem] font-semibold tracking-tight text-slate-900">
          {isRegistering ? 'Crea tu cuenta' : 'Inicia sesión en la plataforma'}
        </h1>
        <p className="gsap-stagger mb-10 text-center text-[0.95rem] text-slate-500">
          Gestiona tus productos de forma eficiente
        </p>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
          {/* Usuario */}
          <div className="gsap-stagger relative w-full">
            <input
              type="text"
              className="login-input"
              placeholder=" "
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <label className="login-label">Usuario</label>
          </div>

          {/* Email — solo registro */}
          {isRegistering && (
            <div className="gsap-stagger relative w-full">
              <input
                type="email"
                className="login-input"
                placeholder=" "
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <label className="login-label">Correo electrónico</label>
            </div>
          )}

          {/* Contraseña */}
          <div className="gsap-stagger relative w-full">
            <input
              type="password"
              className="login-input"
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />
            <label className="login-label">Contraseña</label>
          </div>

          {!isRegistering && (
            <div className="gsap-stagger mt-2 mb-2 flex items-center justify-between gap-3 text-sm">
              <label className="flex shrink-0 cursor-pointer items-center gap-2 text-slate-500 select-none">
                <input type="checkbox" className="login-checkbox" />
                <span>Recordarme</span>
              </label>
              <a href="#" className="shrink-0 text-blue-500 no-underline transition-colors hover:text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'gsap-stagger group mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-slate-900 py-4 text-base font-semibold text-white shadow-[0_4px_14px_rgba(15,23,42,0.2)] transition-all duration-300 hover:bg-slate-800 hover:shadow-[0_6px_20px_rgba(15,23,42,0.3)]',
              loading && 'cursor-not-allowed opacity-70'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ transform: isHovered && !loading ? 'scale(1.02)' : 'scale(1)' }}
          >
            {loading ? 'Procesando...' : isRegistering ? 'Crear cuenta' : 'Continuar'}
            <svg
              className="transition-transform duration-300 group-hover:translate-x-1"
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>

        <div className="gsap-stagger mt-8 text-center text-[0.9rem] text-slate-500">
          <p>
            {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}{' '}
            <a
              href="#"
              className="text-blue-500 no-underline transition-colors hover:text-blue-600 hover:underline"
              onClick={e => { e.preventDefault(); setIsReg(v => !v); setUsername(''); setEmail(''); setPassword(''); }}
            >
              {isRegistering ? 'Inicia sesión' : 'Crea una ahora'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
