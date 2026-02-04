'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeDeck, Scenario } from '@/components/swipe/SwipeDeck';
import { nanoid } from 'nanoid';

// Default room ID for demo mode
const DEMO_ROOM_ID = 'room1';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('swipe-session-id');
  if (!sessionId) {
    sessionId = nanoid(12);
    localStorage.setItem('swipe-session-id', sessionId);
  }
  return sessionId;
}

// Fisher-Yates shuffle algorithm for randomizing question order
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function PlayPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = getSessionId();
    setSessionId(id);
    
    // Fetch scenarios from API
    async function loadScenarios() {
      try {
        const response = await fetch('/api/scenarios');
        const data = await response.json() as { success?: boolean; scenarios?: Scenario[] };
        
        if (data.success && data.scenarios) {
          // Shuffle scenarios so each user gets a different order
          setScenarios(shuffleArray(data.scenarios));
        } else {
          // Fallback to mock data if API fails
          console.warn('API failed, using fallback data');
          const { getActiveScenarios } = await import('@/lib/mock-data');
          const mockScenarios = getActiveScenarios().map(s => ({
            id: s.id,
            text: s.text,
            shortLabel: s.shortLabel,
            category: s.category,
          }));
          setScenarios(shuffleArray(mockScenarios));
        }
      } catch (err) {
        console.error('Error loading scenarios:', err);
        // Fallback to mock data
        const { getActiveScenarios } = await import('@/lib/mock-data');
        const mockScenarios = getActiveScenarios().map(s => ({
          id: s.id,
          text: s.text,
          shortLabel: s.shortLabel,
          category: s.category,
        }));
        setScenarios(shuffleArray(mockScenarios));
      }
      setIsReady(true);
    }
    
    loadScenarios();
  }, []);

  const handleSwipe = useCallback(async (scenarioId: string, answer: 'yes' | 'no') => {
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          scenarioId,
          answer,
          roomId: DEMO_ROOM_ID,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to save answer');
      }
    } catch (err) {
      console.error('Error saving answer:', err);
      // Still continue even if API fails - store locally as backup
      const { setAnswer } = await import('@/lib/mock-data');
      setAnswer(sessionId, scenarioId, answer);
    }
  }, [sessionId]);

  const handleUndo = useCallback(async (scenarioId: string) => {
    try {
      const response = await fetch(`/api/answers?sessionId=${sessionId}&scenarioId=${scenarioId}&roomId=${DEMO_ROOM_ID}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        console.error('Failed to undo answer');
      }
    } catch (err) {
      console.error('Error undoing answer:', err);
      // Fallback to local removal
      const { removeAnswer } = await import('@/lib/mock-data');
      removeAnswer(sessionId, scenarioId);
    }
  }, [sessionId]);

  const handleComplete = useCallback(() => {
    // Store session info for results page
    localStorage.setItem('swipe-room-id', DEMO_ROOM_ID);
    router.push('/results');
  }, [router]);

  const startGame = () => {
    setShowInstructions(false);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Oops!</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 rounded-xl text-white font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {showInstructions ? (
          <motion.div
            key="instructions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4"
          >
            <motion.div
              className="max-w-md w-full text-center"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="glass-card rounded-3xl p-8 mb-6">
                <h1 className="text-3xl font-bold text-white mb-6">How to Play</h1>
                
                <div className="space-y-6 text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <span className="text-2xl">👉</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Swipe Right</p>
                      <p className="text-white/60 text-sm">for YES — "I would do this"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <span className="text-2xl">👈</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Swipe Left</p>
                      <p className="text-white/60 text-sm">for NO — "I wouldn't do this"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <span className="text-2xl">⌨️</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Or Use Buttons</p>
                      <p className="text-white/60 text-sm">Tap the buttons below the card or use arrow keys</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.button
                onClick={startGame}
                className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold text-lg shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                I'm Ready!
              </motion.button>
              
              <p className="mt-6 text-sm text-white/40">
                {scenarios.length} scenarios • ~3 minutes
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <SwipeDeck
              scenarios={scenarios}
              onSwipe={handleSwipe}
              onUndo={handleUndo}
              onComplete={handleComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
