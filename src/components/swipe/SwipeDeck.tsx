'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  animate,
  PanInfo,
} from 'framer-motion';
import { X, Heart, Undo2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/lib/store';

export interface Scenario {
  id: string;
  text: string;
  shortLabel?: string | null;
  category?: string | null;
}

interface SwipeDeckProps {
  scenarios: Scenario[];
  onSwipe: (scenarioId: string, answer: 'yes' | 'no') => Promise<void>;
  onUndo: (scenarioId: string) => Promise<void>;
  onComplete: () => void;
  initialIndex?: number;
}

// Swipe physics configuration
const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 300;
const CARD_ROTATION = 15;

export function SwipeDeck({
  scenarios,
  onSwipe,
  onUndo,
  onComplete,
  initialIndex = 0,
}: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState<{ id: string; answer: 'yes' | 'no' }[]>([]);
  
  const { soundEnabled, toggleSound, highContrastMode } = useGameStore();

  // ALL HOOKS MUST BE AT TOP LEVEL - before any conditional returns
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotate = useTransform(x, [-200, 0, 200], [-CARD_ROTATION, 0, CARD_ROTATION]);
  const scale = useTransform(x, [-200, -50, 0, 50, 200], [0.95, 0.98, 1, 0.98, 0.95]);
  
  const boxShadow = useTransform(
    x,
    [-200, 0, 200],
    [
      '20px 20px 60px rgba(0,0,0,0.4)',
      '0px 10px 30px rgba(0,0,0,0.3)',
      '-20px 20px 60px rgba(0,0,0,0.4)',
    ]
  );
  
  const yesOpacity = useTransform(x, [0, 50, SWIPE_THRESHOLD], [0, 0.5, 1]);
  const noOpacity = useTransform(x, [-SWIPE_THRESHOLD, -50, 0], [1, 0.5, 0]);
  
  const nextCardScale = useTransform(x, [-200, 0, 200], [0.98, 0.92, 0.98]);
  const nextCardY = useTransform(x, [-200, 0, 200], [8, 16, 8]);
  
  // Glow effect gradient - must be at top level
  const glowGradient = useTransform(
    x,
    [-200, 0, 200],
    [
      'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, transparent 50%)',
      'transparent',
      'linear-gradient(45deg, rgba(34,197,94,0.1) 0%, transparent 50%)',
    ]
  );

  const currentCard = scenarios[currentIndex];
  const progress = (currentIndex / scenarios.length) * 100;
  const isComplete = currentIndex >= scenarios.length;

  // Play sound effect
  const playSound = useCallback((type: 'yes' | 'no' | 'undo') => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = type === 'yes' ? 523.25 : type === 'no' ? 349.23 : 440;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  // Animate card off screen
  const animateCardOut = useCallback(async (direction: 'yes' | 'no') => {
    const targetX = direction === 'yes' ? 400 : -400;
    
    await animate(x, targetX, {
      type: 'spring',
      stiffness: 600,
      damping: 30,
      velocity: direction === 'yes' ? 500 : -500,
    });
  }, [x]);

  // Handle swipe action
  const handleSwipe = useCallback(async (direction: 'yes' | 'no') => {
    if (isAnimating || !currentCard) return;
    
    setIsAnimating(true);
    playSound(direction);
    
    setHistory((prev) => [...prev, { id: currentCard.id, answer: direction }]);
    
    await animateCardOut(direction);
    
    onSwipe(currentCard.id, direction);
    
    x.set(0);
    y.set(0);
    setCurrentIndex((prev) => prev + 1);
    setIsAnimating(false);
  }, [currentCard, isAnimating, onSwipe, playSound, animateCardOut, x, y]);

  // Handle undo
  const handleUndo = useCallback(async () => {
    if (isAnimating || history.length === 0 || currentIndex === 0) return;
    
    setIsAnimating(true);
    playSound('undo');
    
    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    
    await onUndo(lastAction.id);
    
    setCurrentIndex((prev) => prev - 1);
    x.set(0);
    y.set(0);
    setIsAnimating(false);
  }, [history, currentIndex, isAnimating, onUndo, playSound, x, y]);

  // Handle drag end
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      
      const swipedRight = offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD;
      const swipedLeft = offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD;
      
      if (swipedRight) {
        handleSwipe('yes');
      } else if (swipedLeft) {
        handleSwipe('no');
      } else {
        animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
        animate(y, 0, { type: 'spring', stiffness: 500, damping: 30 });
      }
    },
    [handleSwipe, x, y]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      
      if (e.key === 'ArrowRight' || e.key === 'l') {
        handleSwipe('yes');
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        handleSwipe('no');
      } else if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, handleUndo, isAnimating]);

  // Check for completion
  useEffect(() => {
    if (isComplete && !isAnimating) {
      const timer = setTimeout(() => {
        onComplete();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isComplete, isAnimating, onComplete]);

  // RENDER - after all hooks
  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
          <p className="text-white/70 text-lg">Loading your results...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 select-none">
      {/* NO Guy - Left Side (Always Visible) */}
      <div className="fixed left-[-80px] md:left-[-40px] lg:left-0 top-1/2 -translate-y-1/2 pointer-events-none z-0">
        <img 
          src="/no-guy.png" 
          alt="No" 
          className="w-72 h-72 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] object-contain drop-shadow-2xl"
        />
      </div>

      {/* YES Guy - Right Side (Always Visible) */}
      <div className="fixed right-[-80px] md:right-[-40px] lg:right-0 top-1/2 -translate-y-1/2 pointer-events-none z-0">
        <img 
          src="/yes-guy.png" 
          alt="Yes" 
          className="w-72 h-72 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] object-contain drop-shadow-2xl"
        />
      </div>

      {/* Progress Bar */}
      <div className="w-[280px] md:w-[320px] lg:w-[380px] mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white/70">
            {currentIndex + 1} of {scenarios.length}
          </span>
          <button
            onClick={toggleSound}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-white/70" />
            ) : (
              <VolumeX className="w-5 h-5 text-white/50" />
            )}
          </button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card Stack - Adjusted to fit between side images */}
      <div className="relative w-[280px] md:w-[320px] lg:w-[380px] h-[350px] md:h-[400px] z-20">
        {/* Background cards (peeking) */}
        {scenarios.slice(currentIndex + 1, currentIndex + 3).map((scenario, i) => (
          <motion.div
            key={scenario.id}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20"
            style={{
              scale: i === 0 ? nextCardScale : 0.88,
              y: i === 0 ? nextCardY : 24,
              zIndex: -i - 1,
            }}
            initial={false}
          >
            <div className="absolute inset-0 rounded-3xl opacity-50" />
          </motion.div>
        ))}

        {/* Active Card */}
        {currentCard && (
          <motion.div
            key={currentCard.id}
            className={cn(
              'absolute inset-0 cursor-grab active:cursor-grabbing touch-none',
              'rounded-3xl bg-gradient-to-br backdrop-blur-xl border',
              highContrastMode
                ? 'from-zinc-800 to-zinc-900 border-white/40'
                : 'from-white/15 to-white/5 border-white/20'
            )}
            style={{ 
              x, 
              y,
              rotate, 
              scale,
              boxShadow,
            }}
            drag={!isAnimating}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
          >
            {/* Card Content */}
            <div className="relative h-full p-8 flex flex-col items-center justify-center overflow-hidden">
              {/* YES Stamp */}
              <motion.div
                className="absolute top-8 right-4 rotate-12 pointer-events-none"
                style={{ opacity: yesOpacity }}
              >
                <div className="px-5 py-2 border-4 border-green-500 rounded-lg bg-green-500/20 shadow-lg shadow-green-500/20">
                  <span className="text-2xl font-black text-green-500 tracking-wider">
                    YES
                  </span>
                </div>
              </motion.div>

              {/* NO Stamp */}
              <motion.div
                className="absolute top-8 left-4 -rotate-12 pointer-events-none"
                style={{ opacity: noOpacity }}
              >
                <div className="px-5 py-2 border-4 border-red-500 rounded-lg bg-red-500/20 shadow-lg shadow-red-500/20">
                  <span className="text-2xl font-black text-red-500 tracking-wider">
                    NO
                  </span>
                </div>
              </motion.div>

              {/* Question Text */}
              <p
                className={cn(
                  'text-center font-medium leading-relaxed max-w-[240px] md:max-w-[280px]',
                  highContrastMode ? 'text-white text-xl md:text-2xl' : 'text-white/90 text-lg md:text-xl'
                )}
              >
                {currentCard.text}
              </p>
            </div>

            {/* Glow effect on drag */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: glowGradient }}
            />
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mt-8">
        {/* Undo Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="glass"
            size="icon-lg"
            onClick={handleUndo}
            disabled={history.length === 0 || isAnimating}
            aria-label="Undo last swipe"
            className="opacity-60 hover:opacity-100 disabled:opacity-20"
          >
            <Undo2 className="w-6 h-6" />
          </Button>
        </motion.div>

        {/* NO Button */}
        <motion.div 
          whileHover={{ scale: 1.08 }} 
          whileTap={{ scale: 0.92 }}
        >
          <Button
            variant="no"
            size="icon-xl"
            onClick={() => handleSwipe('no')}
            disabled={isAnimating}
            aria-label="Swipe No"
            className="shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transition-shadow"
          >
            <X className="w-10 h-10" strokeWidth={3} />
          </Button>
        </motion.div>

        {/* YES Button */}
        <motion.div 
          whileHover={{ scale: 1.08 }} 
          whileTap={{ scale: 0.92 }}
        >
          <Button
            variant="yes"
            size="icon-xl"
            onClick={() => handleSwipe('yes')}
            disabled={isAnimating}
            aria-label="Swipe Yes"
            className="shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-shadow"
          >
            <Heart className="w-10 h-10" fill="currentColor" />
          </Button>
        </motion.div>
      </div>

      {/* Keyboard hint */}
      <p className="mt-6 text-sm text-white/30 hidden md:block">
        ← → arrow keys to swipe • Ctrl+Z to undo
      </p>
    </div>
  );
}
