export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private isMusicEnabled = true;
  private isSoundEnabled = true;

  private musicOscillators: OscillatorNode[] = [];
  private themeInterval: number | null = null;
  private engineOscillators: OscillatorNode[] = [];
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private activeVehicleId: string | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private filterWind: BiquadFilterNode | null = null;

  // Track settings to apply smoothly
  private lastRpm = 0;

  private constructor() {
    this.initContext();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private initContext() {
    if (this.ctx) return;
    
    // Create lazily on first interaction usually, but let's init objects if context is available.
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      
      this.updateVolumes();
    } catch (e) {
      console.warn('AudioContext not supported');
    }
  }

  // Settings
  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    this.updateVolumes();
    if (!enabled) {
      this.stopThemeMusic();
    } else {
      this.playThemeMusic(); // Will check state internally
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
    this.updateVolumes();
    if (!enabled) {
      this.stopEngine();
    }
  }

  private updateVolumes() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    if (this.musicGain) {
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.linearRampToValueAtTime(this.isMusicEnabled ? 0.3 : 0, now + 0.5);
    }
    
    if (this.sfxGain) {
      this.sfxGain.gain.cancelScheduledValues(now);
      this.sfxGain.gain.linearRampToValueAtTime(this.isSoundEnabled ? 0.7 : 0, now + 0.1);
    }
  }

  public resumeContextIfNeeded() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound Effects ---
  
  public playUITap() {
    this.playTone(600, 'sine', 0.05, 0.1);
  }

  public playSwipe() {
    this.playTone(300, 'triangle', 0.1, 0.15);
  }

  public playUpgrade() {
    if (!this.ctx || !this.isSoundEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playUnlock() {
    if (!this.ctx || !this.isSoundEnabled) return;
    const now = this.ctx.currentTime;
    // Major chord arpeggio
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = now + idx * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0);
      
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(startTime);
      osc.stop(startTime + 1.1);
    });
  }

  public playFail() {
    if (!this.ctx || !this.isSoundEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  private lastCoinTime: number = 0;

  public playCoin() {
    if (!this.ctx || !this.isSoundEnabled) return;
    const now = this.ctx.currentTime;
    // Throttle to 50ms (max 20 per second)
    if (now - this.lastCoinTime < 0.05) return;
    this.lastCoinTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playDiamond() {
    if (!this.ctx || !this.isSoundEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, now);
    osc.frequency.exponentialRampToValueAtTime(3000, now + 0.3);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playFuel() {
    if (!this.ctx || !this.isSoundEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playCrash(severity: 'small' | 'medium' | 'major') {
    if (!this.ctx || !this.isSoundEnabled) return;
    const now = this.ctx.currentTime;
    // Use brown noise approximation for crash
    const bufferSize = this.ctx.sampleRate * 1.0; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; 
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = severity === 'major' ? 800 : severity === 'medium' ? 1200 : 2000;
    
    const gain = this.ctx.createGain();
    const duration = severity === 'major' ? 1.0 : severity === 'medium' ? 0.6 : 0.3;
    const peakGain = severity === 'major' ? 0.8 : severity === 'medium' ? 0.5 : 0.3;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    
    noise.start(now);
    noise.stop(now + duration + 0.1);
  }

  public playGameOver() {
    if (!this.ctx || !this.isSoundEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.8);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 1.0);
  }

  public playResultsRecord() {
    this.playUnlock(); // Reuse unlock sound for records
  }

  public playBrake() {
    if (!this.ctx || !this.isSoundEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // High frequency hiss for brakes
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(4000, now);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // --- Engine specific controls ---
  
  public startEngine(vehicleId: string) {
    if (!this.ctx || !this.isSoundEnabled) return;
    this.stopEngine();
    
    this.activeVehicleId = vehicleId;
    const now = this.ctx.currentTime;
    
    this.engineGain = this.ctx.createGain();
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 400; // Muffled by default
    
    this.engineGain.gain.value = 0;
    this.engineGain.gain.linearRampToValueAtTime(0.3, now + 0.5); // Fade in engine
    
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain!);

    const createOsc = (type: OscillatorType, detune: number = 0) => {
       const osc = this.ctx!.createOscillator();
       osc.type = type;
       osc.detune.value = detune;
       osc.connect(this.engineFilter!);
       osc.start();
       this.engineOscillators.push(osc);
       return osc;
    };

    if (vehicleId === 'v_bike') {
       createOsc('sawtooth');
       createOsc('sawtooth', 15);
    } else if (vehicleId === 'v_monster') {
       createOsc('square');
       createOsc('sawtooth', -10);
    } else if (vehicleId === 'v_sport') {
       createOsc('sawtooth');
       createOsc('square', 10);
    } else if (vehicleId === 'v_bus') {
       createOsc('square', -5);
       createOsc('square', 5);
    } else if (vehicleId === 'v_tank') {
       createOsc('square');
       createOsc('sawtooth', -20);
    } else { // v_jeep or default
       createOsc('sawtooth');
       createOsc('square', -10);
    }
    
    this.updateEngine(0);
  }

  public updateEngine(rpm: number) {
    if (this.engineOscillators.length === 0 || !this.engineGain || !this.engineFilter || !this.ctx || !this.isSoundEnabled) return;
    const now = this.ctx.currentTime;
    
    let baseFreq = 40 + (rpm * 150);
    let filterFreq = 300 + (rpm * 1500);
    let targetGain = 0.2 + (rpm * 0.15);
    
    if (this.activeVehicleId === 'v_bike') {
        baseFreq = 60 + (rpm * 250);
        filterFreq = 400 + (rpm * 2000);
    } else if (this.activeVehicleId === 'v_monster') {
        baseFreq = 30 + (rpm * 100);
        filterFreq = 250 + (rpm * 1000);
    } else if (this.activeVehicleId === 'v_sport') {
        baseFreq = 50 + (rpm * 300);
        filterFreq = 500 + (rpm * 2500);
    } else if (this.activeVehicleId === 'v_bus') {
        baseFreq = 25 + (rpm * 80);
        filterFreq = 200 + (rpm * 800);
    } else if (this.activeVehicleId === 'v_tank') {
        baseFreq = 20 + (rpm * 70);
        filterFreq = 150 + (rpm * 600);
    } else { // jeep default
        baseFreq = 35 + (rpm * 160);
        filterFreq = 300 + (rpm * 1500);
    }

    this.engineOscillators.forEach((osc, idx) => {
       let freqOffset = baseFreq;
       if (idx === 1) {
           if (this.activeVehicleId === 'v_sport') freqOffset = baseFreq * 1.5;
           else if (this.activeVehicleId === 'v_bike') freqOffset = baseFreq * 2.0;
           else freqOffset = baseFreq * 0.5; // Default octave down for rumble
       }
       osc.frequency.setTargetAtTime(freqOffset, now, 0.1);
    });
    
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.1);
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.1);
  }

  public stopEngine() {
    if (this.engineOscillators.length > 0 && this.ctx) {
      const now = this.ctx.currentTime;
      if (this.engineGain) {
        this.engineGain.gain.cancelScheduledValues(now);
        this.engineGain.gain.linearRampToValueAtTime(0, now + 0.2);
      }
      this.engineOscillators.forEach(osc => osc.stop(now + 0.2));
      this.engineOscillators = [];
      this.engineGain = null;
      this.engineFilter = null;
    }
  }

  public startWind() {
    if (!this.ctx || !this.isSoundEnabled) return;
    this.stopWind();
    
    // Create continuous white noise
    const bufferSize = this.ctx.sampleRate * 2.0; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    this.windSource = this.ctx.createBufferSource();
    this.windSource.buffer = buffer;
    this.windSource.loop = true;
    
    this.filterWind = this.ctx.createBiquadFilter();
    this.filterWind.type = 'lowpass';
    this.filterWind.frequency.value = 400; // soft wind roar
    
    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0; // muted by default
    
    this.windSource.connect(this.filterWind);
    this.filterWind.connect(this.windGain);
    this.windGain.connect(this.sfxGain!);
    
    this.windSource.start();
  }

  public updateWind(speed: number, inAir: boolean) {
    if (!this.windSource || !this.windGain || !this.filterWind || !this.ctx || !this.isSoundEnabled) return;
    const now = this.ctx.currentTime;
    
    // Wind volume based mostly on airtime and a bit of speed
    let targetGain = 0;
    if (inAir && speed > 5) {
       targetGain = Math.min(speed / 50 * 0.15, 0.15); // max 0.15 volume
    }
    
    this.windGain.gain.setTargetAtTime(targetGain, now, 0.2);
    
    const targetFreq = 400 + (speed * 10);
    this.filterWind.frequency.setTargetAtTime(targetFreq, now, 0.2);
  }

  public stopWind() {
    if (this.windSource && this.ctx) {
      const now = this.ctx.currentTime;
      if (this.windGain) {
         this.windGain.gain.cancelScheduledValues(now);
         this.windGain.gain.linearRampToValueAtTime(0, now + 0.1);
      }
      this.windSource.stop(now + 0.2);
      this.windSource = null;
      this.windGain = null;
      this.filterWind = null;
    }
  }

  // --- Theme Music ---

  private _themePlaying = false;

  public playThemeMusic() {
    if (this._themePlaying || !this.isMusicEnabled || !this.ctx) return;
    this._themePlaying = true;
    
    this.resumeContextIfNeeded();
    this.scheduleMusicLoop();
  }

  private scheduleMusicLoop() {
    if (!this._themePlaying || !this.ctx) return;
    
    // Simple energetic arpeggio loop for theme music
    const notes = [
      220.00, 261.63, 329.63, 440.00, // A minor
      196.00, 246.94, 293.66, 392.00, // G major
      174.61, 220.00, 261.63, 349.23, // F major
      164.81, 207.65, 246.94, 329.63  // E major
    ];
    
    let noteIndex = 0;
    const bpm = 140;
    const beepLength = 60 / bpm / 2; // eighth notes
    
    const playNote = () => {
      if (!this._themePlaying || !this.ctx || !this.isMusicEnabled) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      // Octave pattern
      const freq = notes[Math.floor(noteIndex / 4) * 4 + (noteIndex % 4)];
      osc.frequency.value = freq;
      
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + beepLength);
      
      osc.connect(gain);
      gain.connect(this.musicGain!);
      
      osc.start(now);
      osc.stop(now + beepLength);
      
      noteIndex = (noteIndex + 1) % notes.length;
    };
    
    // Clear old loop if any
    if (this.themeInterval) {
      clearInterval(this.themeInterval);
    }
    
    // First run immediately
    playNote();
    
    // Loop
    this.themeInterval = window.setInterval(playNote, beepLength * 1000);
  }

  public stopThemeMusic() {
    this._themePlaying = false;
    if (this.themeInterval) {
      clearInterval(this.themeInterval);
      this.themeInterval = null;
    }
  }

  // --- Utility ---

  private playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    if (!this.ctx || !this.isSoundEnabled) return;
    this.resumeContextIfNeeded();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    
    osc.start(now);
    osc.stop(now + duration);
  }
}

export const audioManager = AudioManager.getInstance();
