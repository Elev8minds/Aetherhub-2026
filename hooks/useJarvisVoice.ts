/**
 * AetherHub 2049™ - J.A.R.V.I.S. Voice Hook
 * Copyright © 2025 Elev8minds LLC. All rights reserved.
 * 
 * Premium J.A.R.V.I.S.-style voice using ElevenLabs TTS API
 * with Web Speech API fallback for maximum compatibility
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// ElevenLabs API Configuration - Full write/generation access
const ELEVENLABS_API_KEY = 'sk_7e32a091417a3d978abe8b6551daa7ed242b295fad9c4a5c';
const ELEVENLABS_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam - British male voice for J.A.R.V.I.S.
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

interface JarvisVoiceState {
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
  usingFallback: boolean;
}

interface JarvisVoiceOptions {
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

// Format text for better speech output - J.A.R.V.I.S. style
export const formatForJarvisSpeech = (text: string): string => {
  return text
    // Remove markdown formatting
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/`/g, '')
    .replace(/\|/g, '')
    .replace(/-{3,}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
    // Convert crypto abbreviations for natural speech
    .replace(/\bETH\b/g, 'Ethereum')
    .replace(/\bBTC\b/g, 'Bitcoin')
    .replace(/\bSOL\b/g, 'Solana')
    .replace(/\bMATIC\b/g, 'Polygon')
    .replace(/\bAVAX\b/g, 'Avalanche')
    .replace(/\bUSDC\b/g, 'U S D C')
    .replace(/\bUSDT\b/g, 'Tether')
    .replace(/\bDAI\b/g, 'Dai')
    .replace(/\bAPY\b/g, 'A P Y')
    .replace(/\bAPR\b/g, 'A P R')
    .replace(/\bTVL\b/g, 'total value locked')
    .replace(/\bDeFi\b/gi, 'decentralized finance')
    .replace(/\bNFT\b/g, 'N F T')
    .replace(/\bNFTs\b/g, 'N F Ts')
    .replace(/\bRWA\b/g, 'real world assets')
    .replace(/\bgwei\b/gi, 'gway')
    .replace(/\bwei\b/gi, 'way')
    // Format numbers for speech
    .replace(/\$([0-9,]+(\.[0-9]+)?)/g, '$1 dollars')
    .replace(/(\d+)%/g, '$1 percent')
    .replace(/(\d+)x/g, '$1 times')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

// J.A.R.V.I.S. style responses - calm, confident, British-accented tone
export const JARVIS_RESPONSES = {
  greeting: "Good day, sir. J.A.R.V.I.S. at your service. How may I assist you with your portfolio today?",
  listening: "I'm listening, sir.",
  processing: "Processing your request, sir. One moment.",
  error: "I apologize, sir. I've encountered a minor technical difficulty. Please try again.",
  goodbye: "Very good, sir. I'll be here if you need me.",
  noSpeech: "I didn't quite catch that, sir. Would you mind repeating?",
  optimizing: "Analyzing your portfolio for optimization opportunities, sir.",
  swapping: "Initiating the swap protocol, sir. Please confirm when ready.",
  analyzing: "Running comprehensive analysis now, sir.",
  success: "Task completed successfully, sir.",
  warning: "Sir, I should bring something to your attention.",
  ready: "Systems online. Ready for your command, sir.",
  thinking: "Allow me a moment to process that, sir.",
  confirmation: "Understood, sir. Executing now.",
};

export const useJarvisVoice = () => {
  const [state, setState] = useState<JarvisVoiceState>({
    isSpeaking: false,
    isLoading: false,
    error: null,
    usingFallback: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize Web Speech API as fallback
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      
      // Pre-load voices
      const loadVoices = () => {
        synthRef.current?.getVoices();
      };
      
      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
    
    return () => {
      stop();
    };
  }, []);

  // Find the best British male voice for J.A.R.V.I.S. fallback
  const getBritishVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!synthRef.current) return null;
    
    const voices = synthRef.current.getVoices();
    
    // Priority order for J.A.R.V.I.S.-like voices
    const voicePreferences = [
      // Premium British male voices
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('daniel') && v.lang.includes('en-GB'),
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('james') && v.lang.includes('en-GB'),
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('oliver') && v.lang.includes('en-GB'),
      // Any British English male
      (v: SpeechSynthesisVoice) => v.lang.includes('en-GB') && v.name.toLowerCase().includes('male'),
      // Any British English
      (v: SpeechSynthesisVoice) => v.lang.includes('en-GB'),
      // Daniel voice (any region)
      (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('daniel'),
      // Any English voice with "male" in name
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'),
      // Fallback to any English voice
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
    ];
    
    for (const preference of voicePreferences) {
      const voice = voices.find(preference);
      if (voice) return voice;
    }
    
    return voices[0] || null;
  }, []);

  // Speak using Web Speech API (fallback)
  const speakWithWebSpeech = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!synthRef.current) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure for J.A.R.V.I.S.-like voice
      utterance.pitch = 0.92;  // Slightly lower for gravitas
      utterance.rate = 1.0;    // Measured, confident pace
      utterance.volume = 1.0;

      // Get the best British voice
      const britishVoice = getBritishVoice();
      if (britishVoice) {
        utterance.voice = britishVoice;
        console.log('J.A.R.V.I.S. fallback using voice:', britishVoice.name);
      }

      utterance.onstart = () => {
        setState(prev => ({ ...prev, isSpeaking: true, isLoading: false, usingFallback: true }));
      };

      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        resolve();
      };

      utterance.onerror = (event) => {
        setState(prev => ({ ...prev, isSpeaking: false, isLoading: false }));
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.error('Web Speech error:', event.error);
          reject(new Error(event.error));
        } else {
          resolve();
        }
      };

      synthRef.current.speak(utterance);
    });
  }, [getBritishVoice]);

  // Speak using ElevenLabs J.A.R.V.I.S. voice (primary) - Direct API call
  const speak = useCallback(async (
    text: string, 
    options: JarvisVoiceOptions = {}
  ): Promise<void> => {
    if (!text || text.trim().length === 0) return;

    // Stop any current speech
    stop();

    setState(prev => ({ ...prev, isLoading: true, error: null, usingFallback: false }));

    const formattedText = formatForJarvisSpeech(text);
    console.log('J.A.R.V.I.S. speaking:', formattedText.slice(0, 100) + '...');

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Call ElevenLabs API directly with full access key
      const response = await fetch(`${ELEVENLABS_API_URL}/${ELEVENLABS_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: formattedText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: options.stability ?? 0.75,
            similarity_boost: options.similarityBoost ?? 0.80,
            style: options.style ?? 0.0,
            use_speaker_boost: options.useSpeakerBoost ?? true,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('ElevenLabs API error:', response.status, errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      // Get audio blob directly from response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create audio element
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = 1.0;

      // Set up audio event handlers
      audioRef.current.onplay = () => {
        console.log('J.A.R.V.I.S.: Playing ElevenLabs premium voice');
        setState(prev => ({ ...prev, isSpeaking: true, isLoading: false, usingFallback: false }));
      };

      audioRef.current.onended = () => {
        console.log('J.A.R.V.I.S.: Audio playback complete');
        setState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
      };

      audioRef.current.onerror = async (e) => {
        console.warn('J.A.R.V.I.S.: Audio playback failed, using fallback', e);
        URL.revokeObjectURL(audioUrl);
        setState(prev => ({ ...prev, isLoading: false }));
        await speakWithWebSpeech(formattedText);
      };

      // Play the audio
      await audioRef.current.play();

    } catch (err: any) {
      // Check if it was aborted
      if (err.name === 'AbortError') {
        setState(prev => ({ ...prev, isLoading: false, isSpeaking: false }));
        return;
      }

      console.warn('J.A.R.V.I.S. ElevenLabs error, using Web Speech fallback:', err);
      setState(prev => ({ ...prev, isLoading: false }));
      
      // Fallback to Web Speech API
      try {
        await speakWithWebSpeech(formattedText);
      } catch (fallbackErr) {
        console.error('J.A.R.V.I.S.: All voice synthesis failed:', fallbackErr);
        setState(prev => ({ 
          ...prev, 
          error: 'Voice synthesis unavailable',
          isSpeaking: false,
          isLoading: false
        }));
      }
    }
  }, [speakWithWebSpeech]);

  // Stop speaking
  const stop = useCallback(() => {
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Stop Web Speech API
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    // Abort any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState(prev => ({ ...prev, isSpeaking: false, isLoading: false }));
  }, []);

  // Pause speaking
  const pause = useCallback(() => {
    if (state.usingFallback && synthRef.current) {
      synthRef.current.pause();
    }
    if (!state.usingFallback && audioRef.current) {
      audioRef.current.pause();
    }
  }, [state.usingFallback]);

  // Resume speaking
  const resume = useCallback(() => {
    if (state.usingFallback && synthRef.current) {
      synthRef.current.resume();
    }
    if (!state.usingFallback && audioRef.current) {
      audioRef.current.play();
    }
  }, [state.usingFallback]);

  // Speak a pre-defined J.A.R.V.I.S. response
  const speakResponse = useCallback(async (responseKey: keyof typeof JARVIS_RESPONSES) => {
    const text = JARVIS_RESPONSES[responseKey];
    if (text) {
      await speak(text);
    }
  }, [speak]);

  return {
    speak,
    stop,
    pause,
    resume,
    speakResponse,
    isSpeaking: state.isSpeaking,
    isLoading: state.isLoading,
    error: state.error,
    usingFallback: state.usingFallback,
    isSupported: typeof window !== 'undefined' && (!!window.speechSynthesis || true),
    JARVIS_RESPONSES,
  };
};
