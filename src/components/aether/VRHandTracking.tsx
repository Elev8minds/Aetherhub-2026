import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Hand, ZoomIn, RotateCcw, ArrowLeftRight, Sparkles, CheckCircle } from 'lucide-react';

// WebXR Hand Joint names
const HAND_JOINTS = [
  'wrist',
  'thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip',
  'index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip',
  'middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip',
  'ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip',
  'pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip'
];

// Finger connections for rendering
const FINGER_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8], [8, 9],
  // Middle
  [0, 10], [10, 11], [11, 12], [12, 13], [13, 14],
  // Ring
  [0, 15], [15, 16], [16, 17], [17, 18], [18, 19],
  // Pinky
  [0, 20], [20, 21], [21, 22], [22, 23], [23, 24]
];

export type GestureType = 'pinch' | 'grab' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'point' | 'open' | 'none';

interface HandJoint {
  position: { x: number; y: number; z: number };
  radius: number;
}

interface HandData {
  joints: HandJoint[];
  isTracking: boolean;
  gesture: GestureType;
  gestureConfidence: number;
}

interface VRHandTrackingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isVRMode: boolean;
  onPinchZoom?: (scale: number) => void;
  onGrabRotate?: (rotation: { x: number; y: number }) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onGestureDetected?: (gesture: GestureType, hand: 'left' | 'right') => void;
  showTutorial?: boolean;
  onTutorialComplete?: () => void;
}

