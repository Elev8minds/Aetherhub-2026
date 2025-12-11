import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import GlassCard from './GlassCard';
import { VOICE_COMMANDS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface VoiceCommandProps {
  onCommand: (command: string) => void;
}

const VoiceCommand: React.FC<VoiceCommandProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(0.1));
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

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

  const startListening = useCallback(() => {
    setIsListening(true);
    setTranscript('');

    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
        
        if (event.results[current].isFinal) {
          handleCommand(result);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Fallback: simulate voice recognition
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

  const stopListening = () => {
    setIsListening(false);
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
          isListening ? 'bg-magenta-500/20 text-magenta-400 animate-pulse' : 'bg-gray-800 text-gray-400'
        )}>
          {isListening ? 'Listening...' : 'Ready'}
        </span>
      </div>

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
        onClick={isListening ? stopListening : startListening}
        className={cn(
          'w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3',
          isListening
            ? 'bg-magenta-500/20 border border-magenta-500 text-magenta-400 animate-pulse'
            : 'bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 border border-cyan-500/50 text-white hover:border-cyan-400'
        )}
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5" />
            Stop Listening
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
