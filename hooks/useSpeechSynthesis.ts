/**
 * AetherHub 2049™ - Speech Synthesis Hook
 * Copyright © 2025 Elev8minds LLC. All rights reserved.
 * Unauthorized copying or distribution is strictly prohibited.
 * Contact: legal@elev8minds.com
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechOptions {
  pitch?: number;      // 0 to 2, default 1
  rate?: number;       // 0.1 to 10, default 1
  volume?: number;     // 0 to 1, default 1
  voiceName?: string;  // Specific voice name to use
}

interface UseSpeechSynthesisReturn {
  speak: (text: string, options?: SpeechOptions) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice) => void;
}

// Default futuristic voice settings
const FUTURISTIC_DEFAULTS: SpeechOptions = {
  pitch: 0.9,      // Slightly lower for robotic feel
  rate: 1.05,      // Slightly faster for AI feel
  volume: 1,
};

// Preferred voice names for futuristic sound (in order of preference)
const PREFERRED_VOICES = [
  'Google UK English Female',
  'Google UK English Male',
  'Microsoft Zira',
  'Microsoft David',
  'Samantha',
  'Alex',
  'Karen',
  'Daniel',
  'Moira',
  'Tessa',
];

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;

      // Load voices
      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || [];
        setVoices(availableVoices);
        
        // Select the best futuristic voice
        if (availableVoices.length > 0 && !selectedVoice) {
          const preferredVoice = findPreferredVoice(availableVoices);
          setSelectedVoice(preferredVoice);
        }
      };

      // Voices may load asynchronously
      loadVoices();
      
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }

      // Cleanup on unmount
      return () => {
        if (synthRef.current) {
          synthRef.current.cancel();
        }
      };
    }
  }, []);

  // Find the best voice for futuristic sound
  const findPreferredVoice = (availableVoices: SpeechSynthesisVoice[]): SpeechSynthesisVoice => {
    // First, try to find a preferred voice
    for (const preferredName of PREFERRED_VOICES) {
      const voice = availableVoices.find(v => 
        v.name.includes(preferredName) || v.name === preferredName
      );
      if (voice) return voice;
    }

    // Fallback: find any English voice
    const englishVoice = availableVoices.find(v => 
      v.lang.startsWith('en') && v.localService
    );
    if (englishVoice) return englishVoice;

    // Last resort: use the first available voice
    return availableVoices[0];
  };

  // Speak text with futuristic voice
  const speak = useCallback((text: string, options: SpeechOptions = {}) => {
    if (!synthRef.current || !isSupported) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Apply futuristic settings
    const settings = { ...FUTURISTIC_DEFAULTS, ...options };
    utterance.pitch = settings.pitch || 1;
    utterance.rate = settings.rate || 1;
    utterance.volume = settings.volume || 1;

    // Set voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    // Speak
    synthRef.current.speak(utterance);
  }, [isSupported, selectedVoice]);

  // Stop speaking
  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  // Pause speaking
  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
    }
  }, [isSpeaking]);

  // Resume speaking
  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
    }
  }, [isPaused]);

  // Set voice
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    selectedVoice,
    setVoice,
  };
};

// Utility function to format text for better speech
export const formatForSpeech = (text: string): string => {
  return text
    // Replace common crypto abbreviations
    .replace(/ETH/g, 'Ethereum')
    .replace(/BTC/g, 'Bitcoin')
    .replace(/USDC/g, 'U S D C')
    .replace(/USDT/g, 'U S D T')
    .replace(/NFT/g, 'N F T')
    .replace(/DeFi/gi, 'Decentralized Finance')
    .replace(/RWA/g, 'Real World Assets')
    .replace(/APY/g, 'A P Y')
    .replace(/APR/g, 'A P R')
    .replace(/TVL/g, 'Total Value Locked')
    // Format numbers with commas for better speech
    .replace(/\$(\d+),(\d+)/g, '$$$1 thousand $2')
    .replace(/\$(\d+)\.(\d+)M/g, '$$$1 point $2 million')
    .replace(/\$(\d+)\.(\d+)K/g, '$$$1 point $2 thousand')
    // Add pauses for better flow
    .replace(/\./g, '. ')
    .replace(/,/g, ', ')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
};

// Pre-defined responses for common commands
export const AETHER_RESPONSES = {
  greeting: "Hello! I'm Aether, your AI-powered portfolio assistant. How can I help you today?",
  portfolioOptimized: "Portfolio optimization complete. I've identified several opportunities to improve your risk-adjusted returns.",
  swapInitiated: "Swap initiated. Please confirm the transaction in your wallet.",
  netWorthUpdate: (value: string) => `Your current net worth is ${value}. Your portfolio has changed by`,
  commandReceived: "Command received. Processing your request.",
  commandComplete: "Task completed successfully.",
  errorOccurred: "I encountered an error. Please try again or rephrase your command.",
  listening: "I'm listening. What would you like me to do?",
  goodbye: "Goodbye! Your portfolio is in good hands.",
  notUnderstood: "I didn't quite catch that. Could you please repeat your command?",
};

export default useSpeechSynthesis;
