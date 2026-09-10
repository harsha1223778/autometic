/**
 * AI Audio De-Clicker, Plosive Pop Filter & Vocal Air Enhancer
 * 
 * Implements a Web Audio API DSP filter chain:
 * 1. Steep Highpass Pop Filter (85 Hz) to eliminate microphone plosive thuds (P/B air bursts).
 * 2. High-Shelf Vocal Air Shaper (12 kHz+) to inject studio presence and broadcast clarity.
 * 3. Dynamic Notch De-Sibilance / De-Clicker (6.5 kHz) to tame harsh mouth clicks and hiss.
 */

export interface VocalEnhancerSettings {
  deClickerEnabled: boolean;
  plosiveFilterEnabled: boolean;
  vocalAirBoostDb: number; // e.g. 0 to +8 dB
  deEsserIntensity: number; // 0 to 1
}

export const DEFAULT_VOCAL_ENHANCER: VocalEnhancerSettings = {
  deClickerEnabled: true,
  plosiveFilterEnabled: true,
  vocalAirBoostDb: 4.5,
  deEsserIntensity: 0.6
};

export interface VocalDspNodes {
  highpass: BiquadFilterNode;
  deClickerNotch: BiquadFilterNode;
  airHighShelf: BiquadFilterNode;
  outputGain: GainNode;
  disconnect: () => void;
  updateSettings: (settings: Partial<VocalEnhancerSettings>) => void;
}

/**
 * Builds a chain of DSP nodes in an AudioContext between source and destination.
 */
export function createVocalDspChain(
  audioCtx: AudioContext,
  sourceNode: AudioNode,
  destNode: AudioNode,
  initialSettings: VocalEnhancerSettings = DEFAULT_VOCAL_ENHANCER
): VocalDspNodes {
  // 1. Plosive pop highpass filter (85Hz, 12dB/octave Butterworth)
  const highpass = audioCtx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = initialSettings.plosiveFilterEnabled ? 85 : 10;
  highpass.Q.value = 0.707;

  // 2. De-Clicker / De-Sibilance notch filter at 6500 Hz
  const deClickerNotch = audioCtx.createBiquadFilter();
  deClickerNotch.type = 'peaking';
  deClickerNotch.frequency.value = 6500;
  deClickerNotch.Q.value = 2.5;
  deClickerNotch.gain.value = initialSettings.deClickerEnabled ? -Math.round(initialSettings.deEsserIntensity * 7) : 0;

  // 3. Studio Air High-Shelf filter at 12,000 Hz
  const airHighShelf = audioCtx.createBiquadFilter();
  airHighShelf.type = 'highshelf';
  airHighShelf.frequency.value = 12000;
  airHighShelf.gain.value = initialSettings.vocalAirBoostDb;

  // 4. Output gain node
  const outputGain = audioCtx.createGain();
  outputGain.gain.value = 1.0;

  // Connect chain: source -> highpass -> deClickerNotch -> airHighShelf -> outputGain -> destination
  sourceNode.connect(highpass);
  highpass.connect(deClickerNotch);
  deClickerNotch.connect(airHighShelf);
  airHighShelf.connect(outputGain);
  outputGain.connect(destNode);

  const disconnect = () => {
    try {
      sourceNode.disconnect(highpass);
      highpass.disconnect();
      deClickerNotch.disconnect();
      airHighShelf.disconnect();
      outputGain.disconnect();
    } catch {
      // safe fallback if already disconnected
    }
  };

  const updateSettings = (newSettings: Partial<VocalEnhancerSettings>) => {
    if (newSettings.plosiveFilterEnabled !== undefined) {
      highpass.frequency.setTargetAtTime(
        newSettings.plosiveFilterEnabled ? 85 : 10,
        audioCtx.currentTime,
        0.05
      );
    }

    if (newSettings.deClickerEnabled !== undefined || newSettings.deEsserIntensity !== undefined) {
      const enabled = newSettings.deClickerEnabled ?? initialSettings.deClickerEnabled;
      const intensity = newSettings.deEsserIntensity ?? initialSettings.deEsserIntensity;
      const gainVal = enabled ? -Math.round(intensity * 7) : 0;
      deClickerNotch.gain.setTargetAtTime(gainVal, audioCtx.currentTime, 0.05);
    }

    if (newSettings.vocalAirBoostDb !== undefined) {
      airHighShelf.gain.setTargetAtTime(newSettings.vocalAirBoostDb, audioCtx.currentTime, 0.05);
    }
  };

  return {
    highpass,
    deClickerNotch,
    airHighShelf,
    outputGain,
    disconnect,
    updateSettings
  };
}
