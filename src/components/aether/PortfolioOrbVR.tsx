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

import React, { useRef, useEffect, useState, useCallback } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/AppContext';
import { useVRContext } from '@/contexts/VRContext';
import { ASSET_COLORS, getAssetColor, getAssetLogo } from '@/lib/constants';
import { 
  preloadAssetLogos, 
  getCachedLogoImage,
  getAssetLogoImage,
  getCachedLogoUrl
} from './AssetLogo';
import VRHandTracking from './VRHandTracking';
import { 
  Glasses, Volume2, VolumeX, Maximize2, Minimize2,
  RotateCcw, ZoomIn, ZoomOut, Move3d, Sparkles, Eye, Shield,
  Hand, HelpCircle
} from 'lucide-react';


interface PortfolioOrbVRProps {
  totalValue: number;
  change24h: number;
  assets: Array<{
    symbol: string;
    value: number;
    color?: string;
    image?: string;
  }>;
  isVRMode?: boolean;
  onEnterVR?: () => void;
  onExitVR?: () => void;
  zkProofEnabled?: boolean;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
  assetIndex: number;
}

interface AssetOrb {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  displayX: number;
  displayY: number;
  displayZ: number;
  radius: number;
  color: string;
  symbol: string;
  value: number;
  angle: number;
  speed: number;
  image?: HTMLImageElement | null;
  lastZ: number;
}

// Utility function to ensure positive radius values
const safeRadius = (value: number, min: number = 0.1): number => {
  return Math.max(min, Math.abs(value) || min);
};

// Linear interpolation for smooth movement
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

