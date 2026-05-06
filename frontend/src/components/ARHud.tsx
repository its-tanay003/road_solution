import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  incidentLat: number;
  incidentLng: number;
  userLat: number;
  userLng: number;
  etaSeconds: number;
  goldenHourRemaining: number;
}

export function ARHud({ incidentLat, incidentLng, userLat, userLng, etaSeconds, goldenHourRemaining }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080a10);
    scene.fog = new THREE.FogExp2(0x080a10, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    if (container && renderer.domElement) {
      container.appendChild(renderer.domElement);
    }

    // Grid floor
    const grid = new THREE.GridHelper(80, 40, 0x1a2236, 0x111827);
    scene.add(grid);

    // Compute distance and scale
    const distM = Math.sqrt(
      Math.pow((incidentLat - userLat) * 111000, 2) +
      Math.pow((incidentLng - userLng) * 111000 * Math.cos(userLat * Math.PI / 180), 2)
    );
    const mapScale = Math.min(distM / 80, 18);

    // User marker — blue sphere
    const userGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const userMat = new THREE.MeshPhongMaterial({ color: 0x0a84ff, emissive: 0x0a84ff, emissiveIntensity: 0.3 });
    const userMesh = new THREE.Mesh(userGeo, userMat);
    userMesh.position.set(-mapScale, 0.7, mapScale);
    scene.add(userMesh);

    // Incident marker — red pulsing wireframe sphere
    const incGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const incMat = new THREE.MeshBasicMaterial({ color: 0xff3b3b, wireframe: true });
    const incMesh = new THREE.Mesh(incGeo, incMat);
    incMesh.position.set(0, 1.2, 0);
    scene.add(incMesh);

    // Solid inner sphere for incident
    const incInner = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 12, 12),
      new THREE.MeshPhongMaterial({ color: 0xff3b3b, emissive: 0xff3b3b, emissiveIntensity: 0.5 })
    );
    incInner.position.copy(incMesh.position);
    scene.add(incInner);

    // Route line from user to incident
    const routePoints = [userMesh.position.clone(), incMesh.position.clone()];
    const routeGeo = new THREE.BufferGeometry().setFromPoints(routePoints);
    const routeLine = new THREE.Line(routeGeo, new THREE.LineBasicMaterial({ color: 0x32d74b, linewidth: 2 }));
    scene.add(routeLine);

    // Ambulance marker moving along route
    const ambGeo = new THREE.BoxGeometry(1.2, 0.6, 2);
    const ambMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const ambMesh = new THREE.Mesh(ambGeo, ambMat);
    scene.add(ambMesh);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Point light at incident — red glow
    const redLight = new THREE.PointLight(0xff3b3b, 2, 15);
    redLight.position.copy(incMesh.position);
    scene.add(redLight);

    // Animation
    let animId: number;
    let ambProgress = 0;
    const totalEta = etaSeconds;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;

      // Incident pulse
      incMesh.rotation.y += 0.008;
      const pulse = 1 + Math.sin(t * 2) * 0.15;
      incMesh.scale.setScalar(pulse);
      redLight.intensity = 1.5 + Math.sin(t * 3) * 0.8;

      // Ambulance moves toward incident
      ambProgress = Math.min(ambProgress + (1 / (totalEta * 60)), 0.95);
      ambMesh.position.lerpVectors(userMesh.position, incMesh.position, ambProgress);
      ambMesh.position.y = 0.4;

      // Slow camera orbit
      camera.position.x = Math.sin(t * 0.05) * 30;
      camera.position.z = Math.cos(t * 0.05) * 30;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // CRITICAL CLEANUP — prevents WebGL context accumulation
    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };

    return () => cleanupRef.current?.();
  }, [incidentLat, incidentLng, userLat, userLng, etaSeconds]);

  const etaMin = Math.floor(etaSeconds / 60);
  const etaSec = etaSeconds % 60;
  const ghMin = Math.floor(goldenHourRemaining / 60);

  return (
    <div className="w-full h-[440px] rounded-2xl overflow-hidden relative bg-[#080a10]">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 font-mono text-xs leading-[1.8] pointer-events-none">
        <div className="text-[#32D74B]">ETA AMBULANCE: {etaMin}m {etaSec}s</div>
        <div className="text-[#FF9F0A]">GOLDEN HOUR: {ghMin}m remaining</div>
        <div className="text-[#FF3B3B]">INCIDENT: ACTIVE</div>
        <div className="text-[#5AC8FA]">DIST: {(Math.sqrt(Math.pow((incidentLat-userLat)*111,2)+Math.pow((incidentLng-userLng)*111,2))).toFixed(1)} km</div>
      </div>
      <div className="absolute top-4 right-4 text-xs text-white/30 font-mono">
        ROADSoS AR NAV v2.0
      </div>
    </div>
  );
}
