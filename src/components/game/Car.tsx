import { useBox, useRaycastVehicle, WheelInfoOptions } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../hooks/useGameStore';
import { audioManager } from '../../services/audioService';

const SplashParticle = ({ delay = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (useGameStore.getState().isPaused) return;
    if (!meshRef.current) return;
    const t = (state.clock.elapsedTime * 2 + delay) % 1;
    meshRef.current.position.y = t * 1.5;
    meshRef.current.position.x = (Math.random() - 0.5) * 2;
    meshRef.current.position.z = (Math.random() - 0.5) * 2;
    meshRef.current.scale.setScalar(0.5 * (1 - t));
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - t);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.3, 6, 6]} />
      <meshBasicMaterial color="#88aaff" transparent opacity={0.6} />
    </mesh>
  );
};

const BoostParticle = ({ delay = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (useGameStore.getState().isPaused) return;
    if (!meshRef.current) return;
    const t = (state.clock.elapsedTime * 2 + delay) % 1;
    meshRef.current.position.z = t * 2; // Moving backwards from exhaust
    meshRef.current.position.x = (Math.random() - 0.5) * 0.2;
    meshRef.current.position.y = (Math.random() - 0.5) * 0.2;
    meshRef.current.scale.setScalar(0.2 * (1 - t));
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - t;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.2, 6, 6]} />
      <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
    </mesh>
  );
};

const HeadlightBeam = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Volumetric Beam Simulation */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2.5]}>
        <cylinderGeometry args={[0.01, 2.5, 8, 32, 1, true]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.1} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Glow Sprite Effect */}
      <mesh>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.3} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

