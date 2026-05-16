import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Timer } from 'three';
import { threeCanvasRegistry } from '../utils/threeCanvasRegistry';

/* Incident dot markers — lat/lon → 3D position on unit sphere */
const INCIDENTS = [
  { lat: 28.6, lon: 77.2 },   // Delhi
  { lat: 19.0, lon: 72.8 },   // Mumbai
  { lat: 12.9, lon: 77.5 },   // Bangalore
  { lat: 22.5, lon: 88.3 },   // Kolkata
  { lat: 17.3, lon: 78.5 },   // Hyderabad
  { lat: 13.0, lon: 80.2 },   // Chennai
  { lat: 23.0, lon: 72.6 },   // Ahmedabad
  { lat: 26.9, lon: 75.7 },   // Jaipur
  { lat: 21.1, lon: 79.0 },   // Nagpur
  { lat: 30.9, lon: 75.8 },   // Ludhiana
];

function latLonToVec3(lat: number, lon: number, r = 1.05) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

function IncidentDot({ lat, lon, timer }: { lat: number; lon: number; timer: Timer }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      const elapsed = timer.getElapsed();
      meshRef.current.scale.setScalar(1 + 0.3 * Math.sin(elapsed * 2.5 + lat));
    }
  });
  const pos = latLonToVec3(lat, lon);
  return (
    <mesh ref={meshRef} position={pos}>
      <sphereGeometry args={[0.022, 8, 8]} />
      <meshStandardMaterial color="#FF1744" emissive="#FF1744" emissiveIntensity={1.2} />
    </mesh>
  );
}

function IndiaGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  const timer = useMemo(() => new Timer(), []);

  useFrame(() => {
    timer.update();
    const delta = timer.getDelta();
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.18;
  });

  return (
    <group ref={groupRef}>
      {/* Ocean base */}
      <Sphere args={[1, 48, 48]}>
        <meshStandardMaterial
          color="#0A1628"
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.95}
        />
      </Sphere>
      {/* Atmosphere glow */}
      <Sphere args={[1.06, 48, 48]}>
        <meshStandardMaterial
          color="#1565C0"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </Sphere>
      {/* Grid lines */}
      <lineSegments>
        <edgesGeometry args={[new THREE.SphereGeometry(1.001, 24, 12)]} />
        <lineBasicMaterial color="#2979FF" transparent opacity={0.12} />
      </lineSegments>
      {/* Incident markers */}
      {INCIDENTS.map((inc, i) => (
        <IncidentDot key={i} lat={inc.lat} lon={inc.lon} timer={timer} />
      ))}
    </group>
  );
}

interface Globe3DProps {
  size?: number;   // px
  className?: string;
}

export const Globe3D: React.FC<Globe3DProps> = ({ size = 200, className = '' }) => {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const registered = threeCanvasRegistry.register();
    requestAnimationFrame(() => setCanRender(registered));
    return () => {
      if (registered) threeCanvasRegistry.unregister();
    };
  }, []);

  if (!canRender) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-white/5 rounded-full animate-pulse w-[--globe-size] h-[--globe-size]`}
        style={{ '--globe-size': `${size}px` } as React.CSSProperties}
      >
        <div className="w-1/2 h-1/2 bg-white/10 rounded-full" />
      </div>
    );
  }

  return (
    <div
      className={`${className} relative w-(--globe-size) h-(--globe-size) perspective-[1000px]`}
      style={{ '--globe-size': `${size}px` } as React.CSSProperties}
      role="img"
      aria-label="Rotating India globe with incident markers"
    >
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: false,
        }}
        frameloop="demand"
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 3, 3]} intensity={0.8} color="#FFFFFF" />
        <directionalLight position={[-2, -1, -2]} intensity={0.15} color="#2979FF" />
        <IndiaGlobe />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          enableRotate
        />
      </Canvas>
    </div>
  );
};

