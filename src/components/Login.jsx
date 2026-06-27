import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { loginUser, registerUser } from '../services/authService';
import './Login.css';

const AnimatedShape = ({ color, distort, speed, position, scale }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t / 4) / 2;
      meshRef.current.rotation.z = t / 5;
      meshRef.current.position.y = Math.sin(t / 2) * 0.5;
    }
  });

  return (
    <group position={position} scale={scale}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={speed}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </group>
  );
};

const Background3D = () => {
  return (
    <div className="three-bg-container">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        {/* Luces sutiles para resaltar los colores oscuros aurora */}
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#1E3A8A" />
        
        {/* Formas 3D con colores oscuros Aurora */}
        {/* Azul Fuerte */}
        <AnimatedShape color="#1E3A8A" distort={0.5} speed={1.5} position={[2.5, 0, -2]} scale={1.5} />
        {/* Vino */}
        <AnimatedShape color="#722F37" distort={0.6} speed={2} position={[-3, 1.5, -4]} scale={1.3} />
        {/* Un tono intermedio oscuro para profundidad */}
        <AnimatedShape color="#0f172a" distort={0.4} speed={1} position={[-2, -2, -1]} scale={1} />
      </Canvas>
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.out' }
    );

    tl.fromTo(cardRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' },
      "-=0.5" 
    );

    const elementsToStagger = cardRef.current.querySelectorAll('.gsap-stagger');
    tl.fromTo(elementsToStagger,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
      "-=0.4"
    );

  }, { scope: containerRef });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (email && password) {
      setLoading(true);
      try {
        if (isRegistering) {
          // Usamos email como username para simplificar el formulario
          await registerUser({ username: email, password, email });
          alert('Registro exitoso. Ahora puedes iniciar sesión.');
          setIsRegistering(false);
        } else {
          await loginUser({ username: email, password });
          onLogin();
        }
      } catch (err) {
        setError(err.message || 'Error de autenticación');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="apple-login-container" ref={containerRef}>
      
      {/* Fondo 3D Interactivo */}
      <Background3D />

      <div className="apple-login-card" ref={cardRef}>
        <div className="apple-logo gsap-stagger">
          <span className="login-logo-text">INVENTARIO</span>
        </div>
        
        <h1 className="apple-login-title gsap-stagger">
          {isRegistering ? 'Crea tu cuenta' : 'Inicia sesión en la plataforma'}
        </h1>
        <p className="apple-login-subtitle gsap-stagger">Gestiona tus productos de forma eficiente</p>

        {error && <p className="apple-login-error gsap-stagger" style={{ color: '#ff4d4d', textAlign: 'center', margin: '10px 0' }}>{error}</p>}

        <form onSubmit={handleSubmit} className="apple-login-form">
          <div className="apple-input-group gsap-stagger">
            <input 
              type="email" 
              className="apple-input" 
              placeholder=" " 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="apple-label">Correo electrónico</label>
          </div>
          
          <div className="apple-input-group gsap-stagger">
            <input 
              type="password" 
              className="apple-input" 
              placeholder=" " 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="apple-label">Contraseña</label>
          </div>

          <div className="apple-options gsap-stagger">
            <label className="apple-checkbox">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <a href="#" className="apple-link">¿Olvidaste tu contraseña?</a>
          </div>

          <button 
            type="submit" 
            className="apple-btn gsap-stagger"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={loading}
            style={{
              transform: isHovered && !loading ? 'scale(1.02)' : 'scale(1)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Procesando...' : 'Continuar'}
            <svg className="apple-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </form>

        <div className="apple-login-footer gsap-stagger">
          <p>
            {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}{' '}
            <a href="#" className="apple-link" onClick={(e) => {
              e.preventDefault();
              setIsRegistering(!isRegistering);
              setError('');
            }}>
              {isRegistering ? 'Inicia sesión' : 'Crea una ahora'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
