import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Sphere, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

// ─── Camera Controller ────────────────────────────────────────────────────────
function CameraController({ scrollProgress }) {
  const { camera } = useThree()
  const keyframes = useMemo(() => [
    { pos: [0, 0, 8],  t: 0    },
    { pos: [0, 0, 8],  t: 0.12 },
    { pos: [3, 1, 7],  t: 0.25 },
    { pos: [3, 1, 7],  t: 0.38 },
    { pos: [-3,-1, 7], t: 0.50 },
    { pos: [-3,-1, 7], t: 0.63 },
    { pos: [0, 2, 9],  t: 0.75 },
    { pos: [0, 2, 9],  t: 0.85 },
    { pos: [0, 0, 12], t: 1.0  },
  ], [])

  useFrame(() => {
    const t = scrollProgress
    let i = 0
    for (let k = 0; k < keyframes.length - 1; k++) {
      if (t >= keyframes[k].t && t <= keyframes[k+1].t) { i = k; break }
    }
    const a = keyframes[i], b = keyframes[Math.min(i+1, keyframes.length-1)]
    const raw = a.t === b.t ? 0 : (t - a.t) / (b.t - a.t)
    const ease = raw < 0.5 ? 2*raw*raw : 1 - Math.pow(-2*raw+2,2)/2
    camera.position.lerp(new THREE.Vector3(
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], ease),
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], ease),
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], ease),
    ), 0.05)
    camera.lookAt(0, 0, 0)
  })
  return null
}

// ─── Star Field ───────────────────────────────────────────────────────────────
function StarField({ currentZone }) {
  const color = currentZone === 'repulsion' ? '#ff6644'
    : currentZone === 'attraction' ? '#4488ff' : '#ffffff'
  return <Stars radius={120} depth={60} count={3000} factor={4} saturation={0} fade speed={0.5} color={color} />
}

// ─── Background Dust ──────────────────────────────────────────────────────────
function DustParticles({ currentZone, count = 200 }) {
  const mesh = useRef()
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random()-0.5)*20
      pos[i*3+1] = (Math.random()-0.5)*20
      pos[i*3+2] = (Math.random()-0.5)*20
    }
    return pos
  }, [count])
  const velocities = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random()-0.5)*0.005,
      y: (Math.random()-0.5)*0.005,
      z: (Math.random()-0.5)*0.005,
    })), [count])
  const zoneColor = useMemo(() => {
    switch (currentZone) {
      case 'repulsion':  return new THREE.Color('#ff3333')
      case 'attraction': return new THREE.Color('#3366ff')
      case 'gravity':    return new THREE.Color('#f59e0b')
      default:           return new THREE.Color('#8899bb')
    }
  }, [currentZone])
  useFrame(() => {
    if (!mesh.current) return
    const pos = mesh.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      for (let ax = 0; ax < 3; ax++) {
        pos.array[i*3+ax] += velocities[i][['x','y','z'][ax]]
        if (Math.abs(pos.array[i*3+ax]) > 10) pos.array[i*3+ax] *= -0.9
      }
    }
    pos.needsUpdate = true
    mesh.current.material.color.lerp(zoneColor, 0.02)
  })
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#8899bb" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

// ─── Central Planet ───────────────────────────────────────────────────────────
function Planet({ currentZone, quizResult }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const targetColor = useMemo(() => {
    if (quizResult) {
      if (quizResult.type === 'burnout')    return new THREE.Color('#cc2200')
      if (quizResult.type === 'attraction') return new THREE.Color('#1155ee')
      return new THREE.Color('#d97706')
    }
    switch (currentZone) {
      case 'repulsion':  return new THREE.Color('#cc2200')
      case 'attraction': return new THREE.Color('#1155ee')
      case 'gravity':    return new THREE.Color('#d97706')
      default:           return new THREE.Color('#334466')
    }
  }, [currentZone, quizResult])
  const targetEmissive = useMemo(() => {
    switch (currentZone) {
      case 'repulsion':  return new THREE.Color('#440000')
      case 'attraction': return new THREE.Color('#001144')
      case 'gravity':    return new THREE.Color('#3d2200')
      default:           return new THREE.Color('#050a1a')
    }
  }, [currentZone])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    meshRef.current.material.color.lerp(targetColor, 0.03)
    meshRef.current.material.emissive.lerp(targetEmissive, 0.03)
    if (currentZone === 'repulsion') {
      meshRef.current.material.distort = THREE.MathUtils.lerp(meshRef.current.material.distort, 0.6 + Math.sin(t*3)*0.2, 0.05)
      meshRef.current.rotation.y += 0.015
      meshRef.current.rotation.x = Math.sin(t*0.5)*0.3
    } else if (currentZone === 'attraction') {
      meshRef.current.material.distort = THREE.MathUtils.lerp(meshRef.current.material.distort, 0.35 + Math.sin(t*2)*0.1, 0.05)
      meshRef.current.rotation.y += 0.008
    } else if (currentZone === 'gravity') {
      meshRef.current.material.distort = THREE.MathUtils.lerp(meshRef.current.material.distort, 0.1, 0.05)
      meshRef.current.rotation.y += 0.004
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.05)
    } else {
      meshRef.current.material.distort = THREE.MathUtils.lerp(meshRef.current.material.distort, 0.2, 0.03)
      meshRef.current.rotation.y += 0.003
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.2 + Math.sin(t*1.5)*0.05)
      glowRef.current.material.opacity = (currentZone==='gravity' ? 0.15 : 0.08) + Math.sin(t*2)*0.03
    }
  })
  return (
    <group>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial color="#334466" emissive="#050a1a" metalness={0.3} roughness={0.7} distort={0.2} speed={2} />
      </Sphere>
      <Sphere ref={glowRef} args={[1.2, 32, 32]}>
        <meshBasicMaterial color="#3366ff" transparent opacity={0.08} side={THREE.BackSide} />
      </Sphere>
    </group>
  )
}

