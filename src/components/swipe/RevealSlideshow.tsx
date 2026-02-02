'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Quote, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export interface RevealSlide {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  quote: string | null;
  quoteAuthor: string | null;
}

interface RevealSlideshowProps {
  slides: RevealSlide[];
  onComplete?: () => void;
}

export function RevealSlideshow({ slides, onComplete }: RevealSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [direction, setDirection] = useState(0);

  const currentSlide = slides[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === slides.length - 1;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      if (currentIndex < slides.length - 1) {
        setDirection(1);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsAutoPlaying(false);
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, currentIndex, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isLast]);

  const goNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, slides.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleFinish = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  if (!currentSlide) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'w-6 bg-gradient-to-r from-purple-500 to-pink-500'
                    : index < currentIndex
                    ? 'bg-white/40'
                    : 'bg-white/20'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label={isAutoPlaying ? 'Pause' : 'Auto-play'}
          >
            {isAutoPlaying ? (
              <Pause className="w-5 h-5 text-white/70" />
            ) : (
              <Play className="w-5 h-5 text-white/70" />
            )}
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-2xl relative min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="glass-card rounded-3xl p-8 md:p-12"
            >
              {/* Title */}
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-white mb-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {currentSlide.title}
              </motion.h2>

              {/* Image */}
              {currentSlide.imageUrl && (
                <motion.div
                  className="mb-6 rounded-2xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <img
                    src={currentSlide.imageUrl}
                    alt=""
                    className="w-full h-48 object-cover"
                  />
                </motion.div>
              )}

              {/* Body */}
              {currentSlide.body && (
                <motion.div
                  className="prose prose-invert prose-lg max-w-none mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="text-white/80 leading-relaxed mb-4">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-white font-semibold">{children}</strong>
                      ),
                    }}
                  >
                    {currentSlide.body}
                  </ReactMarkdown>
                </motion.div>
              )}

              {/* Quote */}
              {currentSlide.quote && (
                <motion.div
                  className="relative mt-8 pt-6 border-t border-white/10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Quote className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 text-purple-400" />
                  <blockquote className="text-center">
                    <p className="text-lg md:text-xl text-white/90 italic leading-relaxed">
                      &ldquo;{currentSlide.quote}&rdquo;
                    </p>
                    {currentSlide.quoteAuthor && (
                      <footer className="mt-3 text-sm text-white/50">
                        — {currentSlide.quoteAuthor}
                      </footer>
                    )}
                  </blockquote>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="glass"
            size="lg"
            onClick={goPrev}
            disabled={isFirst}
            className="opacity-70 hover:opacity-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>

          <span className="text-sm text-white/50">
            {currentIndex + 1} / {slides.length}
          </span>

          {isLast ? (
            <Button
              size="lg"
              onClick={handleFinish}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <Home className="w-5 h-5 mr-2" />
              Finish
            </Button>
          ) : (
            <Button
              variant="glass"
              size="lg"
              onClick={goNext}
              className="opacity-70 hover:opacity-100"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