const PortfolioOrbVR: React.FC<PortfolioOrbVRProps> = ({
  totalValue,
  change24h,
  assets,
  isVRMode = false,
  onEnterVR,
  onExitVR,
  zkProofEnabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const { hideBalances } = useAppContext();
  const { 
    handTracking, 
    setCurrentGesture, 
    completeHandTutorial,
    setShowHandTutorial,
    logAuditEvent
  } = useVRContext();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [showLogos, setShowLogos] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(true);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);
  
  const particlesRef = useRef<Particle[]>([]);
  const assetOrbsRef = useRef<AssetOrb[]>([]);
  const timeRef = useRef(0);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Smoothing factor for interpolation (0-1, lower = smoother but slower)
  const SMOOTH_FACTOR = 0.08;
  const PARTICLE_SMOOTH_FACTOR = 0.12;

  // Use the asset logos hook for efficient loading
  const assetSymbols = assets.map(a => a.symbol);
  const assetColors = assets.reduce((acc, a) => {
    acc[a.symbol.toUpperCase()] = a.color || getAssetColor(a.symbol);
    return acc;
  }, {} as Record<string, string>);

  // Preload all asset logo images using the new AssetLogo system
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Use the new preloadAssetLogos function for efficient batch loading
        const loadedImages = await preloadAssetLogos(assetSymbols, assetColors);
        
        // Update local cache
        loadedImages.forEach((img, symbol) => {
          imageCache.current.set(symbol, img);
        });
        
        // Also try to load any custom images passed in assets
        const customImagePromises = assets
          .filter(asset => asset.image && !imageCache.current.has(asset.symbol.toUpperCase()))
          .map(async (asset) => {
            try {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject();
                img.src = asset.image!;
              });
              imageCache.current.set(asset.symbol.toUpperCase(), img);
            } catch (e) {
              // Custom image failed, will use the preloaded one
            }
          });
        
        await Promise.all(customImagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.warn('Error loading asset logos:', error);
        setImagesLoaded(true); // Continue anyway with fallbacks
      }
    };
    
    loadImages();
  }, [assetSymbols.join(',')]);

  // Initialize particles and asset orbs with proper logos
  useEffect(() => {
    if (!imagesLoaded) return;
    
    // Create particles with asset-specific colors
    particlesRef.current = Array.from({ length: 150 }, (_, i) => {
      const assetIndex = Math.floor(Math.random() * assets.length);
      const assetColor = assets[assetIndex]?.color || getAssetColor(assets[assetIndex]?.symbol || 'ETH');
      const x = (Math.random() - 0.5) * 400;
      const y = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 400;
      return {
        x,
        y,
        z,
        targetX: x,
        targetY: y,
        targetZ: z,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        color: assetColor,
        alpha: Math.random() * 0.5 + 0.3,
        assetIndex
      };
    });

    // Create asset orbs with proper logos from the new caching system
    const totalVal = assets.reduce((sum, a) => sum + a.value, 0);
    assetOrbsRef.current = assets.map((asset, i) => {
      const angle = (i / assets.length) * Math.PI * 2;
      const distance = 120 + (asset.value / totalVal) * 80;
      const color = asset.color || getAssetColor(asset.symbol);
      
      // Get cached image from our local cache or the global cache
      const cachedImage = imageCache.current.get(asset.symbol.toUpperCase()) || 
                          getCachedLogoImage(asset.symbol);
      
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const z = (Math.random() - 0.5) * 100;
      
      return {
        x,
        y,
        z,
        targetX: x,
        targetY: y,
        targetZ: z,
        displayX: x,
        displayY: y,
        displayZ: z,
        radius: safeRadius(20 + (asset.value / totalVal) * 45, 10),
        color,
        symbol: asset.symbol,
        value: asset.value,
        angle,
        speed: 0.001 + Math.random() * 0.002, // Slower, smoother movement
        image: cachedImage,
        lastZ: z
      };
    });
  }, [assets, imagesLoaded]);

  // Dynamically load new asset logos when they appear
  useEffect(() => {
    const loadNewAssetLogos = async () => {
      for (const orb of assetOrbsRef.current) {
        if (!orb.image) {
          // Try to get from cache first
          const cached = getCachedLogoImage(orb.symbol);
          if (cached) {
            orb.image = cached;
            continue;
          }
          
          // Load asynchronously without blocking
          getAssetLogoImage(orb.symbol, orb.color).then((img) => {
            if (img) {
              orb.image = img;
              imageCache.current.set(orb.symbol.toUpperCase(), img);
            }
          });
        }
      }
    };
    
    if (imagesLoaded) {
      loadNewAssetLogos();
    }
  }, [imagesLoaded, assets]);


  // 3D projection with rotation - with safety guards
  const project = useCallback((x: number, y: number, z: number, width: number, height: number) => {
    const fov = 500;
    
    // Apply rotation
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    
    // Rotate around Y axis
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    
    // Rotate around X axis
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    
    // Calculate projection scale with safety bounds
    const effectiveZoom = Math.max(0.1, Math.min(5, zoom));
    const denominator = fov + z2 * effectiveZoom;
    
    // Ensure we never get negative or zero scale
    let projectedScale: number;
    if (denominator <= 0) {
      projectedScale = 0.01; // Object is behind camera, make it tiny
    } else {
      projectedScale = Math.max(0.01, Math.min(10, fov / denominator));
    }
    
    return {
      x: width / 2 + x1 * projectedScale,
      y: height / 2 + y1 * projectedScale,
      scale: projectedScale,
      z: z2
    };
  }, [zoom, rotation]);


  // Hand tracking gesture handlers
  const handlePinchZoom = useCallback((scale: number) => {
    if (!handTrackingEnabled) return;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * scale)));
    logAuditEvent('VR_PINCH_ZOOM', { scale, newZoom: zoom });
  }, [handTrackingEnabled, zoom, logAuditEvent]);

  const handleGrabRotate = useCallback((delta: { x: number; y: number }) => {
    if (!handTrackingEnabled) return;
    setRotation(prev => ({
      x: prev.x + delta.x * 0.02,
      y: prev.y + delta.y * 0.02
    }));
  }, [handTrackingEnabled]);

  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (!handTrackingEnabled) return;
    
    // Navigate through assets
    if (direction === 'left' || direction === 'right') {
      setSelectedAssetIndex(prev => {
        if (prev === null) return 0;
        const newIndex = direction === 'right' 
          ? (prev + 1) % assets.length 
          : (prev - 1 + assets.length) % assets.length;
        return newIndex;
      });
      logAuditEvent('VR_SWIPE_NAVIGATE', { direction, selectedAsset: assets[selectedAssetIndex || 0]?.symbol });
    }
    
    // Zoom with up/down swipes
    if (direction === 'up') {
      setZoom(prev => Math.min(3, prev + 0.2));
    } else if (direction === 'down') {
      setZoom(prev => Math.max(0.5, prev - 0.2));
    }
  }, [handTrackingEnabled, assets, selectedAssetIndex, logAuditEvent]);

  const handleGestureDetected = useCallback((gesture: any, hand: 'left' | 'right') => {
    setCurrentGesture(gesture, 0.9);
    logAuditEvent('VR_GESTURE_DETECTED', { gesture, hand });
  }, [setCurrentGesture, logAuditEvent]);

  // Main animation loop with deltaTime for consistent speed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (currentTime: number) => {
      // Calculate delta time for consistent animation speed
      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 16.67 : 1;
      lastTimeRef.current = currentTime;
      
      // Clamp deltaTime to prevent huge jumps
      const clampedDelta = Math.min(deltaTime, 3);
      
      const width = canvas.width;
      const height = canvas.height;
      timeRef.current += 0.016 * clampedDelta;
      
      // Clear with gradient background
      const bgGradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, safeRadius(Math.max(width, height) / 2, 100)
      );
      bgGradient.addColorStop(0, 'rgba(10, 10, 20, 0.95)');
      bgGradient.addColorStop(0.5, 'rgba(5, 5, 15, 0.98)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 10, 1)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw VR grid effect
      if (isVRMode) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;
        const gridSpacing = 40;
        for (let i = -15; i <= 15; i++) {
          const y = height / 2 + i * gridSpacing;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
          
          const x = width / 2 + i * gridSpacing;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        
        // Draw hexagonal pattern for VR depth
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
        for (let ring = 1; ring <= 5; ring++) {
          const ringRadius = ring * 80;
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const hx = width / 2 + Math.cos(angle) * ringRadius;
            const hy = height / 2 + Math.sin(angle) * ringRadius;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.stroke();
        }
      }

      // Update and draw particles with smooth interpolation
      particlesRef.current.forEach(particle => {
        // Update target positions
        particle.targetX += particle.vx * clampedDelta;
        particle.targetY += particle.vy * clampedDelta;
        particle.targetZ += particle.vz * clampedDelta;
        
        // Boundary check on targets
        if (Math.abs(particle.targetX) > 200) particle.vx *= -1;
        if (Math.abs(particle.targetY) > 200) particle.vy *= -1;
        if (Math.abs(particle.targetZ) > 200) particle.vz *= -1;
        
        // Smooth interpolation to target
        particle.x = lerp(particle.x, particle.targetX, PARTICLE_SMOOTH_FACTOR * clampedDelta);
        particle.y = lerp(particle.y, particle.targetY, PARTICLE_SMOOTH_FACTOR * clampedDelta);
        particle.z = lerp(particle.z, particle.targetZ, PARTICLE_SMOOTH_FACTOR * clampedDelta);
        
        const proj = project(particle.x, particle.y, particle.z, width, height);
        if (proj.z < -400) return;
        
        const size = safeRadius(particle.size * proj.scale, 0.5);
        const alpha = Math.max(0, Math.min(1, particle.alpha * (1 - proj.z / 400)));
        
        // Convert hex to rgba safely
        const hex = particle.color || '#00f0ff';
        const r = parseInt(hex.slice(1, 3), 16) || 0;
        const g = parseInt(hex.slice(3, 5), 16) || 240;
        const b = parseInt(hex.slice(5, 7), 16) || 255;
        
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = safeRadius(10 * proj.scale, 1);
      });
      ctx.shadowBlur = 0;

      // Draw central portfolio orb
      const centerProj = project(0, 0, 0, width, height);
      const orbRadius = safeRadius(65 * centerProj.scale * zoom, 10);
      
      // Outer glow rings
      for (let ring = 3; ring >= 1; ring--) {
        const ringRadius = safeRadius(orbRadius * (1 + ring * 0.4), 5);
        const ringAlpha = 0.1 / ring;
        ctx.beginPath();
        ctx.arc(centerProj.x, centerProj.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${ringAlpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Main orb glow
      const innerGlowRadius = safeRadius(orbRadius * 0.5, 5);
      const outerGlowRadius = safeRadius(orbRadius * 2.5, 20);
      const glowGradient = ctx.createRadialGradient(
        centerProj.x, centerProj.y, innerGlowRadius,
        centerProj.x, centerProj.y, outerGlowRadius
      );
      glowGradient.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
      glowGradient.addColorStop(0.4, 'rgba(139, 92, 246, 0.15)');
      glowGradient.addColorStop(1, 'rgba(255, 0, 110, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerProj.x, centerProj.y, outerGlowRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Main orb body
      const orbGradient = ctx.createRadialGradient(
        centerProj.x - orbRadius * 0.3, centerProj.y - orbRadius * 0.3, 0,
        centerProj.x, centerProj.y, orbRadius
      );
      orbGradient.addColorStop(0, 'rgba(0, 240, 255, 0.5)');
      orbGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.35)');
      orbGradient.addColorStop(1, 'rgba(255, 0, 110, 0.25)');
      ctx.fillStyle = orbGradient;
      ctx.beginPath();
      ctx.arc(centerProj.x, centerProj.y, orbRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Orb border with pulse effect
      const pulseIntensity = 0.5 + Math.sin(timeRef.current * 2) * 0.2;
      ctx.strokeStyle = `rgba(0, 240, 255, ${pulseIntensity})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw value in center
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(14, 24 * zoom)}px Orbitron, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const displayValue = hideBalances || zkProofEnabled
        ? '••••••'
        : `$${(totalValue / 1000).toFixed(0)}K`;
      ctx.fillText(displayValue, centerProj.x, centerProj.y - 12);
      
      ctx.font = `${Math.max(10, 14 * zoom)}px sans-serif`;
      ctx.fillStyle = change24h >= 0 ? '#10b981' : '#ef4444';
      const changeText = hideBalances || zkProofEnabled
        ? '••••'
        : `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`;
      ctx.fillText(changeText, centerProj.x, centerProj.y + 15);
      
      // "Portfolio" label
      ctx.font = `${Math.max(8, 10 * zoom)}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText('PORTFOLIO', centerProj.x, centerProj.y + 32);

      // Update asset orb positions with smooth interpolation
      assetOrbsRef.current.forEach((orb, i) => {
        // Update angle slowly
        orb.angle += orb.speed * clampedDelta;
        
        // Calculate target position
        const distance = 130 + Math.sin(timeRef.current * 0.5 + i) * 20; // Slower oscillation
        orb.targetX = Math.cos(orb.angle) * distance;
        orb.targetY = Math.sin(orb.angle) * distance * 0.65;
        orb.targetZ = Math.sin(orb.angle * 2) * 50;
        
        // Smooth interpolation to target position
        orb.displayX = lerp(orb.displayX, orb.targetX, SMOOTH_FACTOR * clampedDelta);
        orb.displayY = lerp(orb.displayY, orb.targetY, SMOOTH_FACTOR * clampedDelta);
        orb.displayZ = lerp(orb.displayZ, orb.targetZ, SMOOTH_FACTOR * clampedDelta);
        
        // Update actual position for projection
        orb.x = orb.displayX;
        orb.y = orb.displayY;
        orb.z = orb.displayZ;
      });

      // Sort asset orbs by z-depth with hysteresis to prevent flickering
      const sortedOrbs = [...assetOrbsRef.current].sort((a, b) => {
        const projA = project(a.displayX, a.displayY, a.displayZ, width, height);
        const projB = project(b.displayX, b.displayY, b.displayZ, width, height);
        
        // Add hysteresis - only swap if difference is significant
        const zDiff = projB.z - projA.z;
        if (Math.abs(zDiff) < 5) {
          // Use last known order if difference is small
          return b.lastZ - a.lastZ;
        }
        
        // Update last z values
        a.lastZ = projA.z;
        b.lastZ = projB.z;
        
        return zDiff;
      });

      // Draw asset orbs with logos
      sortedOrbs.forEach((orb, i) => {
        const proj = project(orb.displayX, orb.displayY, orb.displayZ, width, height);
        const radius = safeRadius(orb.radius * proj.scale, 5);
        const depthAlpha = Math.max(0.4, Math.min(1, 1 - Math.abs(proj.z) / 300));
        
        // Check if this orb is selected (via hand tracking swipe)
        const originalIndex = assetOrbsRef.current.findIndex(o => o.symbol === orb.symbol);
        const isSelected = selectedAssetIndex === originalIndex;
        
        // Draw connection line to center
        ctx.strokeStyle = isSelected ? `${orb.color}80` : `${orb.color}30`;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.setLineDash(isSelected ? [] : [5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerProj.x, centerProj.y);
        ctx.lineTo(proj.x, proj.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw selection ring for selected asset
        if (isSelected) {
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, safeRadius(radius + 8, 8), 0, Math.PI * 2);
          ctx.stroke();
          
          // Animated selection ring
          const selectionPulse = 0.5 + Math.sin(timeRef.current * 4) * 0.5;
          ctx.strokeStyle = `rgba(0, 240, 255, ${selectionPulse})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, safeRadius(radius + 15, 10), 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Draw orb glow
        const glowInner = safeRadius(radius * 0.5, 2);
        const glowOuter = safeRadius(radius * 1.8, 10);
        const orbGlow = ctx.createRadialGradient(
          proj.x, proj.y, glowInner,
          proj.x, proj.y, glowOuter
        );
        orbGlow.addColorStop(0, `${orb.color}40`);
        orbGlow.addColorStop(1, `${orb.color}00`);
        ctx.fillStyle = orbGlow;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, glowOuter, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw orb background
        const assetGradient = ctx.createRadialGradient(
          proj.x - radius * 0.3, proj.y - radius * 0.3, 0,
          proj.x, proj.y, radius
        );
        assetGradient.addColorStop(0, `${orb.color}cc`);
        assetGradient.addColorStop(0.7, `${orb.color}88`);
        assetGradient.addColorStop(1, `${orb.color}44`);
        ctx.fillStyle = assetGradient;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw logo image if available and showLogos is true
        if (showLogos && orb.image && orb.image.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, safeRadius(radius * 0.75, 3), 0, Math.PI * 2);
          ctx.clip();
          
          const imgSize = safeRadius(radius * 1.5, 10);
          ctx.globalAlpha = depthAlpha;
          ctx.drawImage(
            orb.image,
            proj.x - imgSize / 2,
            proj.y - imgSize / 2,
            imgSize,
            imgSize
          );
          ctx.restore();
        } else {
          // Fallback: draw symbol text
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(10, 14 * proj.scale)}px Orbitron, monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(orb.symbol, proj.x, proj.y);
        }
        
        // Draw orb border
        ctx.strokeStyle = orb.color;
        ctx.lineWidth = Math.max(1, 2 * proj.scale);
        ctx.globalAlpha = depthAlpha;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Draw symbol label below orb
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(9, 12 * proj.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = depthAlpha;
        ctx.fillText(orb.symbol, proj.x, proj.y + radius + 14 * proj.scale);
        
        // Draw value below symbol (if not hidden)
        if (!hideBalances && !zkProofEnabled) {
          ctx.font = `${Math.max(7, 9 * proj.scale)}px sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          const valueText = orb.value >= 1000 
            ? `$${(orb.value / 1000).toFixed(1)}K`
            : `$${orb.value.toFixed(0)}`;
          ctx.fillText(valueText, proj.x, proj.y + radius + 26 * proj.scale);
        }
        ctx.globalAlpha = 1;
      });

      // VR mode indicators
      if (isVRMode) {
        // VR mode badge
        ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
        ctx.font = 'bold 14px Orbitron, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('VR MODE ACTIVE', 20, 30);
        
        // Hand tracking indicator
        if (handTrackingEnabled && handTracking.isActive) {
          ctx.fillStyle = 'rgba(139, 92, 246, 0.9)';
          ctx.fillText('HAND TRACKING ON', 20, 50);
          
          // Current gesture
          if (handTracking.currentGesture !== 'none') {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
            ctx.fillText(`GESTURE: ${handTracking.currentGesture.toUpperCase()}`, 20, 70);
          }
        }
        
        // Scanning line effect
        const scanY = (timeRef.current * 100) % height;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();
        
        // ZK indicator
        if (zkProofEnabled) {
          ctx.fillStyle = 'rgba(139, 92, 246, 0.9)';
          ctx.fillText('ZK-PROOF ENABLED', 20, handTrackingEnabled ? 90 : 50);
        }
        
        // Corner brackets for VR frame
        const bracketSize = 30;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.lineWidth = 2;
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(15, 15 + bracketSize);
        ctx.lineTo(15, 15);
        ctx.lineTo(15 + bracketSize, 15);
        ctx.stroke();
        
        // Top-right
        ctx.beginPath();
        ctx.moveTo(width - 15 - bracketSize, 15);
        ctx.lineTo(width - 15, 15);
        ctx.lineTo(width - 15, 15 + bracketSize);
        ctx.stroke();
        
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(15, height - 15 - bracketSize);
        ctx.lineTo(15, height - 15);
        ctx.lineTo(15 + bracketSize, height - 15);
        ctx.stroke();
        
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(width - 15 - bracketSize, height - 15);
        ctx.lineTo(width - 15, height - 15);
        ctx.lineTo(width - 15, height - 15 - bracketSize);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [project, totalValue, change24h, hideBalances, isVRMode, zkProofEnabled, zoom, showLogos, imagesLoaded, handTrackingEnabled, handTracking, selectedAssetIndex]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  // Mouse/touch handlers for rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setRotation(prev => ({
      x: prev.x + dy * 0.005,
      y: prev.y + dx * 0.005
    }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(3, prev - e.deltaY * 0.001)));
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setLastMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastMouse.x;
    const dy = e.touches[0].clientY - lastMouse.y;
    setRotation(prev => ({
      x: prev.x + dy * 0.005,
      y: prev.y + dx * 0.005
    }));
    setLastMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch (error) {
      // Fullscreen request may be denied by browser (e.g., not triggered by user gesture)
      console.warn('Fullscreen request denied:', error);
    }
  };


  // Voice command handler
  const handleVoiceToggle = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative rounded-2xl overflow-hidden border transition-all',
        isVRMode 
          ? 'border-cyan-500/50 shadow-[0_0_40px_rgba(0,240,255,0.3)]' 
          : 'border-white/10',
        isFullscreen && 'fixed inset-0 z-50 rounded-none'
      )}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-[450px] cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Hand Tracking Component */}
      {isVRMode && handTrackingEnabled && (
        <VRHandTracking
          canvasRef={canvasRef}
          isVRMode={isVRMode}
          onPinchZoom={handlePinchZoom}
          onGrabRotate={handleGrabRotate}
          onSwipe={handleSwipe}
          onGestureDetected={handleGestureDetected}
          showTutorial={handTracking.showTutorial}
          onTutorialComplete={completeHandTutorial}
        />
      )}

      {/* Controls Overlay - Right Side */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* VR Toggle */}
        <button
          onClick={isVRMode ? onExitVR : onEnterVR}
          className={cn(
            'p-3 rounded-xl backdrop-blur-xl border transition-all',
            isVRMode
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
              : 'bg-black/50 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
          )}
          title={isVRMode ? 'Exit VR' : 'Enter VR'}
        >
          <Glasses className="w-5 h-5" />
        </button>

        {/* Hand Tracking Toggle */}
        {isVRMode && (
          <button
            onClick={() => setHandTrackingEnabled(!handTrackingEnabled)}
            className={cn(
              'p-3 rounded-xl backdrop-blur-xl border transition-all',
              handTrackingEnabled
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                : 'bg-black/50 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
            )}
            title={handTrackingEnabled ? 'Disable Hand Tracking' : 'Enable Hand Tracking'}
          >
            <Hand className="w-5 h-5" />
          </button>
        )}

        {/* Hand Tutorial */}
        {isVRMode && handTrackingEnabled && (
          <button
            onClick={() => setShowHandTutorial(true)}
            className="p-3 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all"
            title="Hand Gesture Tutorial"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        )}

        {/* Toggle Logos */}
        <button
          onClick={() => setShowLogos(!showLogos)}
          className={cn(
            'p-3 rounded-xl backdrop-blur-xl border transition-all',
            showLogos
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              : 'bg-black/50 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
          )}
          title={showLogos ? 'Hide Logos' : 'Show Logos'}
        >
          <Eye className="w-5 h-5" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-3 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Voice */}
        <button
          onClick={handleVoiceToggle}
          className={cn(
            'p-3 rounded-xl backdrop-blur-xl border transition-all',
            voiceEnabled
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
              : 'bg-black/50 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
          )}
          title={voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
        >
          {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
          className="p-2 rounded-lg bg-black/50 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
          className="p-2 rounded-lg bg-black/50 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setRotation({ x: 0, y: 0 }); setZoom(1); setSelectedAssetIndex(null); }}
          className="p-2 rounded-lg bg-black/50 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 flex-wrap">
        <div className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-xl border border-white/10 flex items-center gap-2">
          <Move3d className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-gray-400">Drag to rotate</span>
        </div>
        {isVRMode && (
          <div className="px-3 py-1.5 rounded-lg bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/30 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-400">Immersive Mode</span>
          </div>
        )}
        {isVRMode && handTrackingEnabled && (
          <div className="px-3 py-1.5 rounded-lg bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 flex items-center gap-2">
            <Hand className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-400">Hand Tracking</span>
          </div>
        )}
        {zkProofEnabled && (
          <div className="px-3 py-1.5 rounded-lg bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-400">ZK Privacy</span>
          </div>
        )}
      </div>

      {/* Selected Asset Info Panel */}
      <AnimatePresence>
        {selectedAssetIndex !== null && assets[selectedAssetIndex] && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-20 left-4 z-40"
          >
            <div className="bg-black/80 backdrop-blur-xl rounded-xl border border-cyan-500/30 p-4 min-w-[200px]">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={assets[selectedAssetIndex].image || getAssetLogo(assets[selectedAssetIndex].symbol)}
                  alt={assets[selectedAssetIndex].symbol}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="text-white font-bold">{assets[selectedAssetIndex].symbol}</div>
                  <div className="text-xs text-gray-400">Selected Asset</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Value</span>
                  <span className="text-white font-mono">
                    ${assets[selectedAssetIndex].value.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Portfolio %</span>
                  <span className="text-cyan-400 font-mono">
                    {((assets[selectedAssetIndex].value / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-500">Swipe left/right to navigate</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Legend */}
      <div className="absolute top-4 left-4 max-h-[200px] overflow-y-auto">
        <div className="bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 p-3">
          <div className="text-xs text-gray-400 mb-2 font-medium">Assets ({assets.length})</div>
          <div className="space-y-1.5">
            {assets.slice(0, 6).map((asset, i) => (
              <div 
                key={asset.symbol} 
                className={cn(
                  "flex items-center gap-2 cursor-pointer transition-all px-1 py-0.5 rounded",
                  selectedAssetIndex === i && "bg-cyan-500/20"
                )}
                onClick={() => setSelectedAssetIndex(i === selectedAssetIndex ? null : i)}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: asset.color || getAssetColor(asset.symbol) }}
                />
                <span className="text-xs text-white font-medium">{asset.symbol}</span>
              </div>
            ))}
            {assets.length > 6 && (
              <div className="text-xs text-gray-500">+{assets.length - 6} more</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOrbVR;
