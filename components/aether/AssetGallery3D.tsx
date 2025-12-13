import React, { useEffect, useRef, useState } from 'react';


import { preloadAssetLogos, getCachedLogoImage, getAssetLogoUrl } from './AssetLogo';
import { PORTFOLIO_ASSETS, ASSET_COLORS } from '@/lib/constants';

// Utility function to ensure positive values
const safePositive = (value: number, min: number = 0.1): number => {
  return Math.max(min, Math.abs(value) || min);
};

// Linear interpolation for smooth movement
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

interface FloatingAsset {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  displayX: number;
  displayY: number;
  rotationY: number;
  targetRotationY: number;
  rotationSpeed: number;
  opacity: number;
  targetOpacity: number;
  scale: number;
  symbol: string;
  floatOffset: number;
  floatSpeed: number;
}

const AssetGallery3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const assetsRef = useRef<FloatingAsset[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Smoothing factor for interpolation
  const SMOOTH_FACTOR = 0.05;

  // Get unique symbols from portfolio assets
  const assetSymbols = PORTFOLIO_ASSETS.map(a => a.symbol);

  // Load all images using the AssetLogo system
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      
      // Preload all asset logos
      const images = await preloadAssetLogos(assetSymbols, ASSET_COLORS);
      setLoadedImages(images);
      setIsLoading(false);
    };

    loadImages();
  }, []);

  // Initialize floating assets
  useEffect(() => {
    if (isLoading || loadedImages.size === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const numAssets = 12;
    const assets: FloatingAsset[] = [];

    for (let i = 0; i < numAssets; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const rotationY = Math.random() * Math.PI * 2;
      const opacity = Math.random() * 0.5 + 0.1;
      const symbol = assetSymbols[i % assetSymbols.length];
      
      assets.push({
        x,
        y,
        z: Math.random() * 500 - 250,
        targetX: x,
        targetY: y,
        displayX: x,
        displayY: y,
        rotationY,
        targetRotationY: rotationY,
        rotationSpeed: (Math.random() - 0.5) * 0.02, // Slower rotation
        opacity,
        targetOpacity: opacity,
        scale: Math.random() * 0.5 + 0.3,
        symbol,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: Math.random() * 0.01 + 0.005, // Slower floating
      });
    }

    assetsRef.current = assets;
  }, [isLoading, loadedImages, assetSymbols]);


  // Animation loop
  useEffect(() => {
    if (isLoading || loadedImages.size === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reposition assets on resize
      assetsRef.current.forEach(asset => {
        asset.x = Math.random() * canvas.width;
        asset.y = Math.random() * canvas.height;
        asset.targetX = asset.x;
        asset.targetY = asset.y;
        asset.displayX = asset.x;
        asset.displayY = asset.y;
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;

    const animate = (currentTime: number) => {
      // Calculate delta time for consistent animation
      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 16.67 : 1;
      lastTimeRef.current = currentTime;
      const clampedDelta = Math.min(deltaTime, 3);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Sort by z-depth for proper layering (with stability)
      const sortedAssets = [...assetsRef.current].sort((a, b) => a.z - b.z);

      sortedAssets.forEach((asset, index) => {
        // Update target rotation smoothly
        asset.targetRotationY += asset.rotationSpeed * clampedDelta;
        asset.rotationY = lerp(asset.rotationY, asset.targetRotationY, SMOOTH_FACTOR * clampedDelta);

        // Update target opacity with smooth sine wave
        const opacityWave = Math.sin(time * 0.5 + index * 0.5) * 0.3 + 0.4;
        asset.targetOpacity = Math.max(0.05, Math.min(0.6, opacityWave));
        asset.opacity = lerp(asset.opacity, asset.targetOpacity, SMOOTH_FACTOR * clampedDelta);

        // Calculate target floating motion
        const floatY = Math.sin(time * asset.floatSpeed * 0.25 + asset.floatOffset) * 50;
        const floatX = Math.cos(time * asset.floatSpeed * 0.175 + asset.floatOffset) * 35;

        // Update target positions
        asset.targetX = asset.x + floatX;
        asset.targetY = asset.y + floatY;
        
        // Smooth interpolation to target positions
        asset.displayX = lerp(asset.displayX, asset.targetX, SMOOTH_FACTOR * clampedDelta);
        asset.displayY = lerp(asset.displayY, asset.targetY, SMOOTH_FACTOR * clampedDelta);

        // Calculate 3D perspective - ensure zScale is always positive
        const perspective = 800;
        const denominator = perspective + asset.z;
        const zScale = denominator > 10 ? perspective / denominator : 0.01;
        const projectedX = asset.displayX;
        const projectedY = asset.displayY;

        // Calculate size based on z-depth and scale - ensure size is always positive
        const baseSize = 80;
        const size = safePositive(baseSize * asset.scale * zScale, 5);

        // Apply 3D rotation effect (simulate Y-axis rotation)
        const rotationScale = Math.cos(asset.rotationY);
        const drawWidth = safePositive(size * Math.abs(rotationScale), 5);
        const drawHeight = safePositive(size, 5);

        // Skip if too thin (edge-on view)
        if (drawWidth < 5) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, asset.opacity * zScale));
        
        // Add glow effect with safe blur value
        const assetColor = ASSET_COLORS[asset.symbol] || '#00f0ff';
        ctx.shadowColor = assetColor;
        ctx.shadowBlur = safePositive(20 * zScale, 1);
        
        // Get the cached image for this asset
        const img = getCachedLogoImage(asset.symbol) || loadedImages.get(asset.symbol.toUpperCase());
        
        if (img && img.complete) {
          ctx.translate(projectedX, projectedY);
          
          // Flip horizontally when rotating past 90 degrees
          if (rotationScale < 0) {
            ctx.scale(-1, 1);
          }
          
          try {
            ctx.drawImage(
              img,
              -drawWidth / 2,
              -drawHeight / 2,
              drawWidth,
              drawHeight
            );
          } catch (e) {
            // Fallback: draw a glowing circle with safe radius
            ctx.beginPath();
            ctx.arc(0, 0, safePositive(size / 2, 2), 0, Math.PI * 2);
            ctx.fillStyle = `${assetColor}${Math.round(asset.opacity * 255).toString(16).padStart(2, '0')}`;
            ctx.fill();
          }
        } else {
          // Fallback: draw a glowing circle with the asset's color
          ctx.translate(projectedX, projectedY);
          ctx.beginPath();
          ctx.arc(0, 0, safePositive(size / 2, 2), 0, Math.PI * 2);
          ctx.fillStyle = `${assetColor}${Math.round(asset.opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();
        }
        
        ctx.restore();

        // Slower drift for smoother movement
        asset.x += Math.sin(asset.rotationY) * 0.3 * clampedDelta;
        asset.y += Math.cos(asset.floatOffset + time * 0.001) * 0.2 * clampedDelta;

        // Wrap around screen edges
        if (asset.x < -100) asset.x = canvas.width + 100;
        if (asset.x > canvas.width + 100) asset.x = -100;
        if (asset.y < -100) asset.y = canvas.height + 100;
        if (asset.y > canvas.height + 100) asset.y = -100;
      });

      time += 1 * clampedDelta; // Slower time progression
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isLoading, loadedImages]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        mixBlendMode: 'screen',
        opacity: 0.4,
      }}
    />
  );
};

export default AssetGallery3D;
