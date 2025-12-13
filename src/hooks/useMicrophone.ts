/**
 * AetherHub 2049™ - Microphone Permission Hook
 * Copyright © 2025 Elev8minds LLC. All rights reserved.
 * Unauthorized copying or distribution is strictly prohibited.
 * Contact: legal@elev8minds.com
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type MicPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported' | 'checking';

interface UseMicrophoneOptions {
  autoCheck?: boolean;
  onPermissionChange?: (state: MicPermissionState) => void;
}

interface UseMicrophoneReturn {
  permission: MicPermissionState;
  error: string | null;
  stream: MediaStream | null;
  requestPermission: () => Promise<boolean>;
  releaseStream: () => void;
  isSupported: boolean;
}

/**
 * Hook for managing microphone permissions with reliable incognito/private mode support.
 * 
 * In incognito mode, permissions are not persisted, so we need to:
 * 1. Always request getUserMedia to trigger the permission prompt
 * 2. Handle the stream lifecycle properly
 * 3. Provide clear error messages for different failure scenarios
 */
export function useMicrophone(options: UseMicrophoneOptions = {}): UseMicrophoneReturn {
  const { autoCheck = true, onPermissionChange } = options;
  
  const [permission, setPermission] = useState<MicPermissionState>('checking');
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const permissionListenerRef = useRef<(() => void) | null>(null);

  // Check if Web Speech API and getUserMedia are supported
  const isSupported = typeof window !== 'undefined' && 
    !!(navigator.mediaDevices?.getUserMedia) &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Update permission state and notify
  const updatePermission = useCallback((newState: MicPermissionState) => {
    setPermission(newState);
    onPermissionChange?.(newState);
  }, [onPermissionChange]);

  // Check current permission status
  const checkPermission = useCallback(async () => {
    if (!isSupported) {
      updatePermission('unsupported');
      return;
    }

    try {
      // Try to use Permissions API if available
      if (navigator.permissions?.query) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          updatePermission(result.state as MicPermissionState);
          
          // Set up listener for permission changes
          const handleChange = () => {
            updatePermission(result.state as MicPermissionState);
            if (result.state === 'granted') {
              setError(null);
            }
          };
          
          result.addEventListener('change', handleChange);
          permissionListenerRef.current = () => result.removeEventListener('change', handleChange);
          
          return;
        } catch (e) {
          // Permissions API query failed, fall through to default
        }
      }
      
      // Default to 'prompt' if we can't determine the state
      updatePermission('prompt');
    } catch (e) {
      console.error('Error checking microphone permission:', e);
      updatePermission('prompt');
    }
  }, [isSupported, updatePermission]);

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Microphone is not supported in this browser.');
      updatePermission('unsupported');
      return false;
    }

    setError(null);

    // Release any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }

    try {
      // Request microphone access with optimal settings for speech recognition
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Prefer higher quality for better speech recognition
          sampleRate: { ideal: 48000 },
          channelCount: { ideal: 1 }
        }
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      updatePermission('granted');
      
      return true;
    } catch (err: any) {
      console.error('Microphone permission error:', err);
      
      // Handle different error types with user-friendly messages
      switch (err.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          updatePermission('denied');
          setError('Microphone access was denied. Please allow microphone access in your browser settings or click the microphone icon in the address bar.');
          break;
          
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          setError('No microphone was found. Please connect a microphone and try again.');
          break;
          
        case 'NotReadableError':
        case 'TrackStartError':
          setError('Your microphone is being used by another application. Please close other apps that might be using the microphone.');
          break;
          
        case 'OverconstrainedError':
          setError('Could not find a microphone that meets the requirements. Please try a different microphone.');
          break;
          
        case 'SecurityError':
          setError('Microphone access is blocked due to security restrictions. Please ensure you are using HTTPS.');
          break;
          
        case 'AbortError':
          setError('Microphone access was interrupted. Please try again.');
          break;
          
        default:
          setError(`Failed to access microphone: ${err.message || 'Unknown error'}`);
      }
      
      return false;
    }
  }, [isSupported, updatePermission]);

  // Release the media stream
  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  // Auto-check permission on mount
  useEffect(() => {
    if (autoCheck) {
      checkPermission();
    }

    // Cleanup on unmount
    return () => {
      releaseStream();
      if (permissionListenerRef.current) {
        permissionListenerRef.current();
      }
    };
  }, [autoCheck, checkPermission, releaseStream]);

  return {
    permission,
    error,
    stream,
    requestPermission,
    releaseStream,
    isSupported
  };
}

/**
 * Helper function to create a SpeechRecognition instance with proper configuration
 */
export function createSpeechRecognition(): SpeechRecognition | null {
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognitionAPI) {
    return null;
  }
  
  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;
  
  return recognition;
}

export default useMicrophone;
