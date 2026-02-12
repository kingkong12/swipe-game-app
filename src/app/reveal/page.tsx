'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import RevealWrapper from '@/components/reveal/RevealWrapper';

const POLL_INTERVAL = 2000;
const GLOW_DURATION = 3500;

interface ImageData {
  id: number;
  src: string;
  fullSrc: string;
  alt: string;
}

type Phase = 'waiting' | 'glow' | 'collage';

export default function RevealPage() {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [images, setImages] = useState<ImageData[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Block back button
  useEffect(() => {
    const blockBack = () => window.history.forward();
    window.addEventListener('popstate', blockBack);
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) blockBack();
    });
    return () => {
      window.removeEventListener('popstate', blockBack);
    };
  }, []);

  // Load image manifest
  useEffect(() => {
    fetch('/smruti-manifest.json', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setImages(data as ImageData[]))
      .catch((err) => console.error('Failed to load image manifest:', err));
  }, []);

  // Poll the trigger API
  useEffect(() => {
    async function checkTrigger() {
      try {
        const res = await fetch('/api/trigger', { cache: 'no-store' });
        const data = (await res.json()) as { success?: boolean; triggered?: boolean };
        if (data.success && data.triggered) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setPhase('glow');
        }
      } catch {
        // ignore, keep polling
      }
    }

    checkTrigger();
    pollingRef.current = setInterval(checkTrigger, POLL_INTERVAL);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Glow phase -> collage phase
  useEffect(() => {
    if (phase === 'glow') {
      const timer = setTimeout(() => setPhase('collage'), GLOW_DURATION);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // ---- WAITING: "Finding your match" loops until admin triggers ----
  if (phase === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-purple-500/20"
              initial={{ width: 100, height: 100, opacity: 0 }}
              animate={{ width: [100, 600], height: [100, 600], opacity: [0.6, 0] }}
              transition={{ duration: 2.5, delay: i * 0.6, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
        </div>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 3 === 0 ? '#a855f7' : i % 3 === 1 ? '#ec4899' : '#f59e0b',
                left: `${10 + (i * 7) % 80}%`,
                top: `${20 + (i * 13) % 60}%`,
              }}
              animate={{
                y: [-20, -80, -20],
                x: [0, i % 2 === 0 ? 30 : -30, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{ duration: 2 + (i % 3) * 0.5, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <motion.div
            className="relative w-28 h-28 mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 blur-xl opacity-60" />
            <motion.div
              className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-4 rounded-full bg-slate-900/80 flex items-center justify-center">
              <motion.span
                className="text-3xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                🔍
              </motion.span>
            </div>
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-white mb-3 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Finding your match...
          </motion.h2>
          <motion.p
            className="text-white/50 text-center text-sm max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Analyzing your responses to find the perfect connection
          </motion.p>
          <div className="flex gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-purple-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- GLOW: cinematic transition before collage ----
  if (phase === 'glow') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0) 70%)',
            }}
            initial={{ width: 0, height: 0 }}
            animate={{ width: 600, height: 600 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(236,72,153,0) 60%)',
            }}
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ width: 350, height: 350, opacity: [0, 1, 0.6] }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-4 h-4 rounded-full bg-white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 3, 1.5], opacity: [0, 1, 0] }}
            transition={{ duration: 2, delay: 0.3 }}
          />
        </motion.div>

        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: i % 3 === 0 ? '#a855f7' : i % 3 === 1 ? '#ec4899' : '#f59e0b',
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: Math.cos((i / 16) * Math.PI * 2) * (120 + Math.random() * 80),
              y: Math.sin((i / 16) * Math.PI * 2) * (120 + Math.random() * 80),
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{ duration: 2, delay: 0.8 + i * 0.05, ease: 'easeOut' }}
          />
        ))}

        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 1.05] }}
          transition={{ duration: 3.5, times: [0, 0.3, 0.7, 1] }}
        >
          <motion.span
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent"
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Your match is here...
          </motion.span>
        </motion.div>
      </div>
    );
  }

  // ---- COLLAGE: Heart-shaped image reveal ----
  return <RevealWrapper images={images} />;
}
