import React, { useEffect, useRef, useCallback } from 'react';

interface AudioConfig {
  type: 'success' | 'error' | 'notification' | 'ai-response' | 'command-received' | 'processing';
  position?: { x: number; y: number; z: number };
  volume?: number;
}

interface VRSpatialAudioProps {
  enabled: boolean;
  onAudioReady?: () => void;
}

// Audio synthesis for different feedback types
const AUDIO_CONFIGS = {
  'success': { frequency: 880, duration: 0.15, type: 'sine' as OscillatorType, gain: 0.3 },
  'error': { frequency: 220, duration: 0.3, type: 'sawtooth' as OscillatorType, gain: 0.2 },
  'notification': { frequency: 660, duration: 0.1, type: 'sine' as OscillatorType, gain: 0.25 },
  'ai-response': { frequency: 440, duration: 0.2, type: 'triangle' as OscillatorType, gain: 0.2 },
  'command-received': { frequency: 523.25, duration: 0.08, type: 'sine' as OscillatorType, gain: 0.3 },
  'processing': { frequency: 330, duration: 0.5, type: 'sine' as OscillatorType, gain: 0.15 },
};

export const useVRSpatialAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const pannerRef = useRef<PannerNode | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize audio context
  const initAudio = useCallback(async () => {
    if (isInitializedRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create panner for spatial audio
      pannerRef.current = audioContextRef.current.createPanner();
      pannerRef.current.panningModel = 'HRTF';
      pannerRef.current.distanceModel = 'inverse';
      pannerRef.current.refDistance = 1;
      pannerRef.current.maxDistance = 10000;
      pannerRef.current.rolloffFactor = 1;
      pannerRef.current.coneInnerAngle = 360;
      pannerRef.current.coneOuterAngle = 0;
      pannerRef.current.coneOuterGain = 0;
      pannerRef.current.connect(audioContextRef.current.destination);
      
      isInitializedRef.current = true;
    } catch (e) {
      console.error('Failed to initialize spatial audio:', e);
    }
  }, []);

  // Play spatial audio feedback
  const playAudio = useCallback(async (config: AudioConfig) => {
    if (!audioContextRef.current) {
      await initAudio();
    }
    
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Resume context if suspended
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const audioConfig = AUDIO_CONFIGS[config.type];
    if (!audioConfig) return;

    try {
      // Create oscillator
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = audioConfig.type;
      oscillator.frequency.setValueAtTime(audioConfig.frequency, ctx.currentTime);
      
      // Set gain envelope
      const volume = (config.volume ?? 1) * audioConfig.gain;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + audioConfig.duration);

      // Apply spatial position if provided
      if (config.position && pannerRef.current) {
        pannerRef.current.positionX.setValueAtTime(config.position.x, ctx.currentTime);
        pannerRef.current.positionY.setValueAtTime(config.position.y, ctx.currentTime);
        pannerRef.current.positionZ.setValueAtTime(config.position.z, ctx.currentTime);
        oscillator.connect(gainNode).connect(pannerRef.current);
      } else {
        oscillator.connect(gainNode).connect(ctx.destination);
      }

      // Play
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + audioConfig.duration);

      // Add harmonics for richer sound
      if (config.type === 'ai-response') {
        const harmonic = ctx.createOscillator();
        const harmonicGain = ctx.createGain();
        harmonic.type = 'sine';
        harmonic.frequency.setValueAtTime(audioConfig.frequency * 2, ctx.currentTime);
        harmonicGain.gain.setValueAtTime(0, ctx.currentTime);
        harmonicGain.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.01);
        harmonicGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + audioConfig.duration);
        harmonic.connect(harmonicGain).connect(ctx.destination);
        harmonic.start(ctx.currentTime);
        harmonic.stop(ctx.currentTime + audioConfig.duration);
      }

      // Cleanup
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (e) {
      console.error('Failed to play audio:', e);
    }
  }, [initAudio]);

  // Play AI response sequence
  const playAIResponseSequence = useCallback(async () => {
    await playAudio({ type: 'ai-response', position: { x: 0, y: 1, z: -2 } });
    setTimeout(() => {
      playAudio({ type: 'notification', position: { x: 0.5, y: 1, z: -2 } });
    }, 100);
  }, [playAudio]);

  // Play command received feedback
  const playCommandReceived = useCallback(async () => {
    await playAudio({ type: 'command-received', position: { x: 0, y: 0, z: -1 } });
  }, [playAudio]);

  // Play processing loop
  const playProcessingLoop = useCallback(async () => {
    await playAudio({ type: 'processing', position: { x: -1, y: 0, z: -2 } });
  }, [playAudio]);

  // Play success feedback
  const playSuccess = useCallback(async () => {
    await playAudio({ type: 'success', position: { x: 0, y: 0.5, z: -1.5 } });
  }, [playAudio]);

  // Play error feedback
  const playError = useCallback(async () => {
    await playAudio({ type: 'error', position: { x: 0, y: 0, z: -1 } });
  }, [playAudio]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    initAudio,
    playAudio,
    playAIResponseSequence,
    playCommandReceived,
    playProcessingLoop,
    playSuccess,
    playError,
  };
};

const VRSpatialAudio: React.FC<VRSpatialAudioProps> = ({ enabled, onAudioReady }) => {
  const { initAudio } = useVRSpatialAudio();

  useEffect(() => {
    if (enabled) {
      initAudio().then(() => {
        onAudioReady?.();
      });
    }
  }, [enabled, initAudio, onAudioReady]);

  return null; // This is a non-visual component
};

export default VRSpatialAudio;
