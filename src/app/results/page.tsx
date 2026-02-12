'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, Share2, Check, Heart, X, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, copyToClipboard } from '@/lib/utils';

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
  const [answers, setAnswers] = useState<{ scenarioId: string; answer: 'yes' | 'no' }[]>([]);
  const [copied, setCopied] = useState(false);
  const [showDemographics, setShowDemographics] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [demographics, setDemographics] = useState<ScenarioAggregate[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect forward if user already passed this step
  useEffect(() => {
    const step = localStorage.getItem('swipe-flow-step');
    if (step === 'reveal') {
      window.location.replace('/reveal');
      return;
    }
    // Block back button: push user forward whenever page gains focus
    const blockBack = () => window.history.forward();
    window.addEventListener('popstate', blockBack);
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) blockBack();
    });
    return () => {
      window.removeEventListener('popstate', blockBack);
    };
  }, []);

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
        const scenariosResponse = await fetch('/api/scenarios', { cache: 'no-store' });
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

  // Auto-expand personality insights after a short delay, then enable button
  useEffect(() => {
    if (!isLoading) {
      const expandTimer = setTimeout(() => {
        setShowDemographics(true);
      }, 1500);
      const buttonTimer = setTimeout(() => {
        setButtonEnabled(true);
      }, 4000);
      return () => {
        clearTimeout(expandTimer);
        clearTimeout(buttonTimer);
      };
    }
  }, [isLoading]);

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
        emoji: '✨',
      };
    } else {
      return {
        title: 'The Thoughtful Observer',
        description:
          'You approach helping with discernment. You think carefully before committing, which shows wisdom.',
        emoji: '✨',
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
    // Mark flow progress and navigate
    localStorage.setItem('swipe-flow-step', 'reveal');
    window.location.replace('/reveal');
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
          <h1 className="text-3xl font-bold text-white mb-2">Insights</h1>
          <p className="text-white/60">Here&apos;s what your answers reveal</p>
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
                <h3 className="text-lg font-semibold text-white">Your Personality Insight</h3>
                <p className="text-sm text-white/50">
                  Based on your swipes, this is what we think of the kind of person you are looking for
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
              className="mt-6 space-y-5 max-h-[500px] overflow-y-auto pr-2"
            >
              {demographics.map((item, index) => {
                const userAnswer = answers.find((a) => a.scenarioId === item.id)?.answer;
                const noPercentage = 100 - item.yesPercentage;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="border border-white/10 rounded-xl p-4 bg-white/[0.02]"
                  >
                    {/* Question text */}
                    <p className="text-sm text-white/80 mb-4 line-clamp-2">{item.text}</p>

                    {/* Bar chart area */}
                    <div className="space-y-2.5">
                      {/* Swiped Right bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-white/40 w-[72px] text-right shrink-0">
                          Swiped Right
                        </span>
                        <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
                          <motion.div
                            className="h-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-400 flex items-center"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(item.yesPercentage, 3)}%` }}
                            transition={{ delay: 0.3 + index * 0.06, duration: 0.6, ease: 'easeOut' }}
                          />
                          <span className="absolute inset-0 flex items-center pl-2.5 text-[11px] font-bold text-white drop-shadow-sm">
                            {item.yesPercentage}%
                          </span>
                        </div>
                        {userAnswer === 'yes' && (
                          <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-2 py-0.5">
                            <Check className="w-3 h-3" /> YOU
                          </span>
                        )}
                      </div>

                      {/* Swiped Left bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-white/40 w-[72px] text-right shrink-0">
                          Swiped Left
                        </span>
                        <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
                          <motion.div
                            className="h-full rounded-lg bg-gradient-to-r from-rose-600 to-rose-400 flex items-center"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(noPercentage, 3)}%` }}
                            transition={{ delay: 0.45 + index * 0.06, duration: 0.6, ease: 'easeOut' }}
                          />
                          <span className="absolute inset-0 flex items-center pl-2.5 text-[11px] font-bold text-white drop-shadow-sm">
                            {noPercentage}%
                          </span>
                        </div>
                        {userAnswer === 'no' && (
                          <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/25 rounded-full px-2 py-0.5">
                            <X className="w-3 h-3" /> YOU
                          </span>
                        )}
                      </div>
                    </div>
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
            disabled={!buttonEnabled}
            className={cn(
              'w-full text-white shadow-xl group transition-all duration-500',
              buttonEnabled
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/25'
                : 'bg-white/10 cursor-not-allowed opacity-50'
            )}
          >
            Look for your match ...
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

        </motion.div>
      </motion.div>
    </div>
  );
}
