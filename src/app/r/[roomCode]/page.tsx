'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeDeck } from '@/components/swipe/SwipeDeck';
import { 
  getActiveScenarios, 
  setAnswer, 
  removeAnswer, 
  getSessionAnswers,
  getRoomByCode,
  MockRoom,
} from '@/lib/mock-data';
import { nanoid } from 'nanoid';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('swipe-session-id');
  if (!sessionId) {
    sessionId = nanoid(12);
    localStorage.setItem('swipe-session-id', sessionId);
  }
  return sessionId;
}

export default function RoomPlayPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.roomCode as string;
  
  const [sessionId, setSessionId] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [room, setRoom] = useState<MockRoom | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [scenarios, setScenarios] = useState<ReturnType<typeof getActiveScenarios>>([]);

  useEffect(() => {
    const id = getSessionId();
    setSessionId(id);
    
    // Check if room exists
    const foundRoom = getRoomByCode(roomCode);
    if (foundRoom) {
      setRoom(foundRoom);
      setScenarios(getActiveScenarios());
    } else {
      setNotFound(true);
    }
    
    setIsReady(true);
  }, [roomCode]);

  const handleSwipe = useCallback(async (scenarioId: string, answer: 'yes' | 'no') => {
    setAnswer(sessionId, scenarioId, answer);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }, [sessionId]);

  const handleUndo = useCallback(async (scenarioId: string) => {
    removeAnswer(sessionId, scenarioId);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }, [sessionId]);

  const handleComplete = useCallback(() => {
    router.push(`/r/${roomCode}/results`);
  }, [router, roomCode]);

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

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Room Not Found</h1>
          <p className="text-white/60 mb-6">
            The room code <span className="font-mono text-purple-400">{roomCode}</span> doesn't exist or has been closed.
          </p>
          <Link href="/">
            <Button variant="glass">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Room Header */}
      <div className="fixed top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="text-sm text-white/50">
            Room: <span className="font-mono text-purple-400">{roomCode}</span>
          </span>
          {room && (
            <span className="text-sm text-white/50">{room.title}</span>
          )}
        </div>
      </div>

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
            className="pt-16"
          >
            <SwipeDeck
              scenarios={scenarios.map(s => ({
                id: s.id,
                text: s.text,
                shortLabel: s.shortLabel,
                category: s.category,
              }))}
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