// ─── Repulsion Waves ──────────────────────────────────────────────────────────
function RepulsionWaves({ active }) {
  const wavesRef = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    wavesRef.current.forEach((mesh, i) => {
      if (!mesh) return
      const phase = (t*0.4 + i*0.8) % 3
      mesh.scale.setScalar(1 + phase*2.5)
      mesh.material.opacity = active ? Math.max(0, (1-phase/3)*0.35) : 0
    })
  })
  return (
    <>
      {[0,1,2,3].map(i => (
        <mesh key={i} ref={el => wavesRef.current[i] = el} rotation={[Math.PI/2 + i*0.4, i*0.6, 0]}>
          <torusGeometry args={[1.2, 0.02, 8, 64]} />
          <meshBasicMaterial color="#ff2200" transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

// ─── Attraction Beams ─────────────────────────────────────────────────────────
function AttractionBeams({ active }) {
  const beamsRef = useRef([])
  const NUM = 8
  const angles = useMemo(() => Array.from({length:NUM}, (_,i) => (i/NUM)*Math.PI*2), [])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    beamsRef.current.forEach((mesh, i) => {
      if (!mesh) return
      const angle = angles[i] + t*0.2
      const dist  = 3 + Math.sin(t*0.7+i)*0.5
      mesh.position.set(Math.cos(angle)*dist, Math.sin(angle)*0.5, Math.sin(angle)*dist*0.3)
      mesh.lookAt(0, 0, 0)
      mesh.material.opacity = active ? 0.4 + Math.sin(t*2+i)*0.2 : 0
    })
  })
  return (
    <>
      {Array.from({length:NUM}, (_,i) => (
        <mesh key={i} ref={el => beamsRef.current[i] = el}>
          <cylinderGeometry args={[0.02, 0.08, 3, 6]} />
          <meshBasicMaterial color="#4488ff" transparent opacity={0} />
        </mesh>
      ))}
    </>
  )
}

// ─── Golden Orbits ────────────────────────────────────────────────────────────
function GoldenOrbits({ active }) {
  const orbitsRef = useRef([])
  const defs = useMemo(() => [
    { radius: 2.0, tube: 0.025, rotX: Math.PI/6, rotZ: 0 },
    { radius: 2.8, tube: 0.018, rotX: Math.PI/3, rotZ: Math.PI/4 },
    { radius: 3.5, tube: 0.012, rotX: Math.PI/2, rotZ: Math.PI/8 },
  ], [])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    orbitsRef.current.forEach((mesh, i) => {
      if (!mesh) return
      mesh.rotation.z += 0.003 * (i%2===0 ? 1 : -1)
      const tgt = active ? 0.75 + Math.sin(t*0.5+i)*0.1 : 0
      mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, tgt, 0.03)
      mesh.material.emissiveIntensity = THREE.MathUtils.lerp(mesh.material.emissiveIntensity, active?0.6:0, 0.03)
    })
  })
  return defs.map((def, i) => (
    <mesh key={i} ref={el => orbitsRef.current[i] = el} rotation={[def.rotX, 0, def.rotZ]}>
      <torusGeometry args={[def.radius, def.tube, 16, 128]} />
      <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0} metalness={0.9} roughness={0.1} transparent opacity={0} />
    </mesh>
  ))
}

