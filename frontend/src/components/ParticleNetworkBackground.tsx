import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ── Particle count by device capability ─────────────────────────
const isMobile = () => window.innerWidth < 768 || navigator.maxTouchPoints > 0;

// ── Network mesh — particles + connection lines ──────────────────
function ParticleNetwork({ sosActive }: { sosActive: boolean }) {
  const meshRef  = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { camera } = useThree();

  const COUNT = isMobile() ? 100 : 200;
  const CONNECT_DIST = 3;

  // Build geometry once
  const { positions, linePositions, lineIndices } = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < COUNT; i++) {
      positions.push(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 8,
      );
    }

    // Precompute which pairs connect
    const linePositions: number[] = [];
    const lineIndices: [number, number][] = [];
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = positions[i * 3]     - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const d  = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < CONNECT_DIST) {
          lineIndices.push([i, j]);
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2],
          );
        }
      }
    }
    return { positions, linePositions, lineIndices };
  }, [COUNT]);

  // Geometry buffers
  const pointGeo  = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    return g;
  }, [linePositions]);

  // Materials (updated reactively when sosActive changes)
  const pointMat = useMemo(() => new THREE.PointsMaterial({
    size: 0.08,
    color: '#2979FF',
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  }), []);

  const lineMat = useMemo(() => new THREE.LineBasicMaterial({
    color: '#FF9933',
    transparent: true,
    opacity: 0.2,
  }), []);

  // Gyroscope / device orientation → subtle camera tilt
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const beta  = ((e.beta  ?? 0) * Math.PI) / 180;
      const gamma = ((e.gamma ?? 0) * Math.PI) / 180;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, gamma * 0.5, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, -beta * 0.3, 0.05);
    };
    window.addEventListener('deviceorientation', handler, { passive: true });
    return () => window.removeEventListener('deviceorientation', handler);
  }, [camera]);

  // Per-frame animation
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!meshRef.current || !linesRef.current) return;

    // Rotation speed: faster on SOS
    const speed = sosActive ? 0.003 : 0.0005;
    meshRef.current.parent!.rotation.y += speed;

    // Color transition
    const targetColor = sosActive ? new THREE.Color('#FF1744') : new THREE.Color('#2979FF');
    (meshRef.current.material as THREE.PointsMaterial).color.lerp(targetColor, 0.03);

    // Gentle float
    meshRef.current.parent!.position.y = Math.sin(t * 0.2) * 0.1;
  });

  return (
    <group>
      <points ref={meshRef} geometry={pointGeo} material={pointMat} />
      <lineSegments ref={linesRef} geometry={lineGeo} material={lineMat} />
    </group>
  );
}

// ── Exported canvas wrapper ──────────────────────────────────────
interface Props {
  sosActive?: boolean;
  height?: string;
}

export function ParticleNetworkBackground({ sosActive = false, height = '60vh' }: Props) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <ParticleNetwork sosActive={sosActive} />
      </Canvas>
    </div>
  );
}
