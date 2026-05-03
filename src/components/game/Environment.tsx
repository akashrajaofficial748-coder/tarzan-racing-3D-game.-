import { Sky, Stars, Cloud } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../hooks/useGameStore';

const Rain = () => {
  const points = useRef<THREE.Points>(null!);
  const weather = useGameStore((state) => state.weather);
  const count = 4000; // Increased particle count for better density
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = Math.random() * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (useGameStore.getState().isPaused) return;
    if (!points.current) return;
    
    // Dynamic rain parameters
    const speed = weather === 'rainy' ? 1.2 : weather === 'foggy' ? 0.3 : 0; 
    const wind = weather === 'rainy' ? 0.2 : 0.05;
    
    const pos = points.current.geometry.attributes.position.array as Float32Array;
    
    // Follow camera with slight offset
    points.current.position.z = state.camera.position.z;
    points.current.position.x = state.camera.position.x;
    
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= speed;
      pos[i * 3] -= wind; // Slight slant to the rain
      
      if (pos[i * 3 + 1] <= 0) {
        pos[i * 3 + 1] = 40;
        pos[i * 3] = (Math.random() - 0.5) * 80;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  const opacity = weather === 'rainy' ? 0.7 : weather === 'foggy' ? 0.15 : 0;
  const size = weather === 'rainy' ? 0.18 : 0.1;

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color={weather === 'rainy' ? "#88aaff" : "#ffffff"} 
        size={size} 
        transparent 
        opacity={opacity} 
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

const Fireflies = () => {
  const points = useRef<THREE.Points>(null!);
  const skyboxType = useGameStore((state) => state.skyboxType);
  const weather = useGameStore((state) => state.weather);
  const count = 400; // Increased count
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = Math.random() * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return pos;
  }, []);

  const initialPositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame((state) => {
    if (useGameStore.getState().isPaused) return;
    if (!points.current) return;
    
    const pos = points.current.geometry.attributes.position.array as Float32Array;
    points.current.position.z = state.camera.position.z;
    points.current.position.x = state.camera.position.x;

    const t = state.clock.elapsedTime;
    const activityLevel = weather === 'rainy' ? 0.2 : weather === 'foggy' ? 0.6 : 1.0;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Intricate movement
      pos[idx] = initialPositions[idx] + Math.sin(t * 0.5 + i) * 2 * activityLevel;
      pos[idx + 1] = initialPositions[idx + 1] + Math.cos(t * 0.8 + i * 0.5) * 1.5 * activityLevel;
      pos[idx + 2] = initialPositions[idx + 2] + Math.sin(t * 0.3 + i * 0.2) * 2 * activityLevel;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  const baseOpacity = skyboxType === 'night' ? 0.8 : skyboxType === 'sunset' ? 0.5 : 0.05;
  const opacity = weather === 'rainy' ? 0.05 : weather === 'foggy' ? baseOpacity * 1.5 : baseOpacity;
  const color = weather === 'foggy' ? "#88ffaa" : "#ccff33"; // Ghostly green in fog

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        color={color} 
        size={0.12} 
        transparent 
        opacity={opacity} 
        sizeAttenuation 
        depthWrite={false} 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
};

const FallingLeaves = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const skyboxType = useGameStore((state) => state.skyboxType);
  const weather = useGameStore((state) => state.weather);
  const count = 200; // Increased count
  const tempObject = new THREE.Object3D();
  
  const leafData = useMemo(() => Array.from({ length: count }).map(() => ({
    x: (Math.random() - 0.5) * 60,
    y: Math.random() * 30,
    z: (Math.random() - 0.5) * 60,
    rotX: Math.random() * Math.PI,
    rotY: Math.random() * Math.PI,
    rotZ: Math.random() * Math.PI,
    speed: 0.03 + Math.random() * 0.1,
    osc: Math.random() * 5,
    oscSpeed: 1 + Math.random() * 2,
  })), []);

  useFrame((state) => {
    if (!meshRef.current || useGameStore.getState().isPaused) return;
    
    meshRef.current.position.z = state.camera.position.z;
    meshRef.current.position.x = state.camera.position.x;

    const t = state.clock.elapsedTime;
    const isStormy = weather === 'rainy';

    leafData.forEach((leaf, i) => {
      // Weather influence
      const fallMultiplier = isStormy ? 2.5 : 1.0;
      const swayMultiplier = isStormy ? 4.0 : 1.0;

      leaf.y -= leaf.speed * fallMultiplier;
      leaf.x += Math.sin(t * leaf.oscSpeed + leaf.osc) * 0.015 * swayMultiplier;
      leaf.rotX += 0.02 * fallMultiplier;
      leaf.rotZ += 0.03 * fallMultiplier;

      if (leaf.y < 0) {
        leaf.y = 30;
        leaf.x = (Math.random() - 0.5) * 60;
        leaf.z = (Math.random() - 0.5) * 60;
      }

      tempObject.position.set(leaf.x, leaf.y, leaf.z);
      tempObject.rotation.set(leaf.rotX, leaf.rotY, leaf.rotZ);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const leafColor = skyboxType === 'night' ? '#122a12' : skyboxType === 'sunset' ? '#9a4a15' : '#3d6a2f';

  return (
    <instancedMesh ref={meshRef} args={[null!, null!, count]}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshStandardMaterial 
        color={leafColor} 
        side={THREE.DoubleSide} 
        transparent 
        opacity={0.5} 
        roughness={0.9}
        metalness={0.0}
      />
    </instancedMesh>
  );
};

export const Environment = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  const weather = useGameStore((state) => state.weather);
  const skyboxType = useGameStore((state) => state.skyboxType);
  const fogDensity = useGameStore((state) => state.fogDensity);
  const cycleSkybox = useGameStore((state) => state.cycleSkybox);
  const isPaused = useGameStore((state) => state.isPaused);
  const isGameOver = useGameStore((state) => state.isGameOver);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && !isGameOver) {
        cycleSkybox();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [cycleSkybox, isPaused, isGameOver]);

  const getFogConfig = () => {
    // Mapping fogDensity (0-1) to reasonable near/far values
    // 0 is clear, 1 is thickest
    const baseNear = 1;
    const maxFar = 250;
    const minFar = 10;
    
    // Non-linear mapping for better feel
    const far = maxFar - (fogDensity * (maxFar - minFar));
    const near = Math.min(baseNear, far * 0.5);

    if (weather === 'foggy') return { color: '#2c3e50', near, far: far * 0.15 }; // Extremely foggy
    if (weather === 'rainy') return { color: '#1a1a1a', near: near * 2, far: far * 0.4 };
    return { color: skyboxType === 'night' ? '#000000' : '#87ceeb', near: near * 5, far };
  };

  const getSkyConfig = () => {
    switch (skyboxType) {
      case 'sunset':
        return { sunPosition: [100, 2, 100] as [number, number, number], turbidity: 10, rayleigh: 3, inclination: 0.6, azimuth: 0.1 };
      case 'night':
        return { sunPosition: [100, -10, 100] as [number, number, number], turbidity: 0.1, rayleigh: 0.1, inclination: 0.8, azimuth: 0.1 };
      default: // day
        return { sunPosition: [100, 20, 100] as [number, number, number], turbidity: 0.5, rayleigh: 0.5, inclination: 0.5, azimuth: 0.25 };
    }
  };

  const getLightIntensity = () => {
    if (skyboxType === 'night') return 0.1;
    if (skyboxType === 'sunset') return 0.6;
    return weather === 'sunny' ? 1.5 : 0.5;
  };

  const skyConfig = getSkyConfig();
  const fogConfig = getFogConfig();
  const lightTargetRef = useRef<THREE.Object3D>(null!);

  useFrame((state) => {
    if (lightRef.current && lightTargetRef.current) {
      // Keep light following the camera on Z axis to maintain consistent shadows
      lightRef.current.position.set(
        state.camera.position.x + skyConfig.sunPosition[0],
        skyConfig.sunPosition[1],
        state.camera.position.z + skyConfig.sunPosition[2]
      );
      lightTargetRef.current.position.set(state.camera.position.x, 0, state.camera.position.z);
      lightRef.current.target = lightTargetRef.current;
    }
  });

  return (
    <>
      <ambientLight intensity={weather === 'sunny' ? 0.5 : 0.2} />
      <directionalLight
        ref={lightRef}
        intensity={getLightIntensity()}
        color={skyboxType === 'sunset' ? '#ff9d00' : weather === 'rainy' ? '#aec6cf' : '#ffffff'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      <primitive object={new THREE.Object3D()} ref={lightTargetRef} />
      {weather !== 'sunny' && <Rain />}
      <Fireflies />
      <FallingLeaves />
      
      <Sky {...skyConfig} />
      
      {skyboxType === 'night' && (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}

      {weather === 'foggy' && (
        <>
          <Cloud position={[-15, 5, -20]} speed={0.05} opacity={0.4} scale={2} />
          <Cloud position={[15, 4, -40]} speed={0.05} opacity={0.2} scale={1.5} />
        </>
      )}
      {weather === 'rainy' && (
        <>
           <Cloud position={[-20, 10, -20]} speed={0.4} opacity={0.6} bounds={[10, 2, 2]} />
           <Cloud position={[20, 12, -40]} speed={0.4} opacity={0.4} bounds={[10, 2, 2]} />
        </>
      )}
      
      <fog attach="fog" args={[fogConfig.color, fogConfig.near, fogConfig.far]} />
    </>
  );
};
