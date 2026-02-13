'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeartCollage from './HeartCollage';
import ZoomViewer from './ZoomViewer';

interface ImageData {
  id: number;
  src: string;
  fullSrc: string;
  alt: string;
}

interface RevealWrapperProps {
  images: ImageData[];
}

/**
 * RevealWrapper orchestrates the cinematic reveal:
 * 1. Dark overlay fades in
 * 2. Heart collage scales and fades into view
 * 3. Subtle glow pulse around the heart
 * 4. Images can be clicked to open ZoomViewer
 */
export default function RevealWrapper({ images }: RevealWrapperProps) {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);

  const handleImageClick = useCallback((image: ImageData, rect: DOMRect) => {
    setSourceRect(rect);
    setSelectedImage(image);
  }, []);

  const handleCloseZoom = useCallback(() => {
    setSelectedImage(null);
    setSourceRect(null);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-auto"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a0f 60%, #000000 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    >
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 3 === 0 ? 'rgba(236,72,153,0.4)' : i % 3 === 1 ? 'rgba(168,85,247,0.3)' : 'rgba(251,191,36,0.3)',
              left: `${5 + (i * 4.7) % 90}%`,
              top: `${10 + (i * 7.3) % 80}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 3 + (i % 4),
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Title */}
      <motion.div
        className="relative z-10 text-center mb-6 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
      >
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-amber-300 bg-clip-text text-transparent">
          Source of Infinite Love
        </h1>
        <p className="text-white/40 text-sm mt-1">Tap any image to view</p>
      </motion.div>

      {/* Heart Collage */}
      <motion.div
        className="relative z-10 w-full px-4"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.4,
          delay: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <HeartCollage images={images} onImageClick={handleImageClick} />
      </motion.div>

      {/* Zoom Viewer overlay */}
      <ZoomViewer
        image={selectedImage}
        sourceRect={sourceRect}
        onClose={handleCloseZoom}
      />
    </motion.div>
  );
}
