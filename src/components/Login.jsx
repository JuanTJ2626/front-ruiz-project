import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Eye, EyeOff } from 'lucide-react';
import { loginUser, setAuthData } from '../services/authService';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

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
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading]     = useState(false);

  const containerRef = useRef(null);
  const cardRef      = useRef(null);

  // Aplica el tema guardado al cargar el componente
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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
    if (!username.trim()) return toast.error('Ingresa tu nombre de usuario');
    if (!password)        return toast.error('Ingresa tu contraseña');
    
    setLoading(true);
    try {
      const data = await loginUser({ username: username.trim(), password });
      if (data?.token) {
        setAuthData(data);
        toast.success('Sesión iniciada correctamente');
        onLogin();
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Usuario o contraseña incorrectos');
      } else if (status === 400) {
        toast.error('Verifica los datos ingresados e intenta de nuevo');
      } else if (!navigator.onLine) {
        toast.error('Sin conexión. Revisa tu internet e intenta de nuevo');
      } else {
        toast.error('No se pudo conectar al servidor. Intenta más tarde');
      }
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

      <div ref={cardRef} className="login-card mx-auto shrink-0 relative z-10">
        {/* Logo */}
        <div className="gsap-stagger mb-6 flex items-center justify-center opacity-90 drop-shadow-[0_4px_6px_rgba(0,0,0,0.05)]">
          <span className="font-heading text-[1.1rem] font-bold tracking-[0.15em] whitespace-nowrap bg-gradient-to-br from-teal-600 to-cyan-500 bg-clip-text text-transparent">
            INVENT-PRO
          </span>
        </div>

        <h1 className="gsap-stagger mb-2 text-center font-heading text-[1.75rem] font-semibold tracking-tight text-slate-900 dark:text-white">
          Inicia sesión en la plataforma
        </h1>
        <p className="gsap-stagger mb-10 text-center text-[0.95rem] text-slate-500 dark:text-slate-400">
          Gestiona tu inventario de forma eficiente
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

          {/* Contraseña con botón mostrar/ocultar */}
          <div className="gsap-stagger relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input pr-12"
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <label className="login-label">Contraseña</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'gsap-stagger group mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 py-4 text-base font-semibold text-white shadow-[0_4px_14px_rgba(15,23,42,0.2)] transition-all duration-300',
              'bg-slate-900 hover:bg-slate-800 hover:shadow-[0_6px_20px_rgba(15,23,42,0.3)]',
              'dark:bg-gradient-to-r dark:from-cyan-600 dark:to-emerald-600 dark:hover:from-cyan-500 dark:hover:to-emerald-500 dark:shadow-[0_4px_14px_rgba(6,182,212,0.3)]',
              loading && 'cursor-not-allowed opacity-70'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ transform: isHovered && !loading ? 'scale(1.02)' : 'scale(1)' }}
          >
            {loading ? 'Iniciando sesión...' : 'Continuar'}
            <svg
              className="transition-transform duration-300 group-hover:translate-x-1"
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>

        <div className="gsap-stagger mt-8 text-center text-[0.85rem] text-slate-500 dark:text-slate-400">
          <p>¿No tienes acceso? Contacta al administrador del sistema.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
