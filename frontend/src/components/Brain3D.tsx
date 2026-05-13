import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

type AIState = 'idle' | 'processing' | 'done';

const STATE_COLORS: Record<AIState, string> = {
  idle:       '#2979FF',
  processing: '#FF8F00',
  done:       '#00C853',
};

function BrainMesh({ aiState }: { aiState: AIState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<THREE.MeshStandardMaterial>(null);
  const targetScale = useRef(1);
  const currentScale = useRef(1);

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;

    // Pulsing scale when processing
    if (aiState === 'processing') {
      targetScale.current = 1 + 0.12 * Math.sin(clock.elapsedTime * 4);
    } else {
      targetScale.current = 1 + 0.03 * Math.sin(clock.elapsedTime * 1.5);
    }
    currentScale.current += (targetScale.current - currentScale.current) * 0.1;
    meshRef.current.scale.setScalar(currentScale.current);

    // Slow rotation
    meshRef.current.rotation.y += 0.008;
    meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.2;

    // Color lerp
    const target = new THREE.Color(STATE_COLORS[aiState]);
    matRef.current.color.lerp(target, 0.05);
    matRef.current.emissive.lerp(target, 0.05);
  });

  return (
    <Icosahedron ref={meshRef} args={[1, 1]}>
      <meshStandardMaterial
        ref={matRef}
        color={STATE_COLORS[aiState]}
        emissive={STATE_COLORS[aiState]}
        emissiveIntensity={0.4}
        wireframe
        transparent
        opacity={0.85}
      />
    </Icosahedron>
  );
}

interface Brain3DProps {
  aiState?: AIState;
  size?: number;
}

export const Brain3D: React.FC<Brain3DProps> = ({ aiState = 'idle', size = 80 }) => (
  <div
    style={{ width: size, height: size }}
    role="img"
    aria-label={`AI brain — ${aiState}`}
  >
    <Canvas
      camera={{ position: [0, 0, 3], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[2, 2, 2]} intensity={1.5} color={STATE_COLORS[aiState]} />
      <BrainMesh aiState={aiState} />
    </Canvas>
  </div>
);
