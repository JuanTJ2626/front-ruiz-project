import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ── Partículas flotantes con conexiones ─────────────────────── */
const Particles = ({ count = 120, spread = 8, isDark = false }) => {
  const meshRef = useRef()
  const lineRef = useRef()

  /* Posiciones iniciales aleatorias */
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = []
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * spread * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3
      velocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.012,
        z: (Math.random() - 0.5) * 0.005,
      })
    }
    return { positions, velocities }
  }, [count, spread])

  /* Líneas de conexión entre partículas cercanas */
  const linePositions = useMemo(() => new Float32Array(count * count * 6), [count])

  useFrame(() => {
    if (!meshRef.current) return
    const pos = meshRef.current.geometry.attributes.position.array
    const halfW = spread

    /* Mover partículas */
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i].x
      pos[i * 3 + 1] += velocities[i].y
      pos[i * 3 + 2] += velocities[i].z

      /* Rebote en bordes */
      if (Math.abs(pos[i * 3])     > halfW) velocities[i].x *= -1
      if (Math.abs(pos[i * 3 + 1]) > spread / 2) velocities[i].y *= -1
      if (Math.abs(pos[i * 3 + 2]) > 2) velocities[i].z *= -1
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true

    /* Calcular líneas entre partículas cercanas */
    if (!lineRef.current) return
    const lp = lineRef.current.geometry.attributes.position.array
    let lineIdx = 0
    const threshold = 2.2

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pos[i * 3] - pos[j * 3]
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < threshold && lineIdx + 5 < lp.length) {
          lp[lineIdx++] = pos[i * 3]
          lp[lineIdx++] = pos[i * 3 + 1]
          lp[lineIdx++] = pos[i * 3 + 2]
          lp[lineIdx++] = pos[j * 3]
          lp[lineIdx++] = pos[j * 3 + 1]
          lp[lineIdx++] = pos[j * 3 + 2]
        } else if (lineIdx + 5 < lp.length) {
          /* Poner fuera de vista las líneas no usadas */
          lp[lineIdx] = lp[lineIdx + 3] = 9999
          lineIdx += 6
        }
      }
    }
    lineRef.current.geometry.attributes.position.needsUpdate = true
  })

  // Colores dinámicos según el tema
  const pointColor = isDark ? "#60a5fa" : "#3b82f6" // Azul más brillante en modo oscuro
  const lineColor  = isDark ? "#38bdf8" : "#1E3A8A" // Cyan visible en modo oscuro, azul oscuro en claro
  const lineOpacity = isDark ? 0.4 : 0.3

  return (
    <>
      {/* Puntos / partículas */}
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={count}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color={pointColor}
          transparent
          opacity={isDark ? 1 : 0.85}
          sizeAttenuation
        />
      </points>

      {/* Líneas de conexión */}
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={linePositions}
            count={linePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={lineColor}
          transparent
          opacity={lineOpacity}
        />
      </lineSegments>
    </>
  )
}

/* ── Export: canvas de pantalla completa ─────────────────────── */
export default function ParticleField({ className = '' }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Detectar si está en dark mode inicialmente
    setIsDark(document.documentElement.classList.contains('dark'))

    // Escuchar cambios en la clase de html
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'))
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
      dpr={[1, 1.5]}
    >
      <Particles count={100} spread={9} isDark={isDark} />
    </Canvas>
  )
}
