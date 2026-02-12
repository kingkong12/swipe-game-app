'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');

  // Home page is the entry point — clear flow state so user can start fresh
  useEffect(() => {
    localStorage.removeItem('swipe-flow-step');
    localStorage.removeItem('swipe-room-code');
  }, []);

  const [roomError, setRoomError] = useState('');
  const [joiningRoom, setJoiningRoom] = useState(false);

  const handleJoinRoom = async () => {
    const code = roomCode.trim().toUpperCase();
    if (!code) return;
    setJoiningRoom(true);
    setRoomError('');
    try {
      const res = await fetch(`/api/rooms?code=${code}`, { cache: 'no-store' });
      const data = await res.json() as { success?: boolean; room?: { code: string } };
      if (data.success && data.room) {
        localStorage.setItem('swipe-room-code', code);
        localStorage.setItem('swipe-flow-step', 'play');
        window.location.replace('/play');
      } else {
        setRoomError('Room not found. Check the code and try again.');
      }
    } catch {
      setRoomError('Something went wrong. Please try again.');
    }
    setJoiningRoom(false);
  };

  const handleStartDemo = () => {
    // Use default room
    localStorage.setItem('swipe-room-code', 'DEFAULT');
    localStorage.setItem('swipe-flow-step', 'play');
    window.location.replace('/play');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo / Title */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Discover Your Match
          </h1>
          <p className="text-white/60 text-lg">
            Discover what truly matters to you
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          className="flex justify-center gap-8 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/5 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
            <p className="text-xs text-white/50">Swipe & Reflect</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/5 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-xs text-white/50">Play Together</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white/5 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-xs text-white/50">Reveal Insights</p>
          </div>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Join Room */}
          <div className="glass-card rounded-2xl p-6">
            <p className="text-white/60 text-sm mb-4 text-center">Enter your room code to start playing</p>
            <div className="flex gap-3">
              <Input
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setRoomError(''); }}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 uppercase tracking-widest text-center font-mono"
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <Button
                onClick={handleJoinRoom}
                disabled={!roomCode.trim() || joiningRoom}
                className="px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
              >
                {joiningRoom ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Join'}
              </Button>
            </div>
            {roomError && <p className="text-red-400 text-xs mt-2 text-center">{roomError}</p>}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="mt-12 text-sm text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          An interactive experience in self-discovery
        </motion.p>
      </motion.div>
    </div>
  );
}
