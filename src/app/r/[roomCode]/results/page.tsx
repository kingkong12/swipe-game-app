'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, Share2, Check, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSessionAnswers, getActiveScenarios } from '@/lib/mock-data';
import { copyToClipboard } from '@/lib/utils';

export default function RoomResultsPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.roomCode as string;
  
  const [answers, setAnswers] = useState<{ scenarioId: string; answer: 'yes' | 'no' }[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sessionId = localStorage.getItem('swipe-session-id');
    if (sessionId) {
      const userAnswers = getSessionAnswers(sessionId);
      setAnswers(userAnswers);
    }

    // Fire confetti!
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#ec4899', '#f59e0b'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#ec4899', '#f59e0b'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const yesCount = answers.filter((a) => a.answer === 'yes').length;
  const noCount = answers.filter((a) => a.answer === 'no').length;
  const total = answers.length;
  const yesPercentage = total > 0 ? Math.round((yesCount / total) * 100) : 0;

  const getPersonalityInsight = () => {
    if (yesPercentage >= 80) {
      return {
        title: 'The Compassionate Soul',
        description: 'You have an extraordinary capacity for empathy and service.',
        emoji: '💖',
      };
    } else if (yesPercentage >= 60) {
      return {
        title: 'The Mindful Helper',
        description: 'You balance self-care with care for others beautifully.',
        emoji: '🌟',
      };
    } else if (yesPercentage >= 40) {
      return {
        title: 'The Thoughtful Observer',
        description: 'You approach helping with discernment and wisdom.',
        emoji: '🦉',
      };
    } else {
      return {
        title: 'The Self-Aware Individual',
        description: 'You value honesty about your boundaries.',
        emoji: '🔮',
      };
    }
  };

  const insight = getPersonalityInsight();

  const handleShare = useCallback(async () => {
    const text = `I completed the Swipe Game! ${insight.emoji} I'm "${insight.title}" - ${yesPercentage}% YES`;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [yesPercentage, insight]);

  const handleContinue = () => {
    router.push(`/r/${roomCode}/reveal`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <div className="text-6xl mb-4">{insight.emoji}</div>
          <h1 className="text-3xl font-bold text-white mb-2">Complete!</h1>
          <p className="text-white/60">Here's what your answers reveal</p>
        </motion.div>

        <motion.div
          className="glass-card rounded-3xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-white/10"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={351.86}
                  initial={{ strokeDashoffset: 351.86 }}
                  animate={{ strokeDashoffset: 351.86 - (351.86 * yesPercentage) / 100 }}
                  transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className="text-3xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {yesPercentage}%
                </motion.span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Heart className="w-5 h-5 text-green-400" fill="currentColor" />
                <span className="text-2xl font-bold text-white">{yesCount}</span>
              </div>
              <p className="text-sm text-white/50">Yes</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <X className="w-5 h-5 text-red-400" />
                <span className="text-2xl font-bold text-white">{noCount}</span>
              </div>
              <p className="text-sm text-white/50">No</p>
            </div>
          </div>

          <div className="text-center border-t border-white/10 pt-6">
            <h3 className="text-xl font-semibold text-white mb-2">{insight.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{insight.description}</p>
          </div>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={handleContinue}
            size="xl"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-500/25 group"
          >
            Discover the Meaning
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            onClick={handleShare}
            variant="glass"
            size="lg"
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="mr-2 w-5 h-5 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="mr-2 w-5 h-5" />
                Share Results
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
