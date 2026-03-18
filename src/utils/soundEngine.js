/**
 * soundEngine.js
 * Audio engine powered by Tone.js for real-time sound synthesis.
 * Supports multiple instruments: Piano, Synth, Guitar, Flute, and Drums.
 */

import * as Tone from 'tone';

// Custom drum kit class to map notes to different drum sounds
class SynthDrums {
  constructor() {
    this.kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octave: 1.5, volume: 4 });
    this.snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 },
      volume: 2
    });
    this.hihat = new Tone.MetalSynth({
      frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
      volume: -8
    });
    this.tom = new Tone.MembraneSynth({ pitchDecay: 0.2, octave: 2, volume: 2 });
    this.cymbal = new Tone.MetalSynth({
      frequency: 250, envelope: { attack: 0.001, decay: 1.4, release: 0.2 },
      harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
      volume: -8
    });

    this.output = new Tone.Gain(1);
    this.kick.connect(this.output);
    this.snare.connect(this.output);
    this.hihat.connect(this.output);
    this.tom.connect(this.output);
    this.cymbal.connect(this.output);
  }

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    this.output.disconnect();
  }

  triggerAttack(note) {
    if (note === 'C4') this.kick.triggerAttackRelease('C1', '8n');     // Thumb -> Kick
    if (note === 'D4') this.snare.triggerAttackRelease('16n');         // Index -> Snare
    if (note === 'E4') this.hihat.triggerAttackRelease('32n');         // Middle -> Hi-hat
    if (note === 'F4') this.tom.triggerAttackRelease('G2', '8n');      // Ring -> Tom
    if (note === 'G4') this.cymbal.triggerAttackRelease('8n');         // Pinky -> Cymbal
  }

  triggerRelease(note) {
    // Drum sounds are essentially one-shots
  }

  dispose() {
    this.kick.dispose();
    this.snare.dispose();
    this.hihat.dispose();
    this.tom.dispose();
    this.cymbal.dispose();
    this.output.dispose();
  }
}

// Instrument presets
const INSTRUMENT_CONFIGS = {
  piano: {
    name: 'Piano',
    icon: '🎹',
    create: () =>
      new Tone.PolySynth(Tone.Synth, {
        maxPolyphony: 10,
        voice: Tone.Synth,
        options: {
          oscillator: { type: 'triangle8' },
          envelope: {
            attack: 0.005,
            decay: 0.3,
            sustain: 0.2,
            release: 1.2,
          },
          volume: -8,
        },
      }),
  },
  synth: {
    name: 'Synth',
    icon: '🎛️',
    create: () =>
      new Tone.PolySynth(Tone.FMSynth, {
        maxPolyphony: 10,
        voice: Tone.FMSynth,
        options: {
          harmonicity: 3,
          modulationIndex: 10,
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.5,
            release: 0.8,
          },
          modulation: { type: 'square' },
          modulationEnvelope: {
            attack: 0.5,
            decay: 0.1,
            sustain: 0.3,
            release: 0.5,
          },
          volume: -12,
        },
      }),
  },
  guitar: {
    name: 'Guitar',
    icon: '🎸',
    create: () =>
      new Tone.PolySynth(Tone.Synth, {
        maxPolyphony: 10,
        voice: Tone.Synth,
        options: {
          oscillator: { type: 'fmtriangle', modulationType: 'sine', harmonicity: 3.01 },
          envelope: {
            attack: 0.002,
            decay: 0.5,
            sustain: 0.1,
            release: 1.5,
          },
          volume: -6,
        },
      }),
  },
  flute: {
    name: 'Flute',
    icon: '🎋',
    create: () =>
      new Tone.PolySynth(Tone.FMSynth, {
        maxPolyphony: 10,
        voice: Tone.FMSynth,
        options: {
          harmonicity: 2,
          modulationIndex: 0.5,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.08, decay: 0.2, sustain: 0.8, release: 0.6 },
          modulation: { type: 'triangle' },
          modulationEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.6 },
          volume: -4,
        },
      }),
  },
  drums: {
    name: 'Drums',
    icon: '🥁',
    create: () => new SynthDrums(),
  },
};