const SmokeParticle = ({ delay = 0 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (useGameStore.getState().isPaused) return;
    if (!meshRef.current) return;
    const t = (state.clock.elapsedTime + delay) % 2;
    meshRef.current.position.y = t * 2;
    meshRef.current.position.x = Math.sin(t * 5) * 0.2;
    meshRef.current.scale.setScalar(0.5 + t);
    (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.6 * (1 - t / 2);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshStandardMaterial color="#666" transparent opacity={0.6} />
    </mesh>
  );
};

const CarModel = () => {
  const personalization = useGameStore((state) => state.carCustomization);
  const health = useGameStore((state) => state.health);
  const headlights = useGameStore((state) => state.headlights);
  const boost = useGameStore((state) => state.boost);
  const weather = useGameStore((state) => state.weather);
  const speed = useGameStore((state) => state.speed);
  const decalTexture = useMemo(() => {
    if (personalization.decalPattern === 'none') return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (personalization.decalPattern === 'stripes') {
      ctx.fillStyle = 'white';
      ctx.fillRect(canvas.width * 0.25, 0, 40, canvas.height);
      ctx.fillRect(canvas.width * 0.75, 0, 40, canvas.height);
    } else if (personalization.decalPattern === 'circuit') {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 4;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        ctx.moveTo(x, y);
        for (let j = 0; j < 4; j++) {
          if (Math.random() > 0.5) x += (Math.random() > 0.5 ? 50 : -50);
          else y += (Math.random() > 0.5 ? 50 : -50);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(x - 5, y - 5, 10, 10);
      }
    } else if (personalization.decalPattern === 'tribal') {
      ctx.strokeStyle = personalization.neonColor;
      ctx.lineWidth = 8;
      ctx.setLineDash([20, 10]);
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, Math.random() * canvas.height, 40 + i * 20, 0, Math.PI, i % 2 === 0);
        ctx.stroke();
      }
    } else if (personalization.decalPattern === 'flames') {
      ctx.fillStyle = '#ff3300';
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * canvas.width;
        const h = 200 + Math.random() * 300;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.quadraticCurveTo(x - 50, canvas.height - h / 2, x, canvas.height - h);
        ctx.quadraticCurveTo(x + 50, canvas.height - h / 2, x, canvas.height);
        ctx.fill();
      }
    } else if (personalization.decalPattern === 'carbon') {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      for (let y = 0; y < canvas.height; y += 10) {
        for (let x = 0; x < canvas.width; x += 10) {
          if ((x + y) % 20 === 0) ctx.fillRect(x, y, 5, 5);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, [personalization.decalPattern, personalization.neonColor]);

  const bodyMaterialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const neonMaterialRef = useRef<THREE.MeshBasicMaterial>(null!);
  const exhaustRef = useRef<THREE.PointLight>(null!);

  const isDented = health < 70;
  const isSmoking = health < 40;
  const isSplashing = weather === 'rainy' && Math.abs(speed) > 30;

  useFrame((state) => {
    if (useGameStore.getState().isPaused) return;
    const t = state.clock.elapsedTime;
    
    // Trigger splash sound periodically when splashing
    if (isSplashing && Math.floor(t * 10) % 5 === 0) {
      audioManager.playSplash();
    }
    if (bodyMaterialRef.current) {
      bodyMaterialRef.current.emissiveIntensity = 0.1 + Math.sin(t * 2) * 0.05;
    }

    // Pulse the neon accents
    if (neonMaterialRef.current) {
      neonMaterialRef.current.opacity = 0.7 + Math.sin(t * 4) * 0.3;
    }

    // Boost effect
    if (exhaustRef.current) {
      exhaustRef.current.intensity = boost.isBoosting ? 15 + Math.sin(t * 30) * 8 : 0;
      exhaustRef.current.distance = boost.isBoosting ? 5 : 0;
    }
  });

  return (
    <group>
      {/* Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.5, 3]} />
        <meshStandardMaterial 
          ref={bodyMaterialRef}
          map={decalTexture}
          color={personalization.color} 
          metalness={0.9} 
          roughness={0.1}
          emissive={personalization.color}
          emissiveIntensity={0.1}
          transparent={!!decalTexture}
        />
      </mesh>

      {/* Boost Exhaust Glow */}
      <pointLight 
        ref={exhaustRef}
        position={[0, -0.1, 1.6]}
        color="#00ffff"
        intensity={0}
        distance={3}
      />
      {boost.isBoosting && (
        <group position={[0, -0.1, 1.6]}>
          {/* Main Flame */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.2, 1.2, 12, 1, true]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.2, 1, 1.2]}>
            <cylinderGeometry args={[0.05, 0.15, 0.8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
          
          {/* Nitro Particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <BoostParticle key={i} delay={i * 0.125} />
          ))}

          {/* Heat Distortion Pulse */}
          <mesh scale={[2, 2, 2]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.1} wireframe />
          </mesh>
        </group>
      )}

      {/* Headlights Implementation */}
      <group position={[0, 0, -1.5]}>
        {/* Left Headlight */}
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[0.4, 0.2, 0.1]} />
          <meshStandardMaterial 
            color={headlights ? "#fff" : "#1a1a1a"} 
            emissive={headlights ? "#00ffff" : "#000"} 
            emissiveIntensity={headlights ? 10 : 0} 
            metalness={1}
            roughness={0}
          />
          {headlights && (
            <>
              <spotLight 
                position={[0, 0, -0.1]} 
                angle={0.5} 
                penumbra={0.3} 
                intensity={40} 
                distance={40} 
                castShadow
                color="#e0ffff"
              />
              <HeadlightBeam position={[0, 0, -0.2]} />
            </>
          )}
        </mesh>
        {/* Right Headlight */}
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[0.4, 0.2, 0.1]} />
          <meshStandardMaterial 
            color={headlights ? "#fff" : "#1a1a1a"} 
            emissive={headlights ? "#00ffff" : "#000"} 
            emissiveIntensity={headlights ? 10 : 0} 
            metalness={1}
            roughness={0}
          />
          {headlights && (
            <>
              <spotLight 
                position={[0, 0, -0.1]} 
                angle={0.5} 
                penumbra={0.3} 
                intensity={40} 
                distance={40} 
                castShadow
                color="#e0ffff"
              />
              <HeadlightBeam position={[0, 0, -0.2]} />
            </>
          )}
        </mesh>
      </group>

      {/* Energy Flow / Scanning Sheen Overlay */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.51, 0.51, 3.01]} />
        <meshStandardMaterial 
          transparent 
          opacity={0.1} 
          metalness={1} 
          roughness={0} 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Water Splashes */}
      {isSplashing && (
        <group position={[0, -0.4, 0]}>
           {Array.from({ length: 6 }).map((_, i) => (
             <SplashParticle key={i} delay={i * 0.15} />
           ))}
        </group>
      )}
      
      {/* Visual Damage: Scratches and Dents */}
      {isDented && (
        <group>
          {/* Dent mesh - small offset cubes to simulate deformation */}
          <mesh position={[0.7, 0.1, 1]} castShadow>
            <boxGeometry args={[0.2, 0.2, 0.4]} />
            <meshStandardMaterial color="#333" roughness={1} />
          </mesh>
          <mesh position={[-0.7, 0.1, -0.5]} castShadow>
            <boxGeometry args={[0.1, 0.3, 0.5]} />
            <meshStandardMaterial color="#333" roughness={1} />
          </mesh>
          <mesh position={[0, 0.2, 1.4]} castShadow>
            <boxGeometry args={[0.8, 0.1, 0.2]} />
            <meshStandardMaterial color="#222" roughness={1} />
          </mesh>
        </group>
      )}

      {/* Smoke Effect */}
      {isSmoking && (
        <group position={[0, 0.5, 1.2]}>
           {/* Simple smoke cloud particles */}
           {Array.from({ length: 5 }).map((_, i) => (
             <SmokeParticle key={i} delay={i * 0.2} />
           ))}
        </group>
      )}
      
      {/* Top cabin */}
      <mesh position={[0, 0.4, -0.2]} castShadow>
        <boxGeometry args={[1.2, 0.4, 1.5]} />
        <meshStandardMaterial color="#444" transparent opacity={0.6} />
      </mesh>
      {/* Neon Accents */}
      <mesh position={[0, -0.2, 1.51]}>
        <planeGeometry args={[1.4, 0.1]} />
        <meshBasicMaterial ref={neonMaterialRef} color={personalization.neonColor} transparent />
      </mesh>
      <mesh position={[0, -0.2, -1.51]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.4, 0.1]} />
        <meshBasicMaterial ref={neonMaterialRef} color={personalization.neonColor} transparent />
      </mesh>
      
      {/* Underglow */}
      <pointLight 
        position={[0, -0.3, 0]} 
        color={personalization.neonColor} 
        intensity={2} 
        distance={3} 
      />
    </group>
  );
};

