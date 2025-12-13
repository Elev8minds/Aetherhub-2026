/**
 * AetherHub 2049™ - VR AI Interface Component
 * Copyright © 2025 Elev8minds LLC. All rights reserved.
 * 
 * J.A.R.V.I.S.-style voice assistant with ElevenLabs TTS
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useVRContext } from '@/contexts/VRContext';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { PORTFOLIO_ASSETS } from '@/lib/constants';
import VRAITextPanel from './VRAITextPanel';
import { useVRSpatialAudio } from './VRSpatialAudio';
import { useJarvisVoice, JARVIS_RESPONSES } from '@/hooks/useJarvisVoice';
import GlassCard from './GlassCard';
import {
  Mic, MicOff, Brain, Sparkles, Send, Loader2,
  Volume2, VolumeX, Glasses, Settings, ArrowRightLeft,
  TrendingUp, Shield, Zap, MessageSquare, Hand, AlertCircle
} from 'lucide-react';

interface AIMessage {
  id: string;
  content: string;
  type: 'response' | 'recommendation' | 'action' | 'warning' | 'success';
  actions?: Array<{ type: string; label: string; onClick?: () => void }>;
  timestamp: Date;
  position?: { x: number; y: number; z: number };
  isProcessing?: boolean;
}

interface VRAIInterfaceProps {
  onSwapRequest?: (from: string, to: string, amount: number) => void;
  onOptimizeRequest?: () => void;
}

type MicPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported' | 'checking';

const VRAIInterface: React.FC<VRAIInterfaceProps> = ({
  onSwapRequest,
  onOptimizeRequest
}) => {
  const { isVRActive, isVRSupported, zkProofEnabled, logAuditEvent, enterVR, exitVR } = useVRContext();
  const { hideBalances } = useAppContext();
  const { 
    playAIResponseSequence, 
    playCommandReceived, 
    playProcessingLoop,
    playSuccess,
    playError 
  } = useVRSpatialAudio();

  // J.A.R.V.I.S. voice hook for AI voice responses
  const { 
    speak: speakJarvis, 
    stop: stopJarvis, 
    isSpeaking, 
    isLoading: isVoiceLoading,
    usingFallback,
    isSupported: ttsSupported 
  } = useJarvisVoice();

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true); // J.A.R.V.I.S. voice toggle
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(0.1));
  const [gestureMode, setGestureMode] = useState(false);
  const [panelLayout, setPanelLayout] = useState<'arc' | 'stack' | 'float'>('arc');
  const [micPermission, setMicPermission] = useState<MicPermissionState>('checking');
  const [permissionError, setPermissionError] = useState<string | null>(null);


  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
    
    return () => {
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

  // Waveform animation when listening or speaking
  useEffect(() => {
    if (!isListening && !isSpeaking && !isVoiceLoading) {
      setWaveform(Array(20).fill(0.1));
      return;
    }

    const interval = setInterval(() => {
      setWaveform(prev => prev.map(() => 0.1 + Math.random() * 0.9));
    }, isSpeaking || isVoiceLoading ? 80 : 100);

    return () => clearInterval(interval);
  }, [isListening, isSpeaking, isVoiceLoading]);

  // Check microphone permission status
  const checkMicrophonePermission = async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMicPermission('unsupported');
        return;
      }

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicPermission(result.state as MicPermissionState);
          
          result.addEventListener('change', () => {
            setMicPermission(result.state as MicPermissionState);
            if (result.state === 'granted') {
              setPermissionError(null);
            }
          });
        } catch (e) {
          setMicPermission('prompt');
        }
      } else {
        setMicPermission('prompt');
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      setMicPermission('prompt');
    }
  };

  // Request microphone permission explicitly
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
      console.error('Microphone permission error:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        setPermissionError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setPermissionError('No microphone found. Please connect a microphone and try again.');
      } else {
        setPermissionError(`Microphone error: ${error.message || 'Unknown error'}`);
      }
      
      return false;
    }
  };

  // Speak AI response with J.A.R.V.I.S. voice
  const speakResponse = useCallback(async (text: string) => {
    if (!ttsSupported || !ttsEnabled) return;
    await speakJarvis(text);
  }, [speakJarvis, ttsSupported, ttsEnabled]);


  // Process AI query
  const processAIQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsProcessing(true);
    if (audioEnabled) playProcessingLoop();

    // Add processing message
    const processingId = `processing-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: processingId,
      content: '',
      type: 'response',
      timestamp: new Date(),
      isProcessing: true
    }]);

    // Log audit event
    logAuditEvent('VR_AI_QUERY', { 
      query: zkProofEnabled ? '[REDACTED]' : query,
      vrMode: isVRActive 
    });

    try {
      // Prepare portfolio context
      const portfolio = PORTFOLIO_ASSETS.map(a => ({
        name: a.name,
        symbol: a.symbol,
        chain: a.chain,
        value: zkProofEnabled ? 0 : a.value,
        change24h: a.change24h
      }));

      const totalValue = zkProofEnabled ? 0 : PORTFOLIO_ASSETS.reduce((sum, a) => sum + a.value, 0);

      // Call Aether AI
      const { data, error } = await supabase.functions.invoke('aether-ai', {
        body: {
          message: query,
          portfolio,
          context: `Total portfolio value: ${zkProofEnabled ? '[ZK-PROTECTED]' : `$${totalValue.toLocaleString()}`}. VR Mode: ${isVRActive ? 'Active' : 'Inactive'}. Voice command interface enabled.`
        }
      });

      if (error) throw error;

      const responseText = data.response || 'I processed your request.';

      // Remove processing message and add response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== processingId);
        return [...filtered, {
          id: `response-${Date.now()}`,
          content: responseText,
          type: determineMessageType(query, data),
          actions: data.actions || [],
          timestamp: new Date()
        }];
      });

      if (audioEnabled) playAIResponseSequence();
      
      // Speak the AI response with TTS
      speakResponse(responseText);
      
      logAuditEvent('VR_AI_RESPONSE', { 
        success: true,
        hasActions: (data.actions?.length || 0) > 0
      });

    } catch (error) {
      console.error('AI Error:', error);
      
      const errorMessage = 'I encountered an issue processing your request. Please try again.';
      
      // Remove processing and add error message
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== processingId);
        return [...filtered, {
          id: `error-${Date.now()}`,
          content: errorMessage,
          type: 'warning',
          timestamp: new Date()
        }];
      });

      if (audioEnabled) playError();
      
      // Speak error message
      speakResponse(errorMessage);
      
      logAuditEvent('VR_AI_ERROR', { error: String(error) });
    } finally {
      setIsProcessing(false);
    }
  }, [audioEnabled, isVRActive, zkProofEnabled, logAuditEvent, playAIResponseSequence, playProcessingLoop, playError, speakResponse]);


  // Determine message type based on query and response
  const determineMessageType = (query: string, data: any): AIMessage['type'] => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('swap') || lowerQuery.includes('trade') || lowerQuery.includes('exchange')) {
      return 'action';
    }
    if (lowerQuery.includes('optimize') || lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      return 'recommendation';
    }
    if (lowerQuery.includes('risk') || lowerQuery.includes('warning') || lowerQuery.includes('alert')) {
      return 'warning';
    }
    if (data.actions?.some((a: any) => a.type === 'success')) {
      return 'success';
    }
    return 'response';
  };

  // Start voice recognition with explicit permission request
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
    if (audioEnabled) playCommandReceived();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('VR AI: Speech recognition started');
        };

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const result = event.results[current][0].transcript;
          setTranscript(result);
          
          if (event.results[current].isFinal) {
            processAIQuery(result);
            setIsListening(false);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('VR AI: Speech recognition error:', event.error);
          setIsListening(false);
          if (audioEnabled) playError();
          
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

        recognitionRef.current.start();
      } catch (error: any) {
        console.error('VR AI: Failed to start speech recognition:', error);
        setIsListening(false);
        setPermissionError('Failed to start speech recognition. Please try again.');
      }
    } else {
      // Fallback demo
      setTimeout(() => {
        const demoCommands = [
          'What is my portfolio performance?',
          'Swap 1 ETH to USDC',
          'Optimize my portfolio for lower risk',
          'Show me yield opportunities'
        ];
        const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
        setTranscript(randomCommand);
        processAIQuery(randomCommand);
        setIsListening(false);
      }, 2000);
    }

    logAuditEvent('VR_VOICE_STARTED', { vrMode: isVRActive });
  }, [audioEnabled, isVRActive, logAuditEvent, playCommandReceived, playError, processAIQuery]);

  // Stop listening
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

  // Handle mic button click
  const handleMicClick = async () => {
    if (isListening) {
      stopListening();
    } else if (!isProcessing) {
      await startListening();
    }
  };

  // Handle text submit
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !isProcessing) {
      processAIQuery(textInput);
      setTextInput('');
    }
  };

  // Handle action click from AI panel
  const handleActionClick = useCallback((action: string, messageId: string) => {
    if (audioEnabled) playSuccess();
    
    switch (action) {
      case 'swap':
        onSwapRequest?.('ETH', 'USDC', 1);
        break;
      case 'optimize':
      case 'rebalance':
        onOptimizeRequest?.();
        break;
      default:
        processAIQuery(`Execute ${action} action`);
    }

    logAuditEvent('VR_AI_ACTION_CLICKED', { action, messageId });
  }, [audioEnabled, logAuditEvent, onSwapRequest, onOptimizeRequest, playSuccess, processAIQuery]);

  // Dismiss message
  const handleDismiss = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  // Quick commands
  const quickCommands = [
    { label: 'Portfolio Status', command: 'What is my current portfolio status and performance?', icon: TrendingUp },
    { label: 'Swap Assets', command: 'I want to swap some of my ETH to USDC', icon: ArrowRightLeft },
    { label: 'Optimize', command: 'Analyze and optimize my portfolio for better returns', icon: Sparkles },
    { label: 'Risk Analysis', command: 'Provide a risk analysis of my current holdings', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* VR AI Header */}
      <GlassCard glowColor="purple" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br from-purple-500 to-cyan-500',
                isVRActive && 'animate-pulse'
              )}>
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className={cn(
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black',
                isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-green-400'
              )} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Aether VR AI
                {isVRActive && <Glasses className="w-5 h-5 text-cyan-400" />}
              </h2>
              <p className="text-sm text-gray-500">
                {isVRActive ? 'Immersive Mode Active' : 'Voice & Text Interface'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={cn(
                'p-3 rounded-xl border transition-all',
                audioEnabled
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                  : 'bg-black/50 border-white/10 text-gray-500'
              )}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Gesture Mode Toggle */}
            <button
              onClick={() => setGestureMode(!gestureMode)}
              className={cn(
                'p-3 rounded-xl border transition-all',
                gestureMode
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'bg-black/50 border-white/10 text-gray-500'
              )}
              title="Gesture Control"
            >
              <Hand className="w-5 h-5" />
            </button>

            {/* VR Toggle */}
            {isVRSupported && (
              <button
                onClick={isVRActive ? exitVR : enterVR}
                className={cn(
                  'p-3 rounded-xl border transition-all',
                  isVRActive
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 animate-pulse'
                    : 'bg-black/50 border-white/10 text-gray-500 hover:text-white'
                )}
              >
                <Glasses className="w-5 h-5" />
              </button>
            )}

            {/* Layout Toggle (VR only) */}
            {isVRActive && (
              <button
                onClick={() => {
                  const layouts: ('arc' | 'stack' | 'float')[] = ['arc', 'stack', 'float'];
                  const currentIndex = layouts.indexOf(panelLayout);
                  setPanelLayout(layouts[(currentIndex + 1) % layouts.length]);
                }}
                className="p-3 rounded-xl bg-black/50 border border-white/10 text-gray-500 hover:text-white transition-all"
                title={`Layout: ${panelLayout}`}
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
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

        {/* Voice Interface */}
        <div className="mb-6">
          {/* Waveform Visualizer */}
          <div className={cn(
            'flex items-center justify-center gap-1 h-20 mb-4 rounded-xl p-4 transition-all',
            isListening 
              ? 'bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 border border-cyan-500/30' 
              : 'bg-black/30 border border-white/5'
          )}>
            {waveform.map((height, i) => (
              <motion.div
                key={i}
                className={cn(
                  'w-1.5 rounded-full transition-all duration-100',
                  isListening 
                    ? 'bg-gradient-to-t from-purple-500 to-cyan-400' 
                    : 'bg-gray-700'
                )}
                animate={{ height: `${height * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>

          {/* Transcript Display */}
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-4 p-4 bg-black/30 rounded-xl border border-cyan-500/20"
              >
                <p className="text-xs text-gray-500 mb-1">Heard:</p>
                <p className="text-cyan-400 font-mono">{transcript}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Button */}
          <button
            onClick={handleMicClick}
            disabled={isProcessing || micPermission === 'unsupported'}
            className={cn(
              'w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3',
              micPermission === 'unsupported'
                ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                : isListening
                  ? 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border-2 border-cyan-500 text-cyan-400 animate-pulse'
                  : isProcessing
                    ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                    : micPermission === 'denied'
                      ? 'bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20'
                      : 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/50 text-white hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]'
            )}
          >
            {micPermission === 'unsupported' ? (
              <>
                <MicOff className="w-6 h-6" />
                Voice Not Supported
              </>
            ) : isListening ? (
              <>
                <MicOff className="w-6 h-6" />
                Tap to Stop
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing...
              </>
            ) : micPermission === 'denied' ? (
              <>
                <Mic className="w-6 h-6" />
                Click to Request Mic Access
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                {isVRActive ? '"Aether, optimize my portfolio"' : 'Tap to Speak'}
              </>
            )}
          </button>
        </div>

        {/* Text Input */}
        <form onSubmit={handleTextSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type your question..."
              disabled={isProcessing}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!textInput.trim() || isProcessing}
            className={cn(
              'px-6 rounded-xl transition-all flex items-center justify-center',
              textInput.trim() && !isProcessing
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            )}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        {/* Quick Commands */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-3">Quick Commands:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickCommands.map((cmd, i) => (
              <button
                key={i}
                onClick={() => processAIQuery(cmd.command)}
                disabled={isProcessing}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm',
                  'bg-white/5 border border-white/10',
                  'text-gray-400 hover:text-white hover:border-purple-500/50',
                  'transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <cmd.icon className="w-4 h-4" />
                {cmd.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* AI Response Panels */}
      <GlassCard glowColor={isVRActive ? 'cyan' : undefined} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Responses
            {isVRActive && (
              <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
                3D View
              </span>
            )}
          </h3>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        <VRAITextPanel
          messages={messages}
          onDismiss={handleDismiss}
          onActionClick={handleActionClick}
          isVRMode={isVRActive}
          spatialLayout={panelLayout}
        />
      </GlassCard>

      {/* VR Status Indicators */}
      {isVRActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Glasses className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">VR Active</span>
            </div>
            <p className="text-xs text-gray-500">Immersive mode enabled</p>
          </div>
          
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Spatial Audio</span>
            </div>
            <p className="text-xs text-gray-500">{audioEnabled ? 'Enabled' : 'Disabled'}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">ZK Privacy</span>
            </div>
            <p className="text-xs text-gray-500">{zkProofEnabled ? 'Protected' : 'Standard'}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VRAIInterface;
