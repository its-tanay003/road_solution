import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Timer } from 'three';
import { threeCanvasRegistry } from '../utils/threeCanvasRegistry';
import './AnimatedAmbulance3D.css';

/* ── simple box-built ambulance ─────────────────────────────── */
function AmbulanceModel({ progressRef, timer }: { progressRef: React.MutableRefObject<number>; timer: Timer }) {
  const groupRef = useRef<THREE.Group>(null);

  // Bezier: hospital (right) → user (left)
  const curve = useMemo(() => new THREE.CubicBezierCurve3(
    new THREE.Vector3(2.5,  0,  0.5),
    new THREE.Vector3(1.2,  0,  1.2),
    new THREE.Vector3(-0.8, 0,  0.8),
    new THREE.Vector3(-2.2, 0,  0),
  ), []);

  useFrame(() => {
    const delta = timer.getDelta();
    progressRef.current = (progressRef.current + delta * 0.06) % 1;
    if (groupRef.current) {
      const pos = curve.getPoint(progressRef.current);
      const tan = curve.getTangent(progressRef.current);
      groupRef.current.position.copy(pos);
      groupRef.current.lookAt(pos.clone().add(tan));
    }
  });

  return (
    <group ref={groupRef} scale={[0.4, 0.4, 0.4]}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[2, 1, 1.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* Cab */}
      <mesh position={[-1.2, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.5, 1.1]} />
        <meshStandardMaterial color="#ECEFF1" />
      </mesh>
      {/* Red cross — top */}
      <mesh position={[0.2, 0.52, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.2]} />
        <meshStandardMaterial color="#FF1744" emissive="#FF1744" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.2, 0.52, 0]}>
        <boxGeometry args={[0.2, 0.06, 0.7]} />
        <meshStandardMaterial color="#FF1744" emissive="#FF1744" emissiveIntensity={0.6} />
      </mesh>
      {/* Lights */}
      <mesh position={[0.7, 0.56, 0]}>
        <boxGeometry args={[0.25, 0.1, 0.55]} />
        <meshStandardMaterial color="#FF1744" emissive="#FF1744" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      {/* Wheels */}
      {[[-0.7, -0.55, 0.6], [-0.7, -0.55, -0.6], [0.6, -0.55, 0.6], [0.6, -0.55, -0.6]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.15, 12]} />
          <meshStandardMaterial color="#212121" />
        </mesh>
      ))}
    </group>
  );
}

/* Road plane */
function Road() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
      <planeGeometry args={[10, 2.5]} />
      <meshStandardMaterial color="#1A237E" transparent opacity={0.4} />
    </mesh>
  );
}

export const AnimatedAmbulance3D: React.FC<{ width?: number; height?: number }> = ({
  width = 320,
  height = 180,
}) => {
  const progressRef = useRef(0);
  const [canRender, setCanRender] = useState(false);
  const timer = useMemo(() => new Timer(), []);

  useEffect(() => {
    const registered = threeCanvasRegistry.register();
    requestAnimationFrame(() => setCanRender(registered));
    return () => {
      if (registered) threeCanvasRegistry.unregister();
    };
  }, []);

  useFrame(() => {
    timer.update();
  });

  if (!canRender) {
    return (
      <div 
        className="ambulance-3d-container flex items-center justify-center bg-white/5 rounded-2xl animate-pulse w-(--amb-w) h-(--amb-h)" 
        style={{ '--amb-w': `${width}px`, '--amb-h': `${height}px` } as React.CSSProperties}
      >
        <div className="text-white/10 text-[10px] font-mono">MAP OVERLAY STANDBY</div>
      </div>
    );
  }

  return (
    <div 
      className="ambulance-3d-container w-(--amb-w) h-(--amb-h)" 
      style={{ '--amb-w': `${width}px`, '--amb-h': `${height}px` } as React.CSSProperties}
      aria-label="Animated ambulance approaching"
    >
      <Canvas
        camera={{ position: [0, 2.5, 5], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: false,
        }}
        frameloop="demand"
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1} />
        <pointLight position={[0, 3, 0]} color="#FF1744" intensity={0.6} />
        <Road />
        <AmbulanceModel progressRef={progressRef} timer={timer} />
      </Canvas>
    </div>
  );
};

