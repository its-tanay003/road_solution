import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Timer } from 'three';
import { threeCanvasRegistry } from '../utils/threeCanvasRegistry';

// ── Particle count by device capability ─────────────────────────
const getParticleCount = () => {
  // Mobile or low-end device optimization
  if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4) {
    return 80;
  }
  return 150;
};

// ── Network mesh — particles + connection lines ──────────────────
function ParticleNetwork({ sosActive }: { sosActive: boolean }) {
  const meshRef  = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { camera } = useThree();
  const timer = useMemo(() => new Timer(), []);

  const COUNT = useMemo(() => getParticleCount(), []);
  const CONNECT_DIST = 3;

  // Stable positions state to satisfy purity rules
  const [networkData, setNetworkData] = useState<{ positions: number[], linePositions: number[] } | null>(null);

  useEffect(() => {
    if (networkData) return;

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
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = positions[i * 3]     - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const d  = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < CONNECT_DIST) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2],
          );
        }
      }
    }
    
    setNetworkData({ positions, linePositions });
  }, [COUNT, networkData]); // CONNECT_DIST is a constant in this scope, but better to just use COUNT and networkData check

  const initialized = !!networkData;
  const positions = useMemo(() => networkData?.positions || [], [networkData]);
  const linePositions = useMemo(() => networkData?.linePositions || [], [networkData]);

  // Geometry buffers
  const pointGeo  = useMemo(() => {
    if (!initialized) return new THREE.BufferGeometry();
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [positions, initialized]);

  const lineGeo = useMemo(() => {
    if (!initialized) return new THREE.BufferGeometry();
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    return g;
  }, [linePositions, initialized]);

  // Materials
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

  // Gyroscope / device orientation
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

  // Per-frame animation using Timer instead of Clock
  useFrame(() => {
    timer.update();
    const t = timer.getElapsed();
    
    if (!meshRef.current || !linesRef.current) return;

    const speed = sosActive ? 0.003 : 0.0005;
    meshRef.current.parent!.rotation.y += speed;

    const targetColor = sosActive ? new THREE.Color('#FF1744') : new THREE.Color('#2979FF');
    (meshRef.current.material as THREE.PointsMaterial).color.lerp(targetColor, 0.03);

    meshRef.current.parent!.position.y = Math.sin(t * 0.2) * 0.1;
  });

  if (!initialized) return null;

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
}

export function ParticleNetworkBackground({ sosActive = false }: Props) {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const registered = threeCanvasRegistry.register();
    requestAnimationFrame(() => setCanRender(registered));
    return () => {
      if (registered) threeCanvasRegistry.unregister();
    };
  }, []);

  if (!canRender) {
    return <div className="absolute inset-0 bg-[#050A14]" />;
  }

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: false,
          powerPreference: 'low-power',
          alpha: true,
          failIfMajorPerformanceCaveat: false,
        }}
        frameloop="demand"
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <ParticleNetwork sosActive={sosActive} />
      </Canvas>
    </div>
  );
}
