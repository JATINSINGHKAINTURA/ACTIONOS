/**
 * Web Audio API Acoustic Masking Synthesizer
 * Provides 432Hz Binaural Carrier, Pink Noise, and Serene Rain
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private source: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private currentMode: "off" | "drone" | "pink" | "rain" = "off";
  private currentVolume: number = 0.25;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = this.currentVolume;
        this.gainNode.connect(this.ctx.destination);
      }
    }
  }

  public setVolume(val: number) {
    this.currentVolume = Math.max(0, Math.min(1, val));
    if (this.gainNode) {
      this.gainNode.gain.value = this.currentVolume;
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getMode(): "off" | "drone" | "pink" | "rain" {
    return this.currentMode;
  }

  public stop() {
    if (this.source) {
      try {
        (this.source as AudioBufferSourceNode | OscillatorNode).stop();
      } catch {
        // Safe ignore
      }
      this.source = null;
    }
    this.currentMode = "off";
  }

  public play(type: "off" | "drone" | "pink" | "rain") {
    this.stop();
    if (type === "off") return;

    this.init();
    if (!this.ctx || !this.gainNode) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (type === "drone") {
      // 432Hz harmonic sine wave
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 520;
      osc.type = "sine";
      osc.frequency.value = 432;
      osc.connect(filter);
      filter.connect(this.gainNode);
      osc.start();
      this.source = osc;
      this.currentMode = "drone";
    } else if (type === "pink" || type === "rain") {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        data[i] = (b0 + b1 + b2 + b3 + b4) * (type === "rain" ? 0.04 : 0.06);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = type === "rain" ? "bandpass" : "lowpass";
      filter.frequency.value = type === "rain" ? 750 : 380;

      noise.connect(filter);
      filter.connect(this.gainNode);
      noise.start();
      this.source = noise;
      this.currentMode = type;
    }
  }
}

export const soundscapeEngine = new AudioSynthesizer();
