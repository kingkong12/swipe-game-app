'use client';

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageData {
  id: number;
  src: string;
  fullSrc: string;
  alt: string;
}

interface ZoomViewerProps {
  image: ImageData | null;
  sourceRect: DOMRect | null;
  onClose: () => void;
}

/**
 * Smooth zoom viewer — image opens directly at center
 * with a clean scale + fade transition. No positional animation.
 */
export default function ZoomViewer({ image, sourceRect, onClose }: ZoomViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC to close
  useEffect(() => {
    if (!image) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [image, onClose]);

  // Click overlay to close
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
          initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
          animate={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
          exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={handleOverlayClick}
        >
          {/* Centered image */}
          <motion.div
            className="relative cursor-default max-w-[90vw] max-h-[85vh]"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={image.fullSrc}
              alt={image.alt}
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl shadow-black/60 object-contain"
              draggable={false}
            />

            {/* Close hint */}
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-white/40 text-xs whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Tap outside or press ESC to close
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
