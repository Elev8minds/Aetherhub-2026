/**
 * AetherHub 2049™ - Voice Command Component
 * Copyright © 2025 Elev8minds LLC. All rights reserved.
 * Unauthorized copying or distribution is strictly prohibited.
 * Contact: legal@elev8minds.com
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import { VOICE_COMMANDS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface VoiceCommandProps {
  onCommand: (command: string) => void;
}

type MicPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported' | 'checking';

const VoiceCommand: React.FC<VoiceCommandProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(0.1));
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [micPermission, setMicPermission] = useState<MicPermissionState>('checking');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
    
    return () => {
      // Cleanup: stop any active streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Check microphone permission status
  const checkMicrophonePermission = async () => {
    try {
      // Check if Web Speech API is supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMicPermission('unsupported');
        return;
      }

      // Check if permissions API is available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicPermission(result.state as MicPermissionState);
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setMicPermission(result.state as MicPermissionState);
          });
        } catch (e) {
          // Permissions API not fully supported, default to prompt
          setMicPermission('prompt');
        }
      } else {
        // Permissions API not available, default to prompt
        setMicPermission('prompt');
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      setMicPermission('prompt');
    }
  };

  // Request microphone permission explicitly using getUserMedia
  // This is crucial for incognito/private mode where permissions are reset
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      setPermissionError(null);
      
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Request microphone access - this triggers the permission prompt
      // In incognito mode, this will ALWAYS prompt since permissions aren't persisted
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Store the stream reference for cleanup
      streamRef.current = stream;
      
      // Permission granted
      setMicPermission('granted');
      return true;
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        setPermissionError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setPermissionError('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setPermissionError('Microphone is in use by another application. Please close other apps using the microphone.');
      } else if (error.name === 'OverconstrainedError') {
        setPermissionError('Microphone constraints could not be satisfied.');
      } else if (error.name === 'SecurityError') {
        setPermissionError('Microphone access blocked due to security policy. Please use HTTPS.');
      } else {
        setPermissionError(`Microphone error: ${error.message || 'Unknown error'}`);
      }
      
      return false;
    }
  };

  // Simulate waveform animation when listening
  useEffect(() => {
    if (!isListening) {
      setWaveform(Array(20).fill(0.1));
      return;
    }

    const interval = setInterval(() => {
      setWaveform(prev => prev.map(() => 0.1 + Math.random() * 0.9));
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  const startListening = useCallback(async () => {
    setPermissionError(null);
    
    // First, explicitly request microphone permission
    // This is essential for incognito mode where getUserMedia triggers the prompt
    const hasPermission = await requestMicrophonePermission();
    
    if (!hasPermission) {
      return;
    }

    setIsListening(true);
    setTranscript('');

    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        // Create new recognition instance
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
        };

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const result = event.results[current][0].transcript;
          setTranscript(result);
          
          if (event.results[current].isFinal) {
            handleCommand(result);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          switch (event.error) {
            case 'not-allowed':
              setPermissionError('Microphone access denied. Please allow microphone access and try again.');
              setMicPermission('denied');
              break;
            case 'no-speech':
              setPermissionError('No speech detected. Please try again.');
              break;
            case 'audio-capture':
              setPermissionError('No microphone found. Please connect a microphone.');
              break;
            case 'network':
              setPermissionError('Network error. Please check your connection.');
              break;
            case 'aborted':
              // User aborted, no error message needed
              break;
            default:
              setPermissionError(`Speech recognition error: ${event.error}`);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          // Stop the media stream to release the microphone
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        };

        // Start recognition
        recognitionRef.current.start();
      } catch (error: any) {
        console.error('Failed to start speech recognition:', error);
        setIsListening(false);
        setPermissionError('Failed to start speech recognition. Please try again.');
      }
    } else {
      // Fallback: simulate voice recognition for demo purposes
      setTimeout(() => {
        const mockCommands = ['optimize portfolio', 'show net worth', 'earn 10% risk-free'];
        const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
        setTranscript(`Aether, ${randomCommand}`);
        handleCommand(randomCommand);
      }, 2000);
    }
  }, []);

  const handleCommand = (command: string) => {
    const normalizedCommand = command.toLowerCase().replace('aether,', '').replace('aether', '').trim();
    setCommandHistory(prev => [normalizedCommand, ...prev.slice(0, 4)]);
    onCommand(normalizedCommand);
    setIsListening(false);
  };

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    setIsListening(false);
    
    // Release microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Handle initial permission request on first mic button click
  const handleMicClick = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  return (
    <GlassCard glowColor="magenta" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-magenta-400" />
          Voice Command Center
        </h3>
        <span className={cn(
          'text-xs px-2 py-1 rounded-full',
          isListening ? 'bg-magenta-500/20 text-magenta-400 animate-pulse' : 
          micPermission === 'denied' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-800 text-gray-400'
        )}>
          {isListening ? 'Listening...' : 
           micPermission === 'denied' ? 'Permission Denied' :
           micPermission === 'unsupported' ? 'Not Supported' :
           'Ready'}
        </span>
      </div>

      {/* Permission Error Alert */}
      {permissionError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-400">{permissionError}</p>
            {micPermission === 'denied' && (
              <p className="text-xs text-gray-500 mt-1">
                In incognito mode, you may need to click the microphone icon in the address bar to allow access.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Waveform Visualizer */}
      <div className="flex items-center justify-center gap-1 h-16 mb-4 bg-black/30 rounded-xl p-4">
        {waveform.map((height, i) => (
          <div
            key={i}
            className={cn(
              'w-1 rounded-full transition-all duration-100',
              isListening ? 'bg-gradient-to-t from-magenta-500 to-cyan-400' : 'bg-gray-700'
            )}
            style={{ height: `${height * 100}%` }}
          />
        ))}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mb-4 p-3 bg-black/30 rounded-lg border border-cyan-500/20">
          <p className="text-sm text-gray-400 mb-1">Heard:</p>
          <p className="text-cyan-400 font-mono">{transcript}</p>
        </div>
      )}

      {/* Voice Button */}
      <button
        onClick={handleMicClick}
        disabled={micPermission === 'unsupported'}
        className={cn(
          'w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3',
          micPermission === 'unsupported'
            ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
            : isListening
              ? 'bg-magenta-500/20 border border-magenta-500 text-magenta-400 animate-pulse'
              : micPermission === 'denied'
                ? 'bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20'
                : 'bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 border border-cyan-500/50 text-white hover:border-cyan-400'
        )}
      >
        {micPermission === 'unsupported' ? (
          <>
            <MicOff className="w-5 h-5" />
            Voice Not Supported
          </>
        ) : isListening ? (
          <>
            <MicOff className="w-5 h-5" />
            Stop Listening
          </>
        ) : micPermission === 'denied' ? (
          <>
            <Mic className="w-5 h-5" />
            Click to Request Mic Access
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            "Aether, optimize my portfolio"
          </>
        )}
      </button>

      {/* Quick Commands */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Quick Commands:</p>
        <div className="flex flex-wrap gap-2">
          {VOICE_COMMANDS.slice(0, 4).map((cmd, i) => (
            <button
              key={i}
              onClick={() => handleCommand(cmd.command)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
            >
              {cmd.command}
            </button>
          ))}
        </div>
      </div>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 mb-2">Recent Commands:</p>
          <div className="space-y-1">
            {commandHistory.map((cmd, i) => (
              <div key={i} className="text-xs text-gray-600 font-mono flex items-center gap-2">
                <span className="text-cyan-500/50">&gt;</span>
                {cmd}
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default VoiceCommand;
