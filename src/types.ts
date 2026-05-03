export interface Challenge {
  id: string;
  description: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  type: 'speed' | 'distance' | 'collect';
}

export interface GameState {
  score: number;
  speed: number;
  distance: number;
  health: number;
  playerZ: number;
  playerX: number;
  isGameOver: boolean;
  isPaused: boolean;
  sessionTime: number;
  weather: 'sunny' | 'rainy' | 'foggy';
  fogDensity: number;
  shakeSensitivity: number;
  skyboxType: 'day' | 'night' | 'sunset';
  shakeIntensity: number;
  leaderboard: { name: string; score: number }[];
  carCustomization: {
    color: string;
    neonColor: string;
    decalPattern: 'none' | 'stripes' | 'circuit' | 'tribal' | 'flames' | 'carbon';
  };
  headlights: boolean;
  boost: {
    amount: number; // 0 to 100
    isBoosting: boolean;
    isCooldown: boolean;
  };
  challenges: Challenge[];
  subscription: {
    isSubscribed: boolean;
    expiryDate: number | null;
    isTrial: boolean;
  };
  stats: {
    topSpeed: number;
    totalSpeedSum: number;
    speedSamples: number;
    nitroTime: number;
    nearMisses: number;
  };
}

export type CarControls = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
};