// ─── Support Satellites ───────────────────────────────────────────────────────
function SupportSatellites({ active }) {
  const SATS = useMemo(() => [
    { radius:2.5, size:0.18, angle:0,   color:'#f59e0b', speed:0.4  },
    { radius:3.2, size:0.12, angle:2.1, color:'#fcd34d', speed:-0.25},
    { radius:4.0, size:0.08, angle:4.2, color:'#d97706', speed:0.15 },
  ], [])
  const refs = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      const sat   = SATS[i]
      const angle = sat.angle + t*sat.speed
      mesh.position.set(Math.cos(angle)*sat.radius, Math.sin(angle)*0.3, Math.sin(angle)*sat.radius*0.4)
      mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, active?0.85:0, 0.03)
    })
  })
  return SATS.map((sat, i) => (
    <Sphere key={i} ref={el => refs.current[i] = el} args={[sat.size, 16, 16]}>
      <meshStandardMaterial color={sat.color} emissive={sat.color} emissiveIntensity={0.4} transparent opacity={0} />
    </Sphere>
  ))
}

// ─── Landing Particles ────────────────────────────────────────────────────────
function LandingParticles({ active }) {
  const meshRef  = useRef()
  const mousePos = useRef(new THREE.Vector2(0, 0))
  const COUNT    = 120
  const positions = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random()*Math.PI*2
      const r = 2 + Math.random()*4
      pos[i*3]   = Math.cos(theta)*r
      pos[i*3+1] = (Math.random()-0.5)*4
      pos[i*3+2] = Math.sin(theta)*r
    }
    return pos
  }, [])
  useEffect(() => {
    const onMove = e => {
      mousePos.current.x = (e.clientX/window.innerWidth)*2 - 1
      mousePos.current.y = -(e.clientY/window.innerHeight)*2 + 1
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
  useFrame((state) => {
    if (!meshRef.current) return
    const t   = state.clock.elapsedTime
    const pos = meshRef.current.geometry.attributes.position
    for (let i = 0; i < COUNT; i++) {
      pos.array[i*3+1] = ((i/COUNT)-0.5)*4 + Math.sin(t*0.5+i*0.3)*0.3 + mousePos.current.y*0.5
      pos.array[i*3]  += Math.cos(t*0.3+i)*0.001 + mousePos.current.x*0.002
    }
    pos.needsUpdate = true
    meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, active?0.5:0, 0.03)
  })
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#3366ff" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

// ─── Lighting ─────────────────────────────────────────────────────────────────
function SceneLighting({ currentZone }) {
  const lightRef = useRef()
  const targetColor = useMemo(() => {
    switch (currentZone) {
      case 'repulsion':  return new THREE.Color('#ff3300')
      case 'attraction': return new THREE.Color('#0033ff')
      case 'gravity':    return new THREE.Color('#f59e0b')
      default:           return new THREE.Color('#112244')
    }
  }, [currentZone])
  useFrame(() => { if (lightRef.current) lightRef.current.color.lerp(targetColor, 0.03) })
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight ref={lightRef} position={[5,5,5]} intensity={2} color="#112244" />
      <pointLight position={[-5,-3,-5]} intensity={0.8} color="#112244" />
      <directionalLight position={[0,10,5]} intensity={0.5} color="#ffffff" />
    </>
  )
}

// ─── Scene Composition ────────────────────────────────────────────────────────
function Scene({ scrollProgress, currentZone, zoneProgress, quizResult }) {
  return (
    <>
      <CameraController scrollProgress={scrollProgress} />
      <SceneLighting currentZone={currentZone} />
      <StarField currentZone={currentZone} />
      <DustParticles currentZone={currentZone} count={150} />
      <LandingParticles active={currentZone === 'landing'} />
      <Planet currentZone={currentZone} zoneProgress={zoneProgress} quizResult={quizResult} />
      <RepulsionWaves active={currentZone === 'repulsion'} />
      <AttractionBeams active={currentZone === 'attraction'} />
      <GoldenOrbits active={currentZone === 'gravity'} />
      <SupportSatellites active={currentZone === 'gravity'} />
    </>
  )
}

// ─── Canvas Wrapper ───────────────────────────────────────────────────────────
export default function CosmosScene({ scrollProgress, currentZone, zoneProgress, quizResult }) {
  return (
    <Canvas camera={{ position:[0,0,8], fov:60 }} gl={{ antialias:true, alpha:false }} dpr={[1,2]} style={{ background:'#030712' }}>
      <Scene
        scrollProgress={scrollProgress}
        currentZone={currentZone}
        zoneProgress={zoneProgress}
        quizResult={quizResult}
      />
    </Canvas>
  )
}
