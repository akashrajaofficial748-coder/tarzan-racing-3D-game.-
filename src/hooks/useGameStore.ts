import { create } from 'zustand';
import { GameState } from '../types';

interface GameStore extends GameState {
  setSpeed: (speed: number) => void;
  setPlayerZ: (z: number) => void;
  setPlayerX: (x: number) => void;
  addDistance: (d: number) => void;
  setGameOver: (status: boolean) => void;
  setWeather: (weather: GameState['weather']) => void;
  setCarCustomization: (customization: Partial<GameState['carCustomization']>) => void;
  updateChallenge: (type: GameState['challenges'][0]['type'], amount: number) => void;
  updateTime: (delta: number) => void;
  takeDamage: (amount: number) => void;
  setFogDensity: (density: number) => void;
  setShakeSensitivity: (sensitivity: number) => void;
  toggleHeadlights: () => void;
  cycleSkybox: () => void;
  setBoosting: (isBoosting: boolean) => void;
  updateBoost: (delta: number) => void;
  setShake: (intensity: number) => void;
  setPaused: (isPaused: boolean) => void;
  togglePause: () => void;
  setSubscription: (sub: GameState['subscription']) => void;
  recordNearMiss: () => void;
  resetGame: () => void;
}

const initialChallenges: GameState['challenges'] = [
  { id: '1', description: 'Reach 180 KM/H', target: 180, progress: 0, isCompleted: false, type: 'speed' },
  { id: '2', description: 'Drive 5 KM Total', target: 5, progress: 0, isCompleted: false, type: 'distance' },
  { id: '3', description: 'Collect 5 Energy Cores', target: 5, progress: 0, isCompleted: false, type: 'collect' },
  { id: '4', description: 'Finish in 60s', target: 60, progress: 0, isCompleted: false, type: 'speed' },
];

