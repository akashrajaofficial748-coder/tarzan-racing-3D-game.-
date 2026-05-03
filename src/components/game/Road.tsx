import { usePlane } from '@react-three/cannon';
import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../hooks/useGameStore';
import { audioManager } from '../../services/audioService';

const Puddle = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const pos = useMemo(() => [(Math.random() - 0.5) * 15, 0, -(Math.random() * 5000)], []);
  const initialScale = useMemo(() => Math.random() * 2 + 1, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = initialScale + Math.sin(state.clock.elapsedTime * 2 + offset) * 0.1;
      meshRef.current.scale.set(scale, scale, 1);
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.4 + Math.sin(state.clock.elapsedTime + offset) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={pos as [number, number, number]}>
      <circleGeometry args={[1, 16]} />
      <meshStandardMaterial 
        color="#080808" 
        transparent 
        opacity={0.5} 
        roughness={0} 
        metalness={1}
      />
    </mesh>
  );
};

const LeafParticle = ({ position, color }: { position: [number, number, number], color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [active, setActive] = useState(true);
  const velocity = useMemo(() => [
    (Math.random() - 0.5) * 0.2,
    -0.05 - Math.random() * 0.1,
    (Math.random() - 0.5) * 0.2
  ], []);

  useFrame((state, delta) => {
    if (!meshRef.current || !active) return;
    meshRef.current.position.x += velocity[0];
    meshRef.current.position.y += velocity[1];
    meshRef.current.position.z += velocity[2];
    meshRef.current.rotation.x += delta * 2;
    meshRef.current.rotation.z += delta * 2;
    meshRef.current.scale.multiplyScalar(0.98);
    
    if (meshRef.current.position.y < 0) setActive(false);
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Tree = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const playerZ = useGameStore((state) => state.playerZ);
  const playerX = useGameStore((state) => state.playerX);
  const stateRef = useRef({ rustled: false });
  const [particles, setParticles] = useState<{ id: number, pos: [number, number, number] }[]>([]);

  useFrame(() => {
    if (!meshRef.current) return;
    const distZ = Math.abs(meshRef.current.position.z - playerZ);
    const distX = Math.abs(meshRef.current.position.x - playerX);

    if (distZ < 2 && distX < 4 && !stateRef.current.rustled) {
      audioManager.playRustle();
      stateRef.current.rustled = true;
      
      // Spawn leaf particles
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        pos: [
          position[0] + (Math.random() - 0.5) * 2,
          position[1] + 4 + Math.random() * 2,
          position[2] + (Math.random() - 0.5) * 2
        ] as [number, number, number]
      }));
      setParticles(newParticles);

      // Brief shake animation
      meshRef.current.rotation.z = 0.1;
      setTimeout(() => { if (meshRef.current) meshRef.current.rotation.z = -0.1; }, 100);
      setTimeout(() => { if (meshRef.current) meshRef.current.rotation.z = 0; }, 200);
    }
    
    if (distZ > 12) {
      stateRef.current.rustled = false;
      if (particles.length > 0) setParticles([]);
    }
  });

  return (
    <group>
      <group ref={meshRef} position={position}>
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.4, 4, 8]} />
          <meshStandardMaterial color="#4d2926" />
        </mesh>
        <mesh position={[0, 5, 0]} castShadow>
          <coneGeometry args={[2, 4, 8]} />
          <meshStandardMaterial color="#2d5a27" />
        </mesh>
      </group>
      {particles.map(p => (
        <LeafParticle key={p.id} position={p.pos} color="#3d7a37" />
      ))}
    </group>
  );
};

export const Road = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }), meshRef);

  const weather = useGameStore((state) => state.weather);
  const isRainy = weather === 'rainy';

  // Procedural road texture
  const roadTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background - dark asphalt
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grain
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }

    // Tire marks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 20;
    const lanes = [0.25, 0.5, 0.75];
    lanes.forEach(p => {
      const laneX = canvas.width * p;
      // Left tire
      ctx.beginPath();
      ctx.setLineDash([20, 60]);
      ctx.moveTo(laneX - 45, 0);
      ctx.lineTo(laneX - 45, canvas.height);
      ctx.stroke();
      
      // Right tire
      ctx.beginPath();
      ctx.moveTo(laneX + 45, 0);
      ctx.lineTo(laneX + 45, canvas.height);
      ctx.stroke();
    });

    // Random Cracks
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) {
        x += (Math.random() - 0.5) * 60;
        y += (Math.random() - 0.5) * 60;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 400); 
    texture.anisotropy = 16;
    return texture;
  }, []);

  useFrame((state) => {
    if (meshRef.current && isRainy) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      // Animate wetness shimmering
      mat.roughness = 0.05 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      mat.metalness = 0.8 + Math.cos(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Slight texture offset to simulate rain flow/movement
      if (roadTexture) {
        roadTexture.offset.y -= 0.0001;
      }
    }
  });

  return (
    <group>
      <mesh ref={meshRef} receiveShadow>
        <planeGeometry args={[100, 10000]} />
        <meshStandardMaterial 
          map={roadTexture}
          color={isRainy ? "#222" : "#fff"}
          roughness={isRainy ? 0.05 : 0.8} 
          metalness={isRainy ? 0.4 : 0.0}
        />
      </mesh>
      
      {/* Wet Puddles Overlay with animation */}
      {isRainy && (
        <group position={[0, 0.015, 0]}>
          {[...Array(100)].map((_, i) => (
            <Puddle key={i} />
          ))}
        </group>
      )}
      
      {/* Grid helper for visual feedback */}
      <gridHelper args={[100, 1000, 0x444444, 0x222222]} rotation={[0, 0, 0]} position={[0, 0.01, 0]} />

      {/* Decorative Road lines */}
      <group position={[0, 0.02, 0]}>
         {[...Array(500)].map((_, i) => (
           <mesh key={i} position={[0, 0, -i * 10]}>
             <planeGeometry args={[0.2, 5]} />
             <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
           </mesh>
         ))}
      </group>

      {/* Neon Pillars along the road */}
      <group>
        {[...Array(20)].map((_, i) => (
          <group key={i} position={[0, 0, -i * 25]}>
            <mesh position={[-8, 4, 0]}>
              <boxGeometry args={[0.5, 8, 0.5]} />
              <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[8, 4, 0]}>
              <boxGeometry args={[0.5, 8, 0.5]} />
              <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Jungle Trees along the road */}
      <group>
        {[...Array(100)].map((_, i) => (
          <Tree key={i} position={[(i % 2 === 0 ? -12 - Math.random() * 5 : 12 + Math.random() * 5), 0, -i * 20]} />
        ))}
      </group>
    </group>
  );
};
