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

import React, { useState } from 'react';
import { 
  Github, Twitter, MessageCircle, Globe, 
  Shield, Lock, Zap, Heart 
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [logoError, setLogoError] = useState(false);

  const links = {
    product: [
      { label: 'Dashboard', href: '#' },
      { label: 'Portfolio', href: '#' },
      { label: 'Swap', href: '#' },
      { label: 'Earn', href: '#' },
      { label: 'AI Advisor', href: '#' },
    ],
    resources: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Status', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press Kit', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  };

  const socials = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: MessageCircle, href: '#', label: 'Discord' },
    { icon: Globe, href: '#', label: 'Website' },
  ];

  const features = [
    { icon: Shield, label: 'Bank-grade Security' },
    { icon: Lock, label: 'Non-custodial' },
    { icon: Zap, label: '100+ Chains' },
  ];

  // Fallback logo component
  const FallbackLogo = () => (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
      <span className="text-white font-bold text-xl" style={{ fontFamily: 'Orbitron, sans-serif' }}>A</span>
    </div>
  );

  return (
    <footer className="relative border-t border-white/5 bg-black/50 backdrop-blur-xl">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features bar */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 pb-12 border-b border-white/5">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-400">
              <feature.icon className="w-5 h-5 text-cyan-400" />
              <span className="text-sm">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            {/* Logo with Tagline */}
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-4">
              {/* Custom Logo */}
              {!logoError ? (
                <img 
                  src="/logo.svg" 
                  alt="AetherHub" 
                  className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.endsWith('.svg')) {
                      target.src = '/logo.png';
                    } else {
                      setLogoError(true);
                    }
                  }}
                />
              ) : (
                <FallbackLogo />
              )}
              
              {/* Brand Name + Tagline */}
              <div className="flex flex-col">
                <span 
                  className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent" 
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  AetherHub
                </span>
                <span 
                  className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)] mt-0.5"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  Cross-chain Intelligence
                </span>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm mb-4">
              The future of cross-chain finance. Manage, optimize, and grow your wealth across 100+ blockchains.
            </p>
            <div className="flex gap-3">
              {socials.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {links.product.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-gray-500 hover:text-cyan-400 transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {links.resources.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-gray-500 hover:text-cyan-400 transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {links.company.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-gray-500 hover:text-cyan-400 transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {links.legal.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-gray-500 hover:text-cyan-400 transition-colors text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright & Trademark Notice */}
        <div className="mb-8 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-gray-400 text-xs leading-relaxed text-center">
            <strong className="text-cyan-400">AetherHub 2049™</strong> and the AetherHub logo are trademarks of Elev8minds LLC. All rights reserved.
            <br />
            Copyright © {currentYear} Elev8minds LLC. All rights reserved.
            <br />
            This software and associated documentation files are the copyrighted property of Elev8minds LLC.
            Unauthorized copying, modification, distribution, or use is strictly prohibited without prior written permission.
            <br />
            For licensing inquiries: <a href="mailto:legal@elev8minds.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">legal@elev8minds.com</a>
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © {currentYear} AetherHub 2049™ Elev8minds LLC. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm flex items-center gap-1">
            Built with <Heart className="w-4 h-4 text-magenta-400" /> for the future of finance
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