class SoundEngine {
  constructor() {
    this.currentInstrument = null;
    this.currentInstrumentType = 'piano';
    this.isReady = false;
    this.activeNotes = new Set();
    this.analyser = null;
    this.masterGain = null;
    this.reverb = null;
    this._lastTriggerTime = {};
    this._minInterval = 150; // minimum ms between note triggers to prevent spam
  }

  /**
   * Initialize the audio context and default instrument.
   */
  async init() {
    if (this.isReady) return;

    await Tone.start();

    // Master effects chain
    this.reverb = new Tone.Reverb({ decay: 2.5, wet: 0.2 }).toDestination();
    this.masterGain = new Tone.Gain(0.8).connect(this.reverb);

    // Analyser for waveform visualization
    this.analyser = new Tone.Analyser('waveform', 256);
    this.masterGain.connect(this.analyser);

    // Load default instrument
    this.setInstrument('piano');

    this.isReady = true;
    console.log('[SoundEngine] Initialized successfully');
  }

  /**
   * Switch the current instrument.
   * @param {string} type - 'piano' | 'synth' | 'guitar' | 'flute' | 'drums'
   */
  setInstrument(type) {
    if (!INSTRUMENT_CONFIGS[type]) {
      console.warn(`[SoundEngine] Unknown instrument type: ${type}`);
      return;
    }

    // Release all current notes and dispose old instrument
    if (this.currentInstrument) {
      this.releaseAll();
      this.currentInstrument.disconnect();
      this.currentInstrument.dispose();
    }

    const config = INSTRUMENT_CONFIGS[type];
    this.currentInstrument = config.create();
    this.currentInstrument.connect(this.masterGain);
    this.currentInstrumentType = type;

    console.log(`[SoundEngine] Switched to ${config.name}`);
  }

  /**
   * Play notes based on current finger state. Handles attack/release logic.
   * @param {string[]} notes - Array of notes to play (e.g., ['C4', 'E4'])
   */
  playNotes(notes) {
    if (!this.isReady || !this.currentInstrument) return;

    const now = Date.now();
    const newNotes = new Set(notes);

    // Release notes that are no longer active
    for (const note of this.activeNotes) {
      if (!newNotes.has(note)) {
        try {
          this.currentInstrument.triggerRelease(note);
        } catch (e) {
          // Ignore release errors
        }
        this.activeNotes.delete(note);
      }
    }

    // Trigger new notes (with debounce)
    for (const note of newNotes) {
      if (!this.activeNotes.has(note)) {
        const lastTime = this._lastTriggerTime[note] || 0;
        if (now - lastTime >= this._minInterval) {
          try {
            if (this.currentInstrumentType === 'drums') {
              this.currentInstrument.triggerAttack(note);
            } else {
              this.currentInstrument.triggerAttack(note);
            }
            this.activeNotes.add(note);
            this._lastTriggerTime[note] = now;
          } catch (e) {
            console.warn(`[SoundEngine] Failed to trigger note ${note}:`, e);
          }
        }
      }
    }
  }

  /**
   * Release all currently playing notes.
   */
  releaseAll() {
    if (!this.currentInstrument) return;

    for (const note of this.activeNotes) {
      try {
        this.currentInstrument.triggerRelease(note);
      } catch (e) {
        // Ignore
      }
    }
    this.activeNotes.clear();
  }

  /**
   * Get waveform data for visualization.
   * @returns {Float32Array} Waveform data
   */
  getWaveformData() {
    if (!this.analyser) return new Float32Array(256);
    return this.analyser.getValue();
  }

  /**
   * Set master volume (0 to 1).
   * @param {number} volume
   */
  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get available instruments.
   * @returns {Array<{ id: string, name: string, icon: string }>}
   */
  getInstruments() {
    return Object.entries(INSTRUMENT_CONFIGS).map(([id, config]) => ({
      id,
      name: config.name,
      icon: config.icon,
    }));
  }

  /**
   * Cleanup and dispose all audio resources.
   */
  dispose() {
    this.releaseAll();
    if (this.currentInstrument) {
      this.currentInstrument.disconnect();
      this.currentInstrument.dispose();
    }
    if (this.reverb) this.reverb.dispose();
    if (this.masterGain) this.masterGain.dispose();
    if (this.analyser) this.analyser.dispose();
    this.isReady = false;
  }
}

// Export a singleton instance
const soundEngine = new SoundEngine();
export default soundEngine;
export { INSTRUMENT_CONFIGS };