const Wheel = ({ radius = 0.4, ...props }) => {
  return (
    <group {...props}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[radius, radius, 0.4, 16]} />
        <meshStandardMaterial color="#111" metalness={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

export const Car = ({ position = [0, 2, 0] }) => {
  const weather = useGameStore((state) => state.weather);
  const speed = useGameStore((state) => state.speed);
  const setSpeed = useGameStore((state) => state.setSpeed);
  const addDistance = useGameStore((state) => state.addDistance);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const boost = useGameStore((state) => state.boost);
  const setBoosting = useGameStore((state) => state.setBoosting);
  const updateBoost = useGameStore((state) => state.updateBoost);

  const chassisBody = useRef<THREE.Group>(null!);
  const [chassis, api] = useBox(() => ({
    args: [1.5, 0.5, 3],
    mass: 500,
    position: position as [number, number, number],
    onCollide: (e) => {
      const impact = e.contact.impactVelocity;
      if (impact > 5) {
        audioManager.playCollision();
        // Dynamic damage based on speed
        const damage = Math.floor(impact * 2);
        const sensitivity = useGameStore.getState().shakeSensitivity;
        useGameStore.getState().takeDamage(damage);
        useGameStore.getState().setShake(impact * 0.15 * sensitivity); // Trigger screen shake with sensitivity
      }
    }
  }), useRef<THREE.Group>(null));

  const wheelInfo: WheelInfoOptions = {
    radius: 0.4,
    directionLocal: [0, -1, 0] as [number, number, number],
    suspensionStiffness: 40,
    suspensionRestLength: 0.35,
    maxSuspensionForce: 100000,
    maxSuspensionTravel: 0.3,
    dampingRelaxation: 2.8,
    dampingCompression: 4.8,
    axleLocal: [-1, 0, 0] as [number, number, number],
    chassisConnectionPointLocal: [1, 0, 1] as [number, number, number],
    rollInfluence: 0.01,
    frictionSlip: weather === 'rainy' ? 1.5 : 2.5,
    sideAcceleration: 4,
  };

  const wheels = [
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
  ];

  const [vehicle, vehicleApi] = useRaycastVehicle(() => ({
    chassisBody: chassis,
    wheels,
    wheelInfos: [
      { ...wheelInfo, chassisConnectionPointLocal: [-0.8, -0.2, 1.2], isFrontWheel: true },
      { ...wheelInfo, chassisConnectionPointLocal: [0.8, -0.2, 1.2], isFrontWheel: true },
      { ...wheelInfo, chassisConnectionPointLocal: [-0.8, -0.2, -1.2], isFrontWheel: false },
      { ...wheelInfo, chassisConnectionPointLocal: [0.8, -0.2, -1.2], isFrontWheel: false },
    ],
  }), useRef<THREE.Group>(null));

  const controls = useRef({ forward: false, backward: false, left: false, right: false, brake: false, boost: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': controls.current.forward = true; break;
        case 's': case 'arrowdown': controls.current.backward = true; break;
        case 'a': case 'arrowleft': controls.current.left = true; break;
        case 'd': case 'arrowright': controls.current.right = true; break;
        case ' ': controls.current.brake = true; break;
        case 'shift': controls.current.boost = true; break;
        case 'l': useGameStore.getState().toggleHeadlights(); break;
        case 't': useGameStore.getState().cycleSkybox(); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': controls.current.forward = false; break;
        case 's': case 'arrowdown': controls.current.backward = false; break;
        case 'a': case 'arrowleft': controls.current.left = false; break;
        case 'd': case 'arrowright': controls.current.right = false; break;
        case ' ': controls.current.brake = false; break;
        case 'shift': controls.current.boost = false; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOver]);

  useFrame((state, delta) => {
    const isPaused = useGameStore.getState().isPaused;
    audioManager.pauseSounds(isPaused);
    if (isPaused) return;
    
    const { forward, backward, left, right, brake, boost: boostKey } = controls.current;
    
    // Update boost logic
    setBoosting(boostKey && forward);
    updateBoost(delta);

    // Dynamic physics based on weather
    const traction = weather === 'rainy' ? 0.7 : weather === 'foggy' ? 0.9 : 1.0;
    const boostMultiplier = boost.isBoosting ? 2.5 : 1.0;
    
    // Engine force curve: less force at higher speeds (simplified air resistance simulation)
    const effectiveSpeed = Math.abs(speed);
    const speedFactor = Math.max(0.2, 1 - (effectiveSpeed / 250));
    const engineForce = 3500 * traction * boostMultiplier * speedFactor;
    
    // Steering falloff at high speed
    const steeringSensitivity = 0.4 * (weather === 'rainy' ? 1.15 : 1.0);
    const steerValue = steeringSensitivity * Math.max(0.2, 1 - (effectiveSpeed / 300));
    const brakeForce = 250 * traction;

    vehicleApi.applyEngineForce(forward ? engineForce : backward ? -engineForce * 0.5 : 0, 2);
    vehicleApi.applyEngineForce(forward ? engineForce : backward ? -engineForce * 0.5 : 0, 3);
    
    vehicleApi.setSteeringValue(left ? steerValue : right ? -steerValue : 0, 0);
    vehicleApi.setSteeringValue(left ? steerValue : right ? -steerValue : 0, 1);

    vehicleApi.setBrake(brake ? brakeForce : 0, 0);
    vehicleApi.setBrake(brake ? brakeForce : 0, 1);
    vehicleApi.setBrake(brake ? brakeForce : 10, 2); // Small constant brake for weight feel
    vehicleApi.setBrake(brake ? brakeForce : 10, 3);

    // Audio effects
    audioManager.updateEnginePitch(speed);
    
    const isSteeringSharply = (left || right) && Math.abs(speed) > 100;
    const isBrakingHeavily = brake && Math.abs(speed) > 30;
    const shouldScreech = isSteeringSharply || isBrakingHeavily;
    
    audioManager.playScreech(shouldScreech);

    // Dynamic Tribal Music Intensity
    const distanceChallenge = useGameStore.getState().challenges.find(c => c.id === '2');
    const intensityFactor = distanceChallenge ? Math.min(distanceChallenge.progress / distanceChallenge.target, 1) : 0;
    audioManager.updateTribalIntensity(intensityFactor, boost.isBoosting);

    // Sync state
    if (chassis.current) {
        const carPos = new THREE.Vector3();
        chassis.current.getWorldPosition(carPos);
        useGameStore.getState().setPlayerZ(carPos.z);
        useGameStore.getState().setPlayerX(carPos.x);
    }
    
    // Improved speed approximation for UI and distance
    // In a production app we'd subscribe to velocity via cannon API
    let targetSpeed = 0;
    if (forward) targetSpeed = boost.isBoosting ? 240 : 180;
    if (backward) targetSpeed = -40;
    
    const lerpFactor = forward ? 0.02 : 0.05;
    const currentSpeed = THREE.MathUtils.lerp(speed, targetSpeed, lerpFactor);
    setSpeed(currentSpeed);
    
    if (Math.abs(currentSpeed) > 1 && !isGameOver) {
        addDistance(Math.abs(currentSpeed) / 3600 * delta); // Scaled by delta for consistency
    }

    // Smooth camera follow
    if (chassis.current) {
        const carPos = new THREE.Vector3();
        chassis.current.getWorldPosition(carPos);
        
        const offset = new THREE.Vector3(0, 3, 7);
        offset.applyQuaternion(chassis.current.quaternion);
        
        const targetPos = carPos.clone().add(offset);
        state.camera.position.lerp(targetPos, 0.1);

        // Apply screen shake
        const shake = useGameStore.getState().shakeIntensity;
        if (shake > 0) {
            state.camera.position.x += (Math.random() - 0.5) * shake;
            state.camera.position.y += (Math.random() - 0.5) * shake;
        }

        state.camera.lookAt(carPos);
    }
  });

  return (
    <group ref={vehicle}>
      <group ref={chassis}>
        <CarModel />
      </group>
      <Wheel ref={wheels[0]} radius={0.4} />
      <Wheel ref={wheels[1]} radius={0.4} />
      <Wheel ref={wheels[2]} radius={0.4} />
      <Wheel ref={wheels[3]} radius={0.4} />
    </group>
  );
};
