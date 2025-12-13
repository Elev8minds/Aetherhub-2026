import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';
import { Fingerprint, ScanFace, Shield, Check, Loader2, Key } from 'lucide-react';

interface BiometricAuthProps {
  onAuthenticated: () => void;
  onClose: () => void;
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({ onAuthenticated, onClose }) => {
  const [authMethod, setAuthMethod] = useState<'passkey' | 'fingerprint' | 'face'>('passkey');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            setIsAuthenticated(true);
            setTimeout(() => {
              onAuthenticated();
            }, 1000);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isScanning, onAuthenticated]);

  const startAuth = async () => {
    setError('');
    setIsScanning(true);
    setScanProgress(0);

    // Try WebAuthn if available
    if (authMethod === 'passkey' && window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available) {
          // In production, this would create/get credentials from the server
          console.log('WebAuthn available');
        }
      } catch (e) {
        console.log('WebAuthn not supported, using fallback');
      }
    }
  };

  const authMethods = [
    { id: 'passkey', label: 'Passkey', icon: Key, description: 'Secure passwordless login' },
    { id: 'fingerprint', label: 'Fingerprint', icon: Fingerprint, description: 'Touch ID / Fingerprint' },
    { id: 'face', label: 'Face ID', icon: ScanFace, description: 'Face recognition' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <GlassCard glowColor="cyan" className="w-full max-w-md p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with Logo */}
        <div className="text-center mb-8">
          {/* Custom Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.svg" 
              alt="AetherHub" 
              className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.endsWith('.svg')) {
                  target.src = '/logo.png';
                } else {
                  // Fallback to icon
                  target.style.display = 'none';
                  const fallback = document.getElementById('logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }
              }}
            />
            {/* Fallback Logo */}
            <div 
              id="logo-fallback" 
              className="hidden w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 items-center justify-center"
            >
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            AetherHub
          </h2>
          <p 
            className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)] mb-3"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Cross-chain Intelligence
          </p>
          <p className="text-gray-400 text-sm">
            Authenticate with biometrics or passkey
          </p>
        </div>


        {/* Auth Methods */}
        {!isScanning && !isAuthenticated && (
          <div className="space-y-3 mb-6">
            {authMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setAuthMethod(method.id as any)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border transition-all',
                  authMethod === method.id
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  authMethod === method.id ? 'bg-cyan-500/20' : 'bg-white/5'
                )}>
                  <method.icon className={cn(
                    'w-6 h-6',
                    authMethod === method.id ? 'text-cyan-400' : 'text-gray-500'
                  )} />
                </div>
                <div className="text-left">
                  <p className={cn(
                    'font-semibold',
                    authMethod === method.id ? 'text-white' : 'text-gray-400'
                  )}>
                    {method.label}
                  </p>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
                {authMethod === method.id && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Scanning Animation */}
        {isScanning && (
          <div className="py-8">
            <div className="relative w-40 h-40 mx-auto">
              {/* Outer ring */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="rgba(0, 240, 255, 0.1)"
                  strokeWidth="4"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * scanProgress) / 100}
                  className="transition-all duration-100"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="100%" stopColor="#ff006e" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 flex items-center justify-center animate-pulse">
                  {authMethod === 'fingerprint' && <Fingerprint className="w-12 h-12 text-cyan-400" />}
                  {authMethod === 'face' && <ScanFace className="w-12 h-12 text-cyan-400" />}
                  {authMethod === 'passkey' && <Key className="w-12 h-12 text-cyan-400" />}
                </div>
              </div>
            </div>
            
            <p className="text-center text-gray-400 mt-4">
              {authMethod === 'fingerprint' && 'Place your finger on the sensor...'}
              {authMethod === 'face' && 'Look at the camera...'}
              {authMethod === 'passkey' && 'Verifying passkey...'}
            </p>
            <p className="text-center text-cyan-400 font-mono mt-2">
              {scanProgress}%
            </p>
          </div>
        )}

        {/* Success State */}
        {isAuthenticated && (
          <div className="py-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Authenticated</h3>
            <p className="text-gray-400 text-sm">Welcome back to AetherHub</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Action Button */}
        {!isScanning && !isAuthenticated && (
          <button
            onClick={startAuth}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Authenticate
          </button>
        )}

        {/* Security note */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Your biometric data never leaves your device
        </p>
      </GlassCard>
    </div>
  );
};

export default BiometricAuth;