const VRHandTracking: React.FC<VRHandTrackingProps> = ({
  canvasRef,
  isVRMode,
  onPinchZoom,
  onGrabRotate,
  onSwipe,
  onGestureDetected,
  showTutorial = false,
  onTutorialComplete
}) => {
  const [leftHand, setLeftHand] = useState<HandData | null>(null);
  const [rightHand, setRightHand] = useState<HandData | null>(null);
  const [currentGesture, setCurrentGesture] = useState<GestureType>('none');
  const [gestureHistory, setGestureHistory] = useState<{ gesture: GestureType; timestamp: number }[]>([]);
  const [isHandTrackingSupported, setIsHandTrackingSupported] = useState(false);
  const [showGestureFeedback, setShowGestureFeedback] = useState(false);
  const [feedbackGesture, setFeedbackGesture] = useState<GestureType>('none');
  
  // Tutorial state
  const [tutorialStep, setTutorialStep] = useState(0);
  const [completedGestures, setCompletedGestures] = useState<Set<GestureType>>(new Set());
  
  const animationRef = useRef<number>(0);
  const xrSessionRef = useRef<XRSession | null>(null);
  const leftHandRef = useRef<XRHand | null>(null);
  const rightHandRef = useRef<XRHand | null>(null);
  const prevPinchDistanceRef = useRef<number>(0);
  const prevGrabPositionRef = useRef<{ x: number; y: number } | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Check WebXR Hand Tracking support
  useEffect(() => {
    const checkSupport = async () => {
      if ('xr' in navigator) {
        try {
          const xr = (navigator as any).xr;
          const supported = await xr.isSessionSupported('immersive-vr');
          if (supported) {
            // Check for hand-tracking feature
            setIsHandTrackingSupported(true);
          }
        } catch (e) {
          console.log('Hand tracking not supported:', e);
        }
      }
    };
    checkSupport();
  }, []);

  // Calculate distance between two 3D points
  const distance3D = useCallback((p1: { x: number; y: number; z: number }, p2: { x: number; y: number; z: number }) => {
    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) +
      Math.pow(p2.y - p1.y, 2) +
      Math.pow(p2.z - p1.z, 2)
    );
  }, []);

  // Detect pinch gesture (thumb tip to index tip)
  const detectPinch = useCallback((hand: HandData): { isPinching: boolean; distance: number } => {
    if (!hand.joints || hand.joints.length < 10) return { isPinching: false, distance: Infinity };
    
    const thumbTip = hand.joints[4]; // thumb-tip
    const indexTip = hand.joints[9]; // index-finger-tip
    
    if (!thumbTip || !indexTip) return { isPinching: false, distance: Infinity };
    
    const dist = distance3D(thumbTip.position, indexTip.position);
    const isPinching = dist < 0.025; // 2.5cm threshold
    
    return { isPinching, distance: dist };
  }, [distance3D]);

  // Detect grab gesture (all fingers curled)
  const detectGrab = useCallback((hand: HandData): boolean => {
    if (!hand.joints || hand.joints.length < 25) return false;
    
    const wrist = hand.joints[0];
    const fingerTips = [
      hand.joints[9],  // index
      hand.joints[14], // middle
      hand.joints[19], // ring
      hand.joints[24]  // pinky
    ];
    
    if (!wrist || fingerTips.some(t => !t)) return false;
    
    // Check if all finger tips are close to wrist (curled)
    const allCurled = fingerTips.every(tip => {
      const dist = distance3D(tip.position, wrist.position);
      return dist < 0.08; // 8cm threshold
    });
    
    return allCurled;
  }, [distance3D]);

  // Detect open hand
  const detectOpenHand = useCallback((hand: HandData): boolean => {
    if (!hand.joints || hand.joints.length < 25) return false;
    
    const wrist = hand.joints[0];
    const fingerTips = [
      hand.joints[4],  // thumb
      hand.joints[9],  // index
      hand.joints[14], // middle
      hand.joints[19], // ring
      hand.joints[24]  // pinky
    ];
    
    if (!wrist || fingerTips.some(t => !t)) return false;
    
    // Check if all finger tips are far from wrist (extended)
    const allExtended = fingerTips.every(tip => {
      const dist = distance3D(tip.position, wrist.position);
      return dist > 0.12; // 12cm threshold
    });
    
    return allExtended;
  }, [distance3D]);

  // Detect pointing gesture (index extended, others curled)
  const detectPoint = useCallback((hand: HandData): boolean => {
    if (!hand.joints || hand.joints.length < 25) return false;
    
    const wrist = hand.joints[0];
    const indexTip = hand.joints[9];
    const otherTips = [
      hand.joints[14], // middle
      hand.joints[19], // ring
      hand.joints[24]  // pinky
    ];
    
    if (!wrist || !indexTip || otherTips.some(t => !t)) return false;
    
    // Index extended
    const indexExtended = distance3D(indexTip.position, wrist.position) > 0.12;
    
    // Others curled
    const othersCurled = otherTips.every(tip => {
      return distance3D(tip.position, wrist.position) < 0.08;
    });
    
    return indexExtended && othersCurled;
  }, [distance3D]);

  // Detect swipe gesture
  const detectSwipe = useCallback((hand: HandData): 'left' | 'right' | 'up' | 'down' | null => {
    if (!hand.joints || hand.joints.length < 1) return null;
    
    const wrist = hand.joints[0];
    if (!wrist) return null;
    
    const currentPos = { x: wrist.position.x, y: wrist.position.y };
    const currentTime = Date.now();
    
    if (!swipeStartRef.current) {
      swipeStartRef.current = { ...currentPos, time: currentTime };
      return null;
    }
    
    const dx = currentPos.x - swipeStartRef.current.x;
    const dy = currentPos.y - swipeStartRef.current.y;
    const dt = currentTime - swipeStartRef.current.time;
    
    // Swipe must be fast (< 500ms) and significant (> 10cm)
    if (dt < 500 && dt > 50) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0.1) {
        swipeStartRef.current = { ...currentPos, time: currentTime };
        
        if (Math.abs(dx) > Math.abs(dy)) {
          return dx > 0 ? 'right' : 'left';
        } else {
          return dy > 0 ? 'up' : 'down';
        }
      }
    }
    
    // Reset if too slow
    if (dt > 500) {
      swipeStartRef.current = { ...currentPos, time: currentTime };
    }
    
    return null;
  }, []);

  // Process hand data and detect gestures
  const processHandData = useCallback((hand: HandData, handSide: 'left' | 'right') => {
    if (!hand.isTracking) return;
    
    // Detect gestures
    const { isPinching, distance: pinchDistance } = detectPinch(hand);
    const isGrabbing = detectGrab(hand);
    const isPointing = detectPoint(hand);
    const isOpen = detectOpenHand(hand);
    const swipeDir = detectSwipe(hand);
    
    let detectedGesture: GestureType = 'none';
    let confidence = 0;
    
    if (isPinching) {
      detectedGesture = 'pinch';
      confidence = Math.max(0, 1 - pinchDistance / 0.025);
      
      // Handle pinch zoom
      if (prevPinchDistanceRef.current > 0 && onPinchZoom) {
        const scale = pinchDistance / prevPinchDistanceRef.current;
        onPinchZoom(scale);
      }
      prevPinchDistanceRef.current = pinchDistance;
    } else {
      prevPinchDistanceRef.current = 0;
    }
    
    if (isGrabbing && !isPinching) {
      detectedGesture = 'grab';
      confidence = 0.9;
      
      // Handle grab rotate
      const wrist = hand.joints[0];
      if (wrist && onGrabRotate) {
        const currentPos = { x: wrist.position.x, y: wrist.position.y };
        if (prevGrabPositionRef.current) {
          const dx = currentPos.x - prevGrabPositionRef.current.x;
          const dy = currentPos.y - prevGrabPositionRef.current.y;
          onGrabRotate({ x: dy * 2, y: dx * 2 });
        }
        prevGrabPositionRef.current = currentPos;
      }
    } else {
      prevGrabPositionRef.current = null;
    }
    
    if (swipeDir) {
      detectedGesture = `swipe-${swipeDir}` as GestureType;
      confidence = 0.85;
      if (onSwipe) {
        onSwipe(swipeDir);
      }
    }
    
    if (isPointing && !isPinching && !isGrabbing) {
      detectedGesture = 'point';
      confidence = 0.8;
    }
    
    if (isOpen && !isPinching && !isGrabbing && !isPointing) {
      detectedGesture = 'open';
      confidence = 0.75;
    }
    
    // Update gesture state
    if (detectedGesture !== 'none') {
      setCurrentGesture(detectedGesture);
      setGestureHistory(prev => [...prev.slice(-9), { gesture: detectedGesture, timestamp: Date.now() }]);
      
      if (onGestureDetected) {
        onGestureDetected(detectedGesture, handSide);
      }
      
      // Show feedback
      setFeedbackGesture(detectedGesture);
      setShowGestureFeedback(true);
      setTimeout(() => setShowGestureFeedback(false), 800);
      
      // Tutorial progress
      if (showTutorial && !completedGestures.has(detectedGesture)) {
        setCompletedGestures(prev => new Set([...prev, detectedGesture]));
      }
    }
    
    // Update hand data with gesture
    const updatedHand = { ...hand, gesture: detectedGesture, gestureConfidence: confidence };
    if (handSide === 'left') {
      setLeftHand(updatedHand);
    } else {
      setRightHand(updatedHand);
    }
  }, [detectPinch, detectGrab, detectPoint, detectOpenHand, detectSwipe, onPinchZoom, onGrabRotate, onSwipe, onGestureDetected, showTutorial, completedGestures]);

  // Simulate hand tracking for demo (when not in actual VR)
  useEffect(() => {
    if (!isVRMode || !canvasRef.current) return;
    
    // In a real implementation, this would use XRFrame.getHand()
    // For demo, we simulate hand positions based on mouse/touch
    const canvas = canvasRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Simulate right hand following mouse
      const simulatedJoints: HandJoint[] = HAND_JOINTS.map((_, i) => {
        const offset = i * 0.01;
        return {
          position: { x: x + offset * 0.5, y: y + offset * 0.3, z: 0 },
          radius: 0.01
        };
      });
      
      const simulatedHand: HandData = {
        joints: simulatedJoints,
        isTracking: true,
        gesture: 'none',
        gestureConfidence: 0
      };
      
      processHandData(simulatedHand, 'right');
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [isVRMode, canvasRef, processHandData]);

  // Draw hand skeleton on canvas
  const drawHandSkeleton = useCallback((
    ctx: CanvasRenderingContext2D,
    hand: HandData,
    color: string,
    width: number,
    height: number
  ) => {
    if (!hand.isTracking || !hand.joints.length) return;
    
    const project = (pos: { x: number; y: number; z: number }) => ({
      x: (pos.x + 1) * width / 2,
      y: (-pos.y + 1) * height / 2
    });
    
    // Draw connections
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    FINGER_CONNECTIONS.forEach(([from, to]) => {
      const fromJoint = hand.joints[from];
      const toJoint = hand.joints[to];
      if (!fromJoint || !toJoint) return;
      
      const p1 = project(fromJoint.position);
      const p2 = project(toJoint.position);
      
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });
    
    // Draw joints
    hand.joints.forEach((joint, i) => {
      const p = project(joint.position);
      const isTip = [4, 9, 14, 19, 24].includes(i);
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, isTip ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isTip ? '#00f0ff' : color;
      ctx.fill();
      
      // Glow effect for tips
      if (isTip) {
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    
    // Draw gesture indicator
    if (hand.gesture !== 'none') {
      const wrist = hand.joints[0];
      if (wrist) {
        const p = project(wrist.position);
        
        ctx.font = 'bold 14px Orbitron, monospace';
        ctx.fillStyle = '#00f0ff';
        ctx.textAlign = 'center';
        ctx.fillText(hand.gesture.toUpperCase(), p.x, p.y - 30);
        
        // Confidence bar
        ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.fillRect(p.x - 30, p.y - 20, 60, 6);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(p.x - 30, p.y - 20, 60 * hand.gestureConfidence, 6);
      }
    }
  }, []);

  // Tutorial steps
  const tutorialSteps = [
    {
      gesture: 'pinch' as GestureType,
      title: 'Pinch to Zoom',
      description: 'Bring your thumb and index finger together to zoom in/out',
      icon: ZoomIn
    },
    {
      gesture: 'grab' as GestureType,
      title: 'Grab to Rotate',
      description: 'Make a fist and move your hand to rotate the view',
      icon: RotateCcw
    },
    {
      gesture: 'swipe-left' as GestureType,
      title: 'Swipe to Navigate',
      description: 'Swipe left or right to switch between assets',
      icon: ArrowLeftRight
    },
    {
      gesture: 'point' as GestureType,
      title: 'Point to Select',
      description: 'Point at an asset to see more details',
      icon: Hand
    }
  ];

  // Check tutorial completion
  useEffect(() => {
    if (showTutorial && tutorialStep < tutorialSteps.length) {
      const currentStepGesture = tutorialSteps[tutorialStep].gesture;
      if (completedGestures.has(currentStepGesture)) {
        setTimeout(() => {
          if (tutorialStep + 1 >= tutorialSteps.length) {
            onTutorialComplete?.();
          } else {
            setTutorialStep(prev => prev + 1);
          }
        }, 1000);
      }
    }
  }, [completedGestures, tutorialStep, showTutorial, onTutorialComplete]);

  return (
    <>
      {/* Gesture Feedback Overlay */}
      <AnimatePresence>
        {showGestureFeedback && feedbackGesture !== 'none' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="px-6 py-4 rounded-2xl bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/50 shadow-[0_0_40px_rgba(0,240,255,0.4)]">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <span className="text-cyan-400 font-bold text-lg" style={{ fontFamily: 'Orbitron, monospace' }}>
                  {feedbackGesture.toUpperCase().replace('-', ' ')}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hand Tracking Status */}
      {isVRMode && (
        <div className="absolute top-4 left-4 z-40">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10">
            <Hand className={cn(
              'w-5 h-5',
              (leftHand?.isTracking || rightHand?.isTracking) ? 'text-cyan-400' : 'text-gray-500'
            )} />
            <span className="text-sm text-gray-400">
              {(leftHand?.isTracking || rightHand?.isTracking) ? 'Hands Tracked' : 'Move hands to track'}
            </span>
          </div>
        </div>
      )}

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && tutorialStep < tutorialSteps.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full mx-4"
            >
              <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-3xl border border-cyan-500/30 shadow-[0_0_60px_rgba(0,240,255,0.2)] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      Hand Gesture Tutorial
                    </h3>
                    <span className="text-sm text-gray-400">
                      {tutorialStep + 1} / {tutorialSteps.length}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Current Step */}
                <div className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      key={tutorialStep}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center mb-6"
                    >
                      {React.createElement(tutorialSteps[tutorialStep].icon, {
                        className: 'w-12 h-12 text-cyan-400'
                      })}
                    </motion.div>
                    
                    <h4 className="text-2xl font-bold text-white mb-3">
                      {tutorialSteps[tutorialStep].title}
                    </h4>
                    
                    <p className="text-gray-400 mb-6">
                      {tutorialSteps[tutorialStep].description}
                    </p>
                    
                    {/* Gesture animation hint */}
                    <div className="relative w-32 h-32 mb-6">
                      <motion.div
                        animate={{
                          scale: [1, 0.8, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className="absolute inset-0 rounded-full bg-cyan-500/20 border-2 border-dashed border-cyan-500/50"
                      />
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                        <Hand className="w-12 h-12 text-cyan-400" />
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full',
                      completedGestures.has(tutorialSteps[tutorialStep].gesture)
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-white/5 border border-white/10'
                    )}>
                      {completedGestures.has(tutorialSteps[tutorialStep].gesture) ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-green-400 font-medium">Gesture Detected!</span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full"
                          />
                          <span className="text-gray-400">Waiting for gesture...</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex justify-between">
                  <button
                    onClick={() => setTutorialStep(prev => Math.max(0, prev - 1))}
                    disabled={tutorialStep === 0}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={() => {
                      if (tutorialStep + 1 >= tutorialSteps.length) {
                        onTutorialComplete?.();
                      } else {
                        setTutorialStep(prev => prev + 1);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
                  >
                    {tutorialStep + 1 >= tutorialSteps.length ? 'Complete' : 'Skip'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture History */}
      {isVRMode && gestureHistory.length > 0 && (
        <div className="absolute bottom-20 left-4 z-40">
          <div className="bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 p-3 max-w-xs">
            <div className="text-xs text-gray-500 mb-2">Recent Gestures</div>
            <div className="flex flex-wrap gap-1">
              {gestureHistory.slice(-5).map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                >
                  {item.gesture}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VRHandTracking;
