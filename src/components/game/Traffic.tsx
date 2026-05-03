import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../hooks/useGameStore';

const CAR_TYPES = {
  compact: { args: [1.4, 0.6, 2.5] as [number, number, number], mass: 800 },
  sedan: { args: [1.6, 0.8, 3.2] as [number, number, number], mass: 1200 },
  suv: { args: [1.8, 1.0, 3.5] as [number, number, number], mass: 1800 },
  truck: { args: [2.0, 1.5, 6.0] as [number, number, number], mass: 3500 },
};

type CarType = keyof typeof CAR_TYPES;

const TrafficCar = ({ initialPosition, color, type }: { initialPosition: [number, number, number], color: string, type: CarType }) => {
  const config = CAR_TYPES[type];
  const [ref, api] = useBox(() => ({
    args: config.args,
    position: initialPosition,
    mass: config.mass,
  }), useRef<THREE.Mesh>(null));

  const weather = useGameStore((state) => state.weather);
  const playerZ = useGameStore((state) => state.playerZ);
  const playerX = useGameStore((state) => state.playerX);
  const recordNearMiss = useGameStore((state) => state.recordNearMiss);
  const targetLane = useRef(initialPosition[0]);
  const baseSpeed = useRef(25 + Math.random() * 20); 
  const currentSpeed = useRef(baseSpeed.current);
  const stateRef = useRef({ laneSwitching: false, lastLaneChange: 0, hasNearMissOccurred: false });

  useFrame((state) => {
    if (useGameStore.getState().isPaused) {
      api.velocity.set(0, 0, 0);
      return;
    }
    if (!ref.current) return;

    const pos = ref.current.position;
    
    // Near Miss Detection
    const distToPlayerZ = pos.z - playerZ;
    const distToPlayerX = Math.abs(pos.x - playerX);
    
    // If very close side-to-side and passing by, trigger near miss
    if (Math.abs(distToPlayerZ) < 2 && distToPlayerX < 2.5 && distToPlayerX > 1.5 && !stateRef.current.hasNearMissOccurred) {
        recordNearMiss();
        stateRef.current.hasNearMissOccurred = true;
    }
    
    // Reset near miss state when far away
    if (Math.abs(distToPlayerZ) > 10) {
        stateRef.current.hasNearMissOccurred = false;
    }

    // 1. Weather Adjustment
    let weatherPenalty = 1.0;
    if (weather === 'rainy') weatherPenalty = 0.75;
    if (weather === 'foggy') weatherPenalty = 0.6;

    // 2. Obstacle Detection (Player Awareness)
    // Distance check to player
    const isPlayerInFront = distToPlayerZ > 0 && distToPlayerZ < 15;
    const isPlayerBehind = distToPlayerZ > -40 && distToPlayerZ < 0;

    // Adjust speed if player is in front (brake harder for challenge)
    if (isPlayerInFront && Math.abs(pos.x - state.camera.position.x) < 3) {
       currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 10, 0.15);
    } else {
       currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, baseSpeed.current, 0.05);
    }

    // 3. Reactive Lane Changing (Avoid player from behind - make it swerve)
    const now = state.clock.getElapsedTime();
    if (isPlayerBehind && Math.abs(pos.x - state.camera.position.x) < 3.5 && now - stateRef.current.lastLaneChange > 2) {
        stateRef.current.laneSwitching = true;
        stateRef.current.lastLaneChange = now;
        // Shift to a different lane
        const lanes = [-4, 0, 4];
        const possibleLanes = lanes.filter(l => l !== targetLane.current);
        targetLane.current = possibleLanes[Math.floor(Math.random() * possibleLanes.length)];
    }

    // 4. Basic Motion
    const speed = currentSpeed.current * weatherPenalty;
    const currentX = pos.x;
    
    if (Math.abs(currentX - targetLane.current) > 0.1) {
       const steerDir = currentX < targetLane.current ? 1 : -1;
       api.velocity.set(steerDir * 6, 0, -speed); // Note: Z direction is negative (forward into screen)
    } else {
       api.velocity.set(0, 0, -speed);
    }

    // 5. Respawn Logic
    // If the car is far behind the player, teleport it way ahead
    if (pos.z > playerZ + 50) {
       const lanes = [-4, 0, 4];
       const nextLane = lanes[Math.floor(Math.random() * lanes.length)];
       targetLane.current = nextLane;
       api.position.set(nextLane, 1, playerZ - 300 - Math.random() * 200);
       api.velocity.set(0, 0, -baseSpeed.current);
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={config.args} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.1} />
      {/* Front Lights - Glowing with intensity */}
      <mesh position={[config.args[0] * 0.35, 0, -(config.args[2] / 2 + 0.05)]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-config.args[0] * 0.35, 0, -(config.args[2] / 2 + 0.05)]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
      </mesh>
    </mesh>
  );
};

export const Traffic = () => {
  const cars = useMemo(() => {
    const carTypes: CarType[] = ['compact', 'sedan', 'suv', 'truck'];
    const colorPalette = [
      "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", // Neon Brights
      "#ffffff", "#111111", "#888888",                     // Monochrome
      "#e67e22", "#f1c40f", "#1abc9c", "#9b59b6",         // Artistic
      "#2ecc71", "#34495e", "#7f8c8d", "#d35400"          // Industrial
    ];

    return Array.from({ length: 25 }).map((_, i) => ({
      position: [
        [-4, 0, 4][Math.floor(Math.random() * 3)],
        1,
        -150 - i * 40
      ] as [number, number, number],
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      type: carTypes[Math.floor(Math.random() * carTypes.length)]
    }));
  }, []);

  return (
    <group>
      {cars.map((car, i) => (
        <TrafficCar key={i} initialPosition={car.position} color={car.color} type={car.type} />
      ))}
    </group>
  );
};
