'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, Share2, Check, Heart, X, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/utils';

// Default room ID for demo mode
const DEMO_ROOM_ID = 'room1';

interface ScenarioAggregate {
  id: string;
  text: string;
  yesCount: number;
  noCount: number;
  yesPercentage: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<{ scenarioId: string; answer: 'yes' | 'no' }[]>([]);
  const [copied, setCopied] = useState(false);
  const [showDemographics, setShowDemographics] = useState(false);
  const [demographics, setDemographics] = useState<ScenarioAggregate[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const sessionId = localStorage.getItem('swipe-session-id');
      const roomId = localStorage.getItem('swipe-room-id') || DEMO_ROOM_ID;

      try {
        // Type definitions for API responses
        type AnswersResponse = { success?: boolean; answers?: { scenarioId: string; answer: 'yes' | 'no' }[] };
        type ScenariosResponse = { success?: boolean; scenarios?: { id: string; text: string }[] };
        type AggregatesResponse = { success?: boolean; aggregates?: Record<string, { yes: number; no: number }>; totalParticipants?: number };

        // Fetch user's answers from API
        if (sessionId) {
          const answersResponse = await fetch(`/api/answers?sessionId=${sessionId}&roomId=${roomId}`);
          const answersData = await answersResponse.json() as AnswersResponse;
          
          if (answersData.success && answersData.answers) {
            setAnswers(answersData.answers);
          } else {
            // Fallback to local storage
            const { getSessionAnswers } = await import('@/lib/mock-data');
            setAnswers(getSessionAnswers(sessionId));
          }
        }

        // Fetch scenarios
        const scenariosResponse = await fetch('/api/scenarios');
        const scenariosData = await scenariosResponse.json() as ScenariosResponse;

        // Fetch aggregates from API
        const aggregatesResponse = await fetch(`/api/aggregates?roomId=${roomId}`);
        const aggregatesData = await aggregatesResponse.json() as AggregatesResponse;

        let scenarios: { id: string; text: string }[] = [];
        let aggregates: Record<string, { yes: number; no: number }> = {};

        if (scenariosData.success && scenariosData.scenarios) {
          scenarios = scenariosData.scenarios;
        } else {
          const { getActiveScenarios } = await import('@/lib/mock-data');
          scenarios = getActiveScenarios();
        }

        if (aggregatesData.success && aggregatesData.aggregates) {
          aggregates = aggregatesData.aggregates;
          setTotalResponses(aggregatesData.totalParticipants || 0);
        } else {
          const { getAggregates } = await import('@/lib/mock-data');
          aggregates = getAggregates();
        }

        // Build demographics data
        const demographicsData: ScenarioAggregate[] = scenarios.map((scenario) => {
          const agg = aggregates[scenario.id] || { yes: 0, no: 0 };
          const total = agg.yes + agg.no;
          return {
            id: scenario.id,
            text: scenario.text,
            yesCount: agg.yes,
            noCount: agg.no,
            yesPercentage: total > 0 ? Math.round((agg.yes / total) * 100) : 50,
          };
        });

        setDemographics(demographicsData);

        // Calculate total unique responses if not returned by API
        if (!aggregatesData.totalParticipants) {
          const maxResponses = Math.max(...demographicsData.map((d) => d.yesCount + d.noCount), 0);
          setTotalResponses(maxResponses);
        }
      } catch (error) {
        console.error('Error loading results data:', error);
        // Fallback to mock data
        const { getSessionAnswers, getAggregates, getActiveScenarios } = await import('@/lib/mock-data');
        
        if (sessionId) {
          setAnswers(getSessionAnswers(sessionId));
        }
        
        const aggregates = getAggregates();
        const scenarios = getActiveScenarios();
        
        const demographicsData: ScenarioAggregate[] = scenarios.map((scenario) => {
          const agg = aggregates[scenario.id] || { yes: 0, no: 0 };
          const total = agg.yes + agg.no;
          return {
            id: scenario.id,
            text: scenario.text,
            yesCount: agg.yes,
            noCount: agg.no,
            yesPercentage: total > 0 ? Math.round((agg.yes / total) * 100) : 50,
          };
        });
        
        setDemographics(demographicsData);
        setTotalResponses(Math.max(...demographicsData.map((d) => d.yesCount + d.noCount), 0));
      }

      setIsLoading(false);

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
    }

