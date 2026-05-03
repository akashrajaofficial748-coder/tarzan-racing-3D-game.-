import { useBox } from '@react-three/cannon';
import { useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../hooks/useGameStore';
import { audioManager } from '../../services/audioService';

export const SuccessCenter = ({ position }: { position: [number, number, number] }) => {
  const setGameOver = useGameStore((state) => state.setGameOver);
  const isGameOver = useGameStore((state) => state.isGameOver);
  
  const [ref] = useBox(() => ({
    args: [10, 5, 2],
    position,
    isTrigger: true,
    onCollide: (e) => {
      if (!isGameOver) {
        audioManager.playFinish();
        setGameOver(true);
      }
    }
  }), useRef<THREE.Mesh>(null));

  return (
    <group position={position}>
      <mesh ref={ref}>
        <boxGeometry args={[10, 5, 2]} />
        <meshStandardMaterial color="#00ff88" transparent opacity={0.3} />
      </mesh>
      {/* Visual finish line */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[12, 10, 0.5]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, 5, 0]} intensity={5} color="#00ff88" />
    </group>
  );
};
