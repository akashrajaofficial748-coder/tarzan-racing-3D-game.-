import { Howl } from 'howler';

class AudioService {
  private engineSound: Howl | null = null;
  private ambientSound: Howl | null = null;
  private jungleAmbience: Howl | null = null;
  private tribalMusic: Howl | null = null;
  private collisionSound: Howl | null = null;
  private screechSound: Howl | null = null;
  private finishSound: Howl | null = null;
  private splashSound: Howl | null = null;
  private rustleSound: Howl | null = null;

  constructor() {
    // Note: In a production app, these should be hosted assets or local files.
    this.engineSound = new Howl({
      src: ['https://assets.mixkit.co/sfx/preview/mixkit-car-engine-loop-2537.mp3'],
      loop: true,
      volume: 0.15,
      rate: 1.0,
    });

    this.ambientSound = new Howl({
      src: ['https://assets.mixkit.co/sfx/preview/mixkit-wind-heavy-storm-loop-1188.mp3'],
      loop: true,
      volume: 0.05,
    });

    this.jungleAmbience = new Howl({
      src: ['https://assets.mixkit.co/sfx/preview/mixkit-jungle-day-forest-loop-1221.mp3'],
      loop: true,
      volume: 0.1,
    });

    this.tribalMusic = new Howl({
      src: ['https://assets.mixkit.co/sfx/preview/mixkit-tribal-rhythm-drums-2035.mp3'], // High-energy rhythmic tribal percussions
      loop: true,
      volume: 0.08,
    });

    this.collisionSound = new Howl({
      src: ['https://assets.mixkit.co/sfx/preview/mixkit-car-collision-737.mp3'],
      volume: 0.5,
    });

    this.screechSound = new Howl({
      src: ['https://assets.mixkit.co/sfx/preview/mixkit-car-tires-screech-743.mp3'],
      volume: 0.3,
    });

    this.finishSound = new Howl({
      src: ['https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'],
      volume: 0.6,
    });

    this.splashSound = new Howl({
      src: ['https://assets.mixkit.co/sfx/preview/mixkit-water-splash-1311.mp3'],
      volume: 0.4,
    });

    this.rustleSound = new Howl({
      src: ['https://assets.mixkit.co/sfx/preview/mixkit-walking-on-dry-leaves-and-branches-2512.mp3'],
      volume: 0.3,
      rate: 1.2,
    });
  }

  public updateTribalIntensity(intensity: number, isBoosting: boolean) {
    if (!this.tribalMusic) return;

    // intensity is 0 to 1
    // Map intensity to volume variation (0.05 - 0.25)
    const baseVolume = 0.08;
    const targetVolume = baseVolume + intensity * 0.15 + (isBoosting ? 0.1 : 0);
    this.tribalMusic.volume(Math.min(targetVolume, 0.5));

    // Map intensity to rate (speed/complexity feel) (0.9 - 1.4)
    const targetRate = 0.9 + intensity * 0.3 + (isBoosting ? 0.25 : 0);
    this.tribalMusic.rate(targetRate);
  }

  public startEngine() {
    if (!this.engineSound?.playing()) this.engineSound?.play();
    if (!this.ambientSound?.playing()) this.ambientSound?.play();
    if (!this.jungleAmbience?.playing()) this.jungleAmbience?.play();
    if (!this.tribalMusic?.playing()) this.tribalMusic?.play();
  }

  public pauseSounds(paused: boolean) {
    if (paused) {
      this.engineSound?.mute(true);
      this.tribalMusic?.mute(true);
      this.screechSound?.mute(true);
    } else {
      this.engineSound?.mute(false);
      this.tribalMusic?.mute(false);
      this.screechSound?.mute(false);
    }
  }

  public stopEngine() {
    this.engineSound?.stop();
    this.ambientSound?.stop();
    this.jungleAmbience?.stop();
    this.tribalMusic?.stop();
    this.screechSound?.stop();
  }

  public updateEnginePitch(speed: number) {
    if (!this.engineSound) return;
    // Map speed (0-200) to pitch (0.5 - 2.0)
    const pitch = 0.5 + (Math.min(speed, 200) / 200) * 1.5;
    this.engineSound.rate(pitch);
  }

  public playCollision() {
    this.collisionSound?.play();
  }

  public playScreech(active: boolean) {
    if (active) {
      if (!this.screechSound?.playing()) this.screechSound?.play();
    } else {
      this.screechSound?.stop();
    }
  }

  public playFinish() {
    this.finishSound?.play();
  }

  public playRustle() {
    if (!this.rustleSound?.playing()) this.rustleSound?.play();
  }

  public playSplash() {
    if (!this.splashSound?.playing()) this.splashSound?.play();
  }
}

export const audioManager = new AudioService();
