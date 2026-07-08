import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ── Partículas flotantes con conexiones ─────────────────────── */
const Particles = ({ count = 120, spread = 8 }) => {
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
          color="#a78bfa"
          transparent
          opacity={0.75}
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
          color="#7c3aed"
          transparent
          opacity={0.18}
        />
      </lineSegments>
    </>
  )
}

/* ── Export: canvas de pantalla completa ─────────────────────── */
export default function ParticleField({ className = '' }) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
      dpr={[1, 1.5]}
    >
      <Particles count={100} spread={9} />
    </Canvas>
  )
}
