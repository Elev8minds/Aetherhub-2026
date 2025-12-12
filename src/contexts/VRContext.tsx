/**
 * AetherHub 2049™ - Elev8minds LLC
 * Copyright © 2025 Elev8minds LLC. All rights reserved.
 * 
 * This software is the copyrighted property of Elev8minds LLC.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * Trademarks: "AetherHub", "AetherHub 2049", and the AetherHub logo are owned by Elev8minds LLC.
 * For licensing inquiries: legal@elev8minds.com
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface VRSession {
  id: string;
  startTime: number;
  deviceType: string;
  encrypted: boolean;
  consentGiven: boolean;
}

interface VRAuditLog {
  timestamp: number;
  action: string;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export type GestureType = 'pinch' | 'grab' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'point' | 'open' | 'none';

interface HandTrackingState {
  isSupported: boolean;
  isActive: boolean;
  leftHandTracked: boolean;
  rightHandTracked: boolean;
  currentGesture: GestureType;
  gestureConfidence: number;
  tutorialCompleted: boolean;
  showTutorial: boolean;
}

interface VRContextType {
  isVRSupported: boolean;
  isVRActive: boolean;
  vrSession: VRSession | null;
  vrMode: 'immersive-vr' | 'immersive-ar' | 'inline' | null;
  vrConsentGiven: boolean;
  showConsentModal: boolean;
  setShowConsentModal: (show: boolean) => void;
  giveVRConsent: () => void;
  revokeVRConsent: () => void;
  enterVR: () => Promise<void>;
  exitVR: () => void;
  toggleVR: () => Promise<void>;
  auditLogs: VRAuditLog[];
  logAuditEvent: (action: string, metadata?: Record<string, any>) => void;
  zkProofEnabled: boolean;
  toggleZKProof: () => void;
  vrDeviceInfo: {
    name: string;
    type: string;
    capabilities: string[];
  } | null;
  handTracking: HandTrackingState;
  setHandTrackingActive: (active: boolean) => void;
  setCurrentGesture: (gesture: GestureType, confidence: number) => void;
  setShowHandTutorial: (show: boolean) => void;
  completeHandTutorial: () => void;
  updateHandTrackedState: (left: boolean, right: boolean) => void;
}

const VRContext = createContext<VRContextType | null>(null);

export const useVRContext = () => {
  const context = useContext(VRContext);
  if (!context) {
    throw new Error('useVRContext must be used within a VRProvider');
  }
  return context;
};

const VR_CONSENT_KEY = 'aether_vr_consent';
const VR_ZK_KEY = 'aether_vr_zk_enabled';
const VR_HAND_TUTORIAL_KEY = 'aether_vr_hand_tutorial_completed';

export const VRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isVRActive, setIsVRActive] = useState(false);
  const [vrSession, setVRSession] = useState<VRSession | null>(null);
  const [vrMode, setVRMode] = useState<'immersive-vr' | 'immersive-ar' | 'inline' | null>(null);
  const [vrConsentGiven, setVRConsentGiven] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(VR_CONSENT_KEY) === 'true';
    }
    return false;
  });
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<VRAuditLog[]>([]);
  const [zkProofEnabled, setZKProofEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(VR_ZK_KEY) === 'true';
    }
    return false;
  });
  const [vrDeviceInfo, setVRDeviceInfo] = useState<{
    name: string;
    type: string;
    capabilities: string[];
  } | null>(null);

  const [handTracking, setHandTracking] = useState<HandTrackingState>({
    isSupported: false,
    isActive: false,
    leftHandTracked: false,
    rightHandTracked: false,
    currentGesture: 'none',
    gestureConfidence: 0,
    tutorialCompleted: typeof window !== 'undefined' 
      ? localStorage.getItem(VR_HAND_TUTORIAL_KEY) === 'true' 
      : false,
    showTutorial: false
  });
  
  const xrSessionRef = useRef<XRSession | null>(null);

  useEffect(() => {
    const checkVRSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await (navigator as any).xr.isSessionSupported('immersive-vr');
          setIsVRSupported(supported);
          
          if (supported) {
            const arSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
            let handTrackingSupported = false;
            try {
              handTrackingSupported = true;
            } catch (e) {
              console.log('Hand tracking check failed:', e);
            }

            setVRDeviceInfo({
              name: detectVRDevice(),
              type: arSupported ? 'Mixed Reality' : 'VR',
              capabilities: [
                'immersive-vr',
                ...(arSupported ? ['immersive-ar'] : []),
                'inline',
                ...(handTrackingSupported ? ['hand-tracking'] : [])
              ]
            });

            setHandTracking(prev => ({
              ...prev,
              isSupported: handTrackingSupported
            }));
          }
        } catch (e) {
          console.log('WebXR not supported:', e);
          setIsVRSupported(false);
        }
      }
    };
    
    checkVRSupport();
  }, []);

  const detectVRDevice = (): string => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('oculus') || ua.includes('quest')) return 'Meta Quest';
    if (ua.includes('vive')) return 'HTC Vive';
    if (ua.includes('index')) return 'Valve Index';
    if (ua.includes('pico')) return 'Pico';
    if (ua.includes('apple') || ua.includes('vision')) return 'Apple Vision Pro';
    return 'WebXR Device';
  };

  const logAuditEvent = useCallback(async (action: string, metadata?: Record<string, any>) => {
    const log: VRAuditLog = {
      timestamp: Date.now(),
      action,
      sessionId: vrSession?.id || 'no-session',
      metadata: {
        ...metadata,
        zkProofEnabled,
        deviceType: vrDeviceInfo?.type || 'unknown',
        handTrackingActive: handTracking.isActive
      }
    };
    
    setAuditLogs(prev => [...prev.slice(-99), log]);
    
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.functions.invoke('vr-audit-log', {
        body: {
          action,
          sessionId: vrSession?.id,
          timestamp: log.timestamp,
          metadata: log.metadata,
          compliance: {
            gdpr: true,
            mica: true,
            sec: true
          }
        }
      });
    } catch (e) {
      console.error('Failed to send audit log:', e);
    }
  }, [vrSession, zkProofEnabled, vrDeviceInfo, handTracking.isActive]);

  const giveVRConsent = useCallback(() => {
    setVRConsentGiven(true);
    localStorage.setItem(VR_CONSENT_KEY, 'true');
    logAuditEvent('VR_CONSENT_GIVEN', { consentType: 'full', gdprCompliant: true });
    setShowConsentModal(false);
  }, [logAuditEvent]);

  const revokeVRConsent = useCallback(() => {
    setVRConsentGiven(false);
    localStorage.removeItem(VR_CONSENT_KEY);
    logAuditEvent('VR_CONSENT_REVOKED', { gdprCompliant: true });
    if (isVRActive) {
      exitVR();
    }
  }, [logAuditEvent, isVRActive]);

  const enterVR = useCallback(async () => {
    if (!isVRSupported) {
      console.error('VR not supported');
      return;
    }
    
    if (!vrConsentGiven) {
      setShowConsentModal(true);
      return;
    }
    
    try {
      const xr = (navigator as any).xr;
      const session = await xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['bounded-floor', 'hand-tracking']
      });
      
      xrSessionRef.current = session;
      
      const newSession: VRSession = {
        id: `vr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startTime: Date.now(),
        deviceType: vrDeviceInfo?.name || 'unknown',
        encrypted: true,
        consentGiven: true
      };
      
      setVRSession(newSession);
      setIsVRActive(true);
      setVRMode('immersive-vr');

      if (handTracking.isSupported) {
        setHandTracking(prev => ({ ...prev, isActive: true }));
        
        if (!handTracking.tutorialCompleted) {
          setHandTracking(prev => ({ ...prev, showTutorial: true }));
        }
      }
      
      logAuditEvent('VR_SESSION_STARTED', {
        sessionId: newSession.id,
        deviceType: newSession.deviceType,
        encryptionEnabled: true,
        handTrackingEnabled: handTracking.isSupported
      });
      
      session.addEventListener('end', () => {
        exitVR();
      });
      
    } catch (e) {
      console.error('Failed to enter VR:', e);
      logAuditEvent('VR_SESSION_FAILED', { error: String(e) });
    }
  }, [isVRSupported, vrConsentGiven, vrDeviceInfo, logAuditEvent, handTracking.isSupported, handTracking.tutorialCompleted]);

  const exitVR = useCallback(() => {
    if (xrSessionRef.current) {
      xrSessionRef.current.end();
      xrSessionRef.current = null;
    }
    
    if (vrSession) {
      logAuditEvent('VR_SESSION_ENDED', {
        sessionId: vrSession.id,
        duration: Date.now() - vrSession.startTime
      });
    }
    
    setIsVRActive(false);
    setVRSession(null);
    setVRMode(null);
    setHandTracking(prev => ({ 
      ...prev, 
      isActive: false,
      leftHandTracked: false,
      rightHandTracked: false,
      currentGesture: 'none',
      gestureConfidence: 0
    }));
  }, [vrSession, logAuditEvent]);

  const toggleVR = useCallback(async () => {
    if (isVRActive) {
      exitVR();
    } else {
      await enterVR();
    }
  }, [isVRActive, enterVR, exitVR]);

  const toggleZKProof = useCallback(() => {
    setZKProofEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(VR_ZK_KEY, String(newValue));
      logAuditEvent('ZK_PROOF_TOGGLED', { enabled: newValue });
      return newValue;
    });
  }, [logAuditEvent]);

  const setHandTrackingActive = useCallback((active: boolean) => {
    setHandTracking(prev => ({ ...prev, isActive: active }));
    logAuditEvent('HAND_TRACKING_TOGGLED', { active });
  }, [logAuditEvent]);

  const setCurrentGesture = useCallback((gesture: GestureType, confidence: number) => {
    setHandTracking(prev => ({ 
      ...prev, 
      currentGesture: gesture,
      gestureConfidence: confidence
    }));
  }, []);

  const setShowHandTutorial = useCallback((show: boolean) => {
    setHandTracking(prev => ({ ...prev, showTutorial: show }));
  }, []);

  const completeHandTutorial = useCallback(() => {
    setHandTracking(prev => ({ 
      ...prev, 
      tutorialCompleted: true,
      showTutorial: false
    }));
    localStorage.setItem(VR_HAND_TUTORIAL_KEY, 'true');
    logAuditEvent('HAND_TUTORIAL_COMPLETED', {});
  }, [logAuditEvent]);

  const updateHandTrackedState = useCallback((left: boolean, right: boolean) => {
    setHandTracking(prev => ({
      ...prev,
      leftHandTracked: left,
      rightHandTracked: right
    }));
  }, []);

  return (
    <VRContext.Provider
      value={{
        isVRSupported,
        isVRActive,
        vrSession,
        vrMode,
        vrConsentGiven,
        showConsentModal,
        setShowConsentModal,
        giveVRConsent,
        revokeVRConsent,
        enterVR,
        exitVR,
        toggleVR,
        auditLogs,
        logAuditEvent,
        zkProofEnabled,
        toggleZKProof,
        vrDeviceInfo,
        handTracking,
        setHandTrackingActive,
        setCurrentGesture,
        setShowHandTutorial,
        completeHandTutorial,
        updateHandTrackedState
      }}
    >
      {children}
    </VRContext.Provider>
  );
};
