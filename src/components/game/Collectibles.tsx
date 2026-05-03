import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../hooks/useGameStore';
import { audioManager } from '../../services/audioService';

const EnergyCore = ({ position: initialPosition, id }: { position: [number, number, number], id: string }) => {
  const [collected, setCollected] = useState(false);
  const [lastCollectedTime, setLastCollectedTime] = useState(0);
  const updateChallenge = useGameStore((state) => state.updateChallenge);
  const playerZ = useGameStore((state) => state.playerZ);
  
  const [ref, api] = useBox(() => ({
    args: [1, 1, 1],
    position: initialPosition,
    isTrigger: true,
    onCollide: () => {
      if (!collected) {
        setCollected(true);
        setLastCollectedTime(Date.now());
        updateChallenge('collect', 1);
        audioManager.playFinish(); 
      }
    }
  }), useRef<THREE.Mesh>(null));

  useFrame((state) => {
    if (useGameStore.getState().isPaused) return;

    // Handle Respawn Logic
    if (collected) {
      const timeSinceCollected = Date.now() - lastCollectedTime;
      const isFarBehind = ref.current ? ref.current.position.z > playerZ + 20 : false;
      
      // Respawn after 10 seconds OR if it's way behind the player (repositioning ahead)
      if (timeSinceCollected > 10000 || isFarBehind) {
        setCollected(false);
        if (isFarBehind) {
          // Reposition ahead of player
          const newZ = playerZ - 200 - Math.random() * 300;
          const newX = [-4, 0, 4][Math.floor(Math.random() * 3)];
          api.position.set(newX, 1, newZ);
        }
      }
      return;
    }

    if (ref.current) {
      ref.current.rotation.y += 0.05;
      ref.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  if (collected) return null;

  return (
    <mesh ref={ref} castShadow>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial 
        color="#00ffff" 
        emissive="#00ffff" 
        emissiveIntensity={2} 
        transparent 
        opacity={0.8}
      />
      <pointLight color="#00ffff" intensity={1} distance={3} />
    </mesh>
  );
};

export const Collectibles = () => {
  const playerZ = useGameStore((state) => state.playerZ);
  
  // High performance generation of items ahead of player
  const items = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: `core-${i}`,
      position: [
        [-4, 0, 4][Math.floor(Math.random() * 3)],
        1,
        -50 - i * 40
      ] as [number, number, number]
    }));
  }, []);

  return (
    <group>
      {items.map((item) => (
        <EnergyCore key={item.id} id={item.id} position={item.position} />
      ))}
    </group>
  );
};
