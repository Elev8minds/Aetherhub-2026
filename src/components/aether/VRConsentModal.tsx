import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Eye, Lock, FileCheck, AlertTriangle, 
  Check, X, Glasses, Globe, Database, Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VRConsentModalProps {
  isOpen: boolean;
  onConsent: () => void;
  onDecline: () => void;
  deviceInfo?: {
    name: string;
    type: string;
    capabilities: string[];
  } | null;
}

const VRConsentModal: React.FC<VRConsentModalProps> = ({
  isOpen,
  onConsent,
  onDecline,
  deviceInfo
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState({
    dataCollection: false,
    encryption: false,
    noStorage: false,
    compliance: false
  });

  const allAccepted = Object.values(acceptedTerms).every(Boolean);

  const consentItems = [
    {
      id: 'dataCollection',
      icon: Eye,
      title: 'VR Session Data',
      description: 'We collect minimal session data (duration, interactions) to improve your experience. No biometric data is stored.',
      color: 'cyan'
    },
    {
      id: 'encryption',
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All VR sessions are encrypted using TLS 1.3 and WebRTC DTLS. Your portfolio data is protected with AES-256.',
      color: 'green'
    },
    {
      id: 'noStorage',
      icon: Database,
      title: 'No Long-Term Storage',
      description: 'VR session data is processed in real-time and not stored permanently. Session logs are deleted after 24 hours.',
      color: 'purple'
    },
    {
      id: 'compliance',
      icon: FileCheck,
      title: 'Regulatory Compliance',
      description: 'This service complies with GDPR, MiCA, and SEC regulations. Audit logs are maintained for compliance purposes.',
      color: 'magenta'
    }
  ];

  const handleToggle = (id: string) => {
    setAcceptedTerms(prev => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev]
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 rounded-3xl border border-cyan-500/30 shadow-[0_0_60px_rgba(0,240,255,0.2)]"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-white/10">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-magenta-500/10" />
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
                  <Glasses className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    VR Mode Consent
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Review and accept terms before entering immersive mode
                  </p>
                </div>
              </div>
              
              {/* Device Info */}
              {deviceInfo && (
                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-sm text-white font-medium">{deviceInfo.name}</p>
                    <p className="text-xs text-gray-500">{deviceInfo.type} • {deviceInfo.capabilities.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="p-4 mx-6 mt-6 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 font-medium text-sm">Institutional Security</p>
                <p className="text-amber-400/70 text-xs mt-1">
                  VR sessions use zero-knowledge proofs for privacy-preserving portfolio views. 
                  Your actual balances are never exposed in VR space.
                </p>
              </div>
            </div>

            {/* Consent Items */}
            <div className="p-6 space-y-4">
              {consentItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={cn(
                    'w-full p-4 rounded-xl border transition-all text-left group',
                    acceptedTerms[item.id as keyof typeof acceptedTerms]
                      ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                      item.color === 'cyan' && 'bg-cyan-500/20',
                      item.color === 'green' && 'bg-green-500/20',
                      item.color === 'purple' && 'bg-purple-500/20',
                      item.color === 'magenta' && 'bg-pink-500/20',
                    )}>
                      <item.icon className={cn(
                        'w-5 h-5',
                        item.color === 'cyan' && 'text-cyan-400',
                        item.color === 'green' && 'text-green-400',
                        item.color === 'purple' && 'text-purple-400',
                        item.color === 'magenta' && 'text-pink-400',
                      )} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{item.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                    </div>
                    <div className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                      acceptedTerms[item.id as keyof typeof acceptedTerms]
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'border-gray-600 group-hover:border-gray-400'
                    )}>
                      {acceptedTerms[item.id as keyof typeof acceptedTerms] && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* ZK Proof Info */}
            <div className="px-6 pb-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <Fingerprint className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-semibold text-sm">Zero-Knowledge Privacy</span>
                </div>
                <p className="text-gray-400 text-xs">
                  Your portfolio is rendered using ZK-SNARKs, allowing you to view and interact with your assets 
                  without exposing actual values. Third parties cannot intercept or view your financial data.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onDecline}
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-semibold hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Decline
              </button>
              <button
                onClick={onConsent}
                disabled={!allAccepted}
                className={cn(
                  'flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                  allAccepted
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                )}
              >
                <Shield className="w-5 h-5" />
                Accept & Enter VR
              </button>
            </div>

            {/* Compliance Footer */}
            <div className="px-6 pb-6">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" /> GDPR Compliant
                </span>
                <span className="flex items-center gap-1">
                  <FileCheck className="w-3 h-3" /> MiCA Ready
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> SEC Audit Trail
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VRConsentModal;
