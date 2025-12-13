/**
 * AetherHub 2049™ - Floating Voice Button Component
 * Copyright © 2025 Elev8minds LLC. All rights reserved.
 * 
 * J.A.R.V.I.S.-style voice assistant with ElevenLabs TTS
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJarvisVoice, JARVIS_RESPONSES, formatForJarvisSpeech } from '@/hooks/useJarvisVoice';
import { supabase } from '@/lib/supabase';

interface FloatingVoiceButtonProps {
  onCommand?: (command: string) => void;
}

type MicPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported' | 'checking';

// Portfolio data for AI context
const mockPortfolio = [
  { name: 'Ethereum', symbol: 'ETH', chain: 'ethereum', value: 425000, change24h: 3.2 },
  { name: 'Bitcoin', symbol: 'BTC', chain: 'bitcoin', value: 285000, change24h: 1.8 },
  { name: 'Solana', symbol: 'SOL', chain: 'solana', value: 78000, change24h: 5.4 },
  { name: 'USDC', symbol: 'USDC', chain: 'ethereum', value: 59293, change24h: 0 },
];

const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(false);
  const [micPermission, setMicPermission] = useState<MicPermissionState>('checking');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>(Array(12).fill(0.2));
  const [isMuted, setIsMuted] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // J.A.R.V.I.S. voice hook
  const { 
    speak: speakJarvis, 
    stop: stopJarvis, 
    isSpeaking, 
    isLoading: isVoiceLoading,
    usingFallback,
    isSupported: ttsSupported 
  } = useJarvisVoice();

  // Auto-trigger permission prompt on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      autoRequestPermission();
    }, 1500);

    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);

    return () => {
      clearTimeout(timer);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      stopJarvis();
    };
  }, []);

  // Waveform animation
  useEffect(() => {
    if (!isListening && !isSpeaking && !isVoiceLoading) {
      setWaveform(Array(12).fill(0.2));
      return;
    }

    const interval = setInterval(() => {
      setWaveform(prev => prev.map(() => 0.2 + Math.random() * 0.8));
    }, isSpeaking ? 80 : 100);

    return () => clearInterval(interval);
  }, [isListening, isSpeaking, isVoiceLoading]);

  // Auto-request microphone permission
  const autoRequestPermission = async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMicPermission('unsupported');
        return;
      }

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (result.state === 'granted') {
            setMicPermission('granted');
            return;
          }
          result.addEventListener('change', () => {
            setMicPermission(result.state as MicPermissionState);
          });
        } catch (e) {}
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMicPermission('denied');
      } else {
        setMicPermission('prompt');
      }
    }
  };

  // Request microphone permission
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      setPermissionError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      streamRef.current = stream;
      setMicPermission('granted');
      return true;
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        setPermissionError('Microphone access denied. Click the mic icon in your address bar to allow access.');
      } else if (error.name === 'NotFoundError') {
        setPermissionError('No microphone found.');
      } else {
        setPermissionError(`Microphone error: ${error.message || 'Unknown error'}`);
      }
      return false;
    }
  };

  // Speak with J.A.R.V.I.S. voice
  const speakResponse = useCallback(async (text: string) => {
    if (!ttsSupported || isMuted) {
      console.log('J.A.R.V.I.S.: TTS skipped (muted or unsupported)');
      return;
    }
    console.log('J.A.R.V.I.S.: Speaking response...');
    await speakJarvis(text);
  }, [speakJarvis, ttsSupported, isMuted]);

  // Local fallback response generator (client-side backup)
  const generateLocalFallback = (command: string): string => {
    const cmd = command.toLowerCase();
    
    if (cmd.includes('hello') || cmd.includes('hi') || cmd.includes('hey') || cmd.includes('jarvis') || cmd.includes('aether')) {
      return "Good day, sir. J.A.R.V.I.S. at your service. How may I assist you with your portfolio today?";
    }
    
    if (cmd.includes('bitcoin') || cmd.includes('btc')) {
      return "Bitcoin, sir, is the original cryptocurrency created in 2009 by Satoshi Nakamoto. It operates on a decentralized blockchain network. Your Bitcoin holdings are valued at $285,000 with a 1.8% gain today.";
    }
    
    if (cmd.includes('ethereum') || cmd.includes('eth')) {
      return "Ethereum, sir, is the leading smart contract platform. Your Ethereum holdings are valued at $425,000 with a 3.2% increase today. Shall I explore staking opportunities?";
    }
    
    if (cmd.includes('optimize') || cmd.includes('optimization')) {
      return "Sir, I've analyzed your portfolio. Your Ethereum allocation is currently at 50%, which is above the recommended threshold. I suggest rebalancing 15% into stablecoins for improved risk-adjusted returns.";
    }
    
    if (cmd.includes('swap') || cmd.includes('exchange') || cmd.includes('trade')) {
      return "Opening the swap interface, sir. Please specify the tokens you'd like to exchange, or I can suggest optimal swaps based on your current holdings.";
    }
    
    if (cmd.includes('net worth') || cmd.includes('balance') || cmd.includes('portfolio value') || cmd.includes('total') || cmd.includes('worth')) {
      const total = mockPortfolio.reduce((sum, p) => sum + p.value, 0);
      return `Your current net worth stands at ${total.toLocaleString()} dollars, sir. That represents a 12.4% increase from last month.`;
    }
    
    if (cmd.includes('stake') || cmd.includes('staking')) {
      return "I've identified several staking opportunities for your holdings, sir. Ethereum staking through Lido offers 4.2% APY. Your USDC could earn 8.5% on Aave.";
    }
    
    if (cmd.includes('gas') || cmd.includes('fees')) {
      return "Current gas conditions, sir: Ethereum mainnet is at 25 gwei, Polygon at 30 gwei, and Arbitrum at 0.1 gwei. I recommend Arbitrum for the lowest transaction costs.";
    }
    
    if (cmd.includes('risk') || cmd.includes('analysis')) {
      return "Running risk analysis, sir. Your portfolio risk score is 6.5 out of 10, indicating moderate to high risk. I recommend increasing your stablecoin allocation to reduce overall volatility exposure.";
    }
    
    if (cmd.includes('yield') || cmd.includes('earn') || cmd.includes('interest')) {
      return "I've identified yield opportunities across your holdings, sir. Your idle USDC could earn 8.5% APY on Aave. Your ETH could generate 4.2% through liquid staking.";
    }
    
    if (cmd.includes('help') || cmd.includes('what can you do')) {
      return "I'm at your service, sir. I can optimize your portfolio, execute swaps, check your net worth, find yield opportunities, analyze risk, monitor gas prices, and manage staking positions.";
    }
    
    if (cmd.includes('bye') || cmd.includes('goodbye') || cmd.includes('exit')) {
      return "Very good, sir. I'll be here if you need me.";
    }
    
    if (cmd.includes('thank')) {
      return "You're most welcome, sir. Is there anything else I can help you with?";
    }
    
    return `Processing your request about "${command}", sir. Your portfolio is currently valued at $847,293. How may I assist you further?`;
  };

  // Call Aether AI for response
  const getAIResponse = async (command: string): Promise<string> => {
    console.log('J.A.R.V.I.S.: Getting AI response for:', command);
    
    try {
      console.log('J.A.R.V.I.S.: Calling aether-ai edge function...');
      
      const { data, error } = await supabase.functions.invoke('aether-ai', {
        body: { 
          message: command, 
          portfolio: mockPortfolio,
          context: 'Voice command from J.A.R.V.I.S. interface'
        }
      });

      console.log('J.A.R.V.I.S.: Edge function response:', { data, error });

      if (error) {
        console.error('J.A.R.V.I.S.: Edge function error:', error);
        const fallback = generateLocalFallback(command);
        console.log('J.A.R.V.I.S.: Using local fallback:', fallback.slice(0, 50) + '...');
        return fallback;
      }

      if (data?.response) {
        console.log('J.A.R.V.I.S.: Got AI response, length:', data.response.length, 'source:', data.source);
        return data.response;
      }

      console.log('J.A.R.V.I.S.: No response in data, using local fallback');
      return generateLocalFallback(command);
      
    } catch (err: any) {
      console.error('J.A.R.V.I.S.: Fetch error:', err);
      const fallback = generateLocalFallback(command);
      console.log('J.A.R.V.I.S.: Using local fallback after error:', fallback.slice(0, 50) + '...');
      return fallback;
    }
  };

  const startListening = useCallback(async () => {
    setPermissionError(null);
    setShowTranscriptPanel(true);
    setAiResponse('');
    stopJarvis();
    
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    setIsListening(true);
    setTranscript('');

    // Speak listening prompt
    if (!isMuted && ttsSupported) {
      await speakJarvis(JARVIS_RESPONSES.listening);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const result = event.results[current][0].transcript;
          setTranscript(result);
          console.log('J.A.R.V.I.S.: Heard:', result, 'Final:', event.results[current].isFinal);
          
          if (event.results[current].isFinal) {
            handleCommand(result);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('J.A.R.V.I.S.: Speech recognition error:', event.error);
          setIsListening(false);
          switch (event.error) {
            case 'not-allowed':
              setPermissionError('Microphone access denied.');
              setMicPermission('denied');
              break;
            case 'no-speech':
              setPermissionError('No speech detected. Try again.');
              speakResponse(JARVIS_RESPONSES.noSpeech);
              break;
            case 'audio-capture':
              setPermissionError('No microphone found.');
              break;
            case 'network':
              setPermissionError('Network error.');
              break;
          }
        };

        recognitionRef.current.onend = () => {
          console.log('J.A.R.V.I.S.: Speech recognition ended');
          setIsListening(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        };

        recognitionRef.current.start();
        console.log('J.A.R.V.I.S.: Speech recognition started');
      } catch (error: any) {
        console.error('J.A.R.V.I.S.: Failed to start recognition:', error);
        setIsListening(false);
        setPermissionError('Failed to start voice recognition.');
      }
    } else {
      console.log('J.A.R.V.I.S.: No SpeechRecognition API, using demo mode');
      // Demo fallback
      setTimeout(() => {
        const mockCommands = ['optimize portfolio', 'show net worth', 'what are the gas fees'];
        const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
        setTranscript(randomCommand);
        handleCommand(randomCommand);
      }, 2000);
    }
  }, [speakJarvis, speakResponse, ttsSupported, isMuted, stopJarvis]);

  const handleCommand = useCallback(async (command: string) => {
    const normalizedCommand = command.toLowerCase().replace(/aether,?|jarvis,?/gi, '').trim();
    console.log('J.A.R.V.I.S.: Processing command:', normalizedCommand);
    
    setIsListening(false);
    setIsProcessing(true);
    
    try {
      // Get AI response
      const response = await getAIResponse(normalizedCommand);
      console.log('J.A.R.V.I.S.: Got response, setting state...');
      setAiResponse(response);
      setIsProcessing(false);
      
      // Speak the response with J.A.R.V.I.S. voice
      console.log('J.A.R.V.I.S.: Speaking response...');
      await speakResponse(response);
      
      // Trigger callback
      onCommand?.(normalizedCommand);
    } catch (err: any) {
      console.error('J.A.R.V.I.S.: Command handling error:', err);
      setIsProcessing(false);
      const errorResponse = JARVIS_RESPONSES.error;
      setAiResponse(errorResponse);
      await speakResponse(errorResponse);
    }
  }, [onCommand, speakResponse]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleClick = async () => {
    setShowTooltip(false);
    
    if (isSpeaking || isVoiceLoading) {
      stopJarvis();
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const toggleMute = () => {
    if (isSpeaking) stopJarvis();
    setIsMuted(!isMuted);
  };

  const closePanel = () => {
    stopListening();
    stopJarvis();
    setShowTranscriptPanel(false);
    setTranscript('');
    setAiResponse('');
    setPermissionError(null);
    setIsProcessing(false);
  };

  const isActive = isListening || isSpeaking || isProcessing || isVoiceLoading;
  const buttonColor = isListening 
    ? 'from-magenta-500 to-purple-600 border-magenta-400 shadow-[0_0_40px_rgba(255,0,255,0.5)]'
    : isSpeaking || isVoiceLoading
      ? 'from-cyan-400 to-blue-500 border-cyan-300 shadow-[0_0_50px_rgba(0,240,255,0.6)]'
      : micPermission === 'denied'
        ? 'from-red-600 to-red-800 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.3)]'
        : 'from-cyan-500 to-blue-600 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)]';

  return (
    <>
      {/* Floating Voice Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Tooltip */}
        {showTooltip && !isActive && (
          <div className="absolute bottom-full right-0 mb-3 animate-fade-in">
            <div className="relative bg-gradient-to-r from-cyan-900/90 to-purple-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl px-4 py-3 shadow-[0_0_30px_rgba(0,240,255,0.2)] whitespace-nowrap">
              <p className="text-white text-sm font-medium">Click or say "Aether" to speak</p>
              <p className="text-cyan-400 text-xs mt-1">J.A.R.V.I.S. voice-controlled AI</p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-gradient-to-br from-cyan-900/90 to-purple-900/90 border-r border-b border-cyan-500/30 transform rotate-45" />
            </div>
          </div>
        )}

        {/* Glow rings */}
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          isActive 
            ? isSpeaking || isVoiceLoading
              ? "animate-ping bg-cyan-500/40"
              : "animate-ping bg-magenta-500/30" 
            : "animate-pulse bg-cyan-500/20"
        )} style={{ transform: 'scale(1.5)' }} />
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-700",
          isActive 
            ? isSpeaking || isVoiceLoading
              ? "animate-pulse bg-cyan-500/30"
              : "animate-pulse bg-magenta-500/20" 
            : "bg-cyan-500/10"
        )} style={{ transform: 'scale(2)' }} />
        
        {/* Extra glow for speaking */}
        {(isSpeaking || isVoiceLoading) && (
          <div className="absolute inset-0 rounded-full animate-pulse bg-cyan-400/20" style={{ transform: 'scale(2.5)' }} />
        )}

        {/* Main button */}
        <button
          onClick={handleClick}
          disabled={micPermission === 'unsupported'}
          onMouseEnter={() => !isActive && setShowTooltip(true)}
          onMouseLeave={() => !isActive && setTimeout(() => setShowTooltip(false), 2000)}
          className={cn(
            "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110",
            micPermission === 'unsupported'
              ? "bg-gray-800 border-2 border-gray-700 cursor-not-allowed"
              : `bg-gradient-to-br ${buttonColor} border-2`
          )}
        >
          {isProcessing || isVoiceLoading ? (
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          ) : isListening || isSpeaking ? (
            <div className="flex items-center justify-center gap-0.5">
              {waveform.slice(0, 5).map((height, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all duration-75",
                    isSpeaking ? "bg-white" : "bg-white"
                  )}
                  style={{ height: `${height * 24}px` }}
                />
              ))}
            </div>
          ) : micPermission === 'denied' ? (
            <MicOff className="w-7 h-7 text-white" />
          ) : (
            <Mic className="w-7 h-7 text-white" />
          )}
        </button>

        {/* Status indicator */}
        <div className={cn(
          "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a0f]",
          isSpeaking || isVoiceLoading
            ? "bg-cyan-400 animate-pulse"
            : isListening 
              ? "bg-magenta-400 animate-pulse" 
              : micPermission === 'granted' 
                ? "bg-green-400" 
                : micPermission === 'denied'
                  ? "bg-red-400"
                  : "bg-amber-400"
        )} />

        {/* J.A.R.V.I.S. label when speaking */}
        {(isSpeaking || isVoiceLoading) && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-bold text-cyan-400 bg-black/80 px-2 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              J.A.R.V.I.S.
            </span>
          </div>
        )}

        {/* Mute button */}
        {ttsSupported && (
          <button
            onClick={toggleMute}
            className={cn(
              "absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all",
              "bg-gray-900/90 border border-gray-700 hover:border-cyan-500/50",
              isMuted && "border-red-500/50"
            )}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        )}
      </div>

      {/* Transcript Panel */}
      {showTranscriptPanel && (
        <div className="fixed bottom-28 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.2)] overflow-hidden">
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between px-4 py-3 border-b border-white/10",
              isSpeaking || isVoiceLoading
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
                : "bg-gradient-to-r from-cyan-500/10 to-magenta-500/10"
            )}>
              <div className="flex items-center gap-2">
                {isSpeaking || isVoiceLoading ? (
                  <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
                ) : (
                  <Mic className={cn(
                    "w-5 h-5",
                    isListening ? "text-magenta-400 animate-pulse" : "text-cyan-400"
                  )} />
                )}
                <span className="text-white font-semibold text-sm">
                  {isSpeaking || isVoiceLoading ? 'J.A.R.V.I.S. Speaking' : 'J.A.R.V.I.S.'}
                </span>
                {(isSpeaking || isVoiceLoading) && (
                  <span className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full animate-pulse">
                    {usingFallback ? 'VOICE' : 'LIVE'}
                  </span>
                )}
              </div>
              <button 
                onClick={closePanel}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Waveform */}
              <div className={cn(
                "flex items-center justify-center gap-1 h-12 mb-4 rounded-xl",
                isSpeaking || isVoiceLoading ? "bg-cyan-500/10" : "bg-black/40"
              )}>
                {waveform.map((height, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 rounded-full transition-all duration-75",
                      isSpeaking || isVoiceLoading
                        ? "bg-gradient-to-t from-cyan-500 to-blue-400"
                        : isListening 
                          ? "bg-gradient-to-t from-magenta-500 to-cyan-400" 
                          : "bg-gray-700"
                    )}
                    style={{ height: `${height * 100}%` }}
                  />
                ))}
              </div>

              {/* Status */}
              <div className="text-center mb-3">
                {isProcessing ? (
                  <p className="text-cyan-400 text-sm animate-pulse">Processing, sir...</p>
                ) : isVoiceLoading ? (
                  <p className="text-cyan-400 text-sm animate-pulse">Generating voice...</p>
                ) : isSpeaking ? (
                  <p className="text-cyan-400 text-sm animate-pulse">Speaking...</p>
                ) : isListening ? (
                  <p className="text-magenta-400 text-sm animate-pulse">Listening...</p>
                ) : aiResponse ? (
                  <p className="text-green-400 text-sm">Response complete</p>
                ) : transcript ? (
                  <p className="text-green-400 text-sm">Command received</p>
                ) : permissionError ? (
                  <p className="text-red-400 text-sm">{permissionError}</p>
                ) : (
                  <p className="text-gray-400 text-sm">Ready to assist, sir</p>
                )}
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="p-3 bg-magenta-500/10 border border-magenta-500/30 rounded-xl mb-3">
                  <p className="text-xs text-gray-500 mb-1">You said:</p>
                  <p className="text-magenta-400 font-mono text-sm">{transcript}</p>
                </div>
              )}

              {/* AI Response */}
              {aiResponse && (
                <div className={cn(
                  "p-3 border rounded-xl transition-all max-h-48 overflow-y-auto",
                  isSpeaking || isVoiceLoading
                    ? "bg-cyan-500/10 border-cyan-500/30" 
                    : "bg-blue-500/10 border-blue-500/30"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-gray-500">J.A.R.V.I.S.:</p>
                    {(isSpeaking || isVoiceLoading) && (
                      <div className="flex gap-0.5">
                        {[0, 1, 2].map(i => (
                          <div 
                            key={i} 
                            className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-blue-200 text-sm leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                </div>
              )}

              {/* Quick commands hint */}
              {!transcript && !permissionError && !aiResponse && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-600">Try: "Hello" or "What is Bitcoin?"</p>
                </div>
              )}

              {/* Action buttons */}
              {aiResponse && !isSpeaking && !isVoiceLoading && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => speakResponse(aiResponse)}
                    disabled={isMuted}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                      isMuted
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30"
                    )}
                  >
                    <Volume2 className="w-4 h-4" />
                    Replay
                  </button>
                  <button
                    onClick={startListening}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-magenta-500/20 text-magenta-400 hover:bg-magenta-500/30 border border-magenta-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    New Command
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingVoiceButton;