export const useGameStore = create<GameStore>((set) => ({
  score: 0,
  speed: 0,
  distance: 0,
  health: 100,
  playerZ: 0,
  playerX: 0,
  isGameOver: false,
  isPaused: false,
  sessionTime: 0,
  weather: 'sunny',
  fogDensity: 0.5,
  shakeSensitivity: 1.0,
  skyboxType: 'day',
  shakeIntensity: 0,
  leaderboard: [],
  carCustomization: {
    color: '#222222',
    neonColor: '#00ffff',
    decalPattern: 'none',
  },
  headlights: false,
  boost: {
    amount: 100,
    isBoosting: false,
    isCooldown: false,
  },
  challenges: initialChallenges,
  subscription: {
    isSubscribed: false,
    expiryDate: null,
    isTrial: false,
  },
  stats: {
    topSpeed: 0,
    totalSpeedSum: 0,
    speedSamples: 0,
    nitroTime: 0,
    nearMisses: 0,
  },
  setSpeed: (speed) => {
    set((state) => ({ 
      speed,
      stats: {
        ...state.stats,
        topSpeed: Math.max(state.stats.topSpeed, speed),
        totalSpeedSum: state.stats.totalSpeedSum + speed,
        speedSamples: state.stats.speedSamples + 1,
      }
    }));
    // Check speed challenge
    set((state) => ({
      challenges: state.challenges.map(c => 
        c.type === 'speed' && c.id === '1' && !c.isCompleted && speed >= c.target 
          ? { ...c, progress: speed, isCompleted: true } 
          : c
      )
    }));
  },
  setPlayerZ: (playerZ) => set({ playerZ }),
  setPlayerX: (playerX) => set({ playerX }),
  takeDamage: (amount) => set((state) => {
    const newHealth = Math.max(0, state.health - amount);
    return { 
      health: newHealth,
      isGameOver: newHealth <= 0 ? true : state.isGameOver
    };
  }),
  updateTime: (delta) => set((s) => ({ 
    sessionTime: s.sessionTime + delta,
    shakeIntensity: Math.max(0, s.shakeIntensity - delta * 15) // Decay shake
  })),
  setShake: (intensity) => set({ shakeIntensity: intensity }),
  setFogDensity: (density) => set({ fogDensity: density }),
  setShakeSensitivity: (sensitivity) => set({ shakeSensitivity: sensitivity }),
  setPaused: (isPaused) => set({ isPaused }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setSubscription: (subscription) => set({ subscription }),
  recordNearMiss: () => set((state) => ({
    stats: { ...state.stats, nearMisses: state.stats.nearMisses + 1 }
  })),
  updateChallenge: (type, amount) => set((state) => ({
    challenges: state.challenges.map(c => {
      if (c.type === type && !c.isCompleted) {
        const newProgress = c.type === 'collect' ? c.progress + amount : amount;
        const complete = newProgress >= c.target;
        if (complete && !c.isCompleted) {
           // Small score bonus for completing challenge
           setTimeout(() => {
             set((s) => ({ score: s.score + 500 }));
           }, 0);
        }
        return { ...c, progress: Math.min(newProgress, c.target), isCompleted: complete };
      }
      return c;
    })
  })),
  setCarCustomization: (customization: Partial<GameState['carCustomization']>) => 
    set((state) => ({ 
      carCustomization: { ...state.carCustomization, ...customization } 
    })),
  addDistance: (d) => {
    set((state) => {
      const newDistance = state.distance + d;
      // Update distance challenge progress
      const newChallenges = state.challenges.map(c => 
        c.type === 'distance' && !c.isCompleted 
          ? { ...c, progress: newDistance, isCompleted: newDistance >= c.target } 
          : c
      );
      return { 
        distance: newDistance,
        score: state.score + Math.floor(d * 10),
        challenges: newChallenges
      };
    });
  },
  setGameOver: (isGameOver) => {
    set((state) => {
       if (isGameOver) {
          // Check time challenge on finish
          const timeChallenge = state.challenges.find(c => c.id === '4');
          if (timeChallenge && !timeChallenge.isCompleted && state.sessionTime <= timeChallenge.target) {
             return {
                isGameOver: true,
                challenges: state.challenges.map(c => c.id === '4' ? { ...c, isCompleted: true, progress: state.sessionTime } : c)
             }
          }
       }
       return { isGameOver };
    });
  },
  setWeather: (weather) => set({ weather }),
  toggleHeadlights: () => set((state) => ({ headlights: !state.headlights })),
  cycleSkybox: () => set((state) => {
    const types: GameState['skyboxType'][] = ['day', 'sunset', 'night'];
    const nextIndex = (types.indexOf(state.skyboxType) + 1) % types.length;
    return { skyboxType: types[nextIndex] };
  }),
  setBoosting: (isBoosting) => set((state) => {
    const canBoost = isBoosting && state.boost.amount > 0 && !state.boost.isCooldown;
    return {
      boost: { ...state.boost, isBoosting: canBoost }
    };
  }),
  updateBoost: (delta) => set((state) => {
    let newAmount = state.boost.amount;
    let isCooldown = state.boost.isCooldown;
    let isBoosting = state.boost.isBoosting;

    if (state.boost.isBoosting) {
      newAmount -= delta * 40; // Faster drain for higher intensity
      set((s) => ({
        stats: { ...s.stats, nitroTime: s.stats.nitroTime + delta }
      }));
      if (newAmount <= 0) {
        newAmount = 0;
        isBoosting = false;
        isCooldown = true;
      }
    } else {
      newAmount += delta * 20; // 5 seconds to full recharge
      if (newAmount >= 100) {
        newAmount = 100;
        isCooldown = false;
      }
    }

    return {
      boost: {
        amount: newAmount,
        isBoosting,
        isCooldown
      }
    };
  }),
  resetGame: () => set({ 
    score: 0, 
    speed: 0, 
    distance: 0, 
    health: 100, 
    playerZ: 0,
    playerX: 0,
    isGameOver: false,
    sessionTime: 0,
    headlights: false,
    skyboxType: 'day',
    fogDensity: 0.5,
    shakeSensitivity: 1.0,
    shakeIntensity: 0,
    boost: {
      amount: 100,
      isBoosting: false,
      isCooldown: false,
    },
    stats: {
      topSpeed: 0,
      totalSpeedSum: 0,
      speedSamples: 0,
      nitroTime: 0,
      nearMisses: 0,
    },
    challenges: initialChallenges 
  }),
}));