    loadData();
  }, []);

  const yesCount = answers.filter((a) => a.answer === 'yes').length;
  const noCount = answers.filter((a) => a.answer === 'no').length;
  const total = answers.length;
  const yesPercentage = total > 0 ? Math.round((yesCount / total) * 100) : 0;

  const getPersonalityInsight = () => {
    if (yesPercentage >= 80) {
      return {
        title: 'The Compassionate Soul',
        description:
          'You have an extraordinary capacity for empathy and service. Your heart naturally gravitates toward helping others.',
        emoji: '💖',
      };
    } else if (yesPercentage >= 60) {
      return {
        title: 'The Mindful Helper',
        description:
          'You balance self-care with care for others beautifully. You know when to give and when to preserve your energy.',
        emoji: '🌟',
      };
    } else if (yesPercentage >= 40) {
      return {
        title: 'The Thoughtful Observer',
        description:
          'You approach helping with discernment. You think carefully before committing, which shows wisdom.',
        emoji: '🦉',
      };
    } else {
      return {
        title: 'The Self-Aware Individual',
        description:
          'You value honesty about your boundaries. Knowing your limits is the first step to genuine giving.',
        emoji: '🔮',
      };
    }
  };

  const insight = getPersonalityInsight();

  const handleShare = useCallback(async () => {
    const text = `I just completed the Swipe Game! I said YES to ${yesPercentage}% of the scenarios. ${insight.emoji} I'm "${insight.title}"`;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [yesPercentage, insight]);

  const handleContinue = () => {
    router.push('/reveal');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Celebration Header */}
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

        {/* Stats Card */}
        <motion.div
          className="glass-card rounded-3xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Percentage Ring */}
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

          {/* Yes/No Counts */}
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

          {/* Personality Type */}
          <div className="text-center border-t border-white/10 pt-6">
            <h3 className="text-xl font-semibold text-white mb-2">{insight.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{insight.description}</p>
          </div>
        </motion.div>

        {/* Demographics Section */}
        <motion.div
          className="glass-card rounded-3xl p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => setShowDemographics(!showDemographics)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">How Others Answered</h3>
                <p className="text-sm text-white/50">
                  {totalResponses} {totalResponses === 1 ? 'person' : 'people'} played
                </p>
              </div>
            </div>
            {showDemographics ? (
              <ChevronUp className="w-5 h-5 text-white/50" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/50" />
            )}
          </button>

          {showDemographics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-4 max-h-[400px] overflow-y-auto pr-2"
            >
              {demographics.map((item, index) => {
                const userAnswer = answers.find((a) => a.scenarioId === item.id)?.answer;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-white/10 rounded-xl p-4"
                  >
                    <p className="text-sm text-white/80 mb-3 line-clamp-2">{item.text}</p>

                    {/* Progress Bar */}
                    <div className="relative h-8 bg-white/5 rounded-full overflow-hidden flex">
                      {/* Yes portion */}
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-start pl-2"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.yesPercentage}%` }}
                        transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                      >
                        {item.yesPercentage >= 15 && (
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <Heart className="w-3 h-3" fill="white" />
                            {item.yesPercentage}%
                          </span>
                        )}
                      </motion.div>
                      {/* No portion */}
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-end pr-2 flex-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                      >
                        {100 - item.yesPercentage >= 15 && (
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            {100 - item.yesPercentage}%
                            <X className="w-3 h-3" />
                          </span>
                        )}
                      </motion.div>
                    </div>

                    {/* User's answer indicator */}
                    {userAnswer && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-white/40">You said:</span>
                        <span
                          className={`text-xs font-semibold ${userAnswer === 'yes' ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {userAnswer === 'yes' ? '✓ Yes' : '✗ No'}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
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

          <Button onClick={handleShare} variant="glass" size="lg" className="w-full">
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
