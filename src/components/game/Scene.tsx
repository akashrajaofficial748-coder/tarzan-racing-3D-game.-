import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Suspense, useRef, useEffect } from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Car } from './Car';
import { Road } from './Road';
import { Environment } from './Environment';
import { Traffic } from './Traffic';
import { SuccessCenter } from './SuccessCenter';
import { Collectibles } from './Collectibles';
import { useGameStore } from '../../hooks/useGameStore';
import * as THREE from 'three';


const CameraRig = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  
  useFrame((state) => {
    // We want the camera to follow the car's position
    // For simplicity in this demo, we'll keep it relatively fixed or following a target
    // In a real car game, we'd find the car mesh and lerp the camera position
  });

  return (
    <PerspectiveCamera
      makeDefault
      position={[0, 4, 8]}
      fov={50}
    />
  );
};

const GameLoop = () => {
  const updateTime = useGameStore((state) => state.updateTime);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const isPaused = useGameStore((state) => state.isPaused);
  const togglePause = useGameStore((state) => state.togglePause);

  useFrame((state, delta) => {
    if (!isGameOver && !isPaused) {
      updateTime(delta);
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  return null;
};

export const Scene = () => {
  const setWeather = useGameStore((state) => state.setWeather);

  useEffect(() => {
    const cycle = ['sunny', 'rainy', 'foggy'] as const;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % cycle.length;
      setWeather(cycle[i]);
    }, 15000);
    return () => clearInterval(interval);
  }, [setWeather]);

  return (
    <div className="w-full h-full bg-[#111]">
      <Canvas shadows>
        <GameLoop />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Environment />
            <Road />
            <Car />
            <Traffic />
            <Collectibles />
            <SuccessCenter position={[0, 2, -2000]} />
          </Physics>
          
          <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={50} />
        </Suspense>
      </Canvas>
    </div>
  );
};
