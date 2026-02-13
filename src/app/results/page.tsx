'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, Check, X, Users, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Default room ID for demo mode
const DEMO_ROOM_ID = 'room1';

interface ScenarioData {
  id: string;
  text: string;
  quality?: string | null;
}

interface ScenarioAggregate {
  id: string;
  text: string;
  quality: string | null;
  yesCount: number;
  noCount: number;
  yesPercentage: number;
}

// Quality badge colors
const QUALITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Sacrifice: { bg: 'bg-pink-500/15', text: 'text-pink-300', border: 'border-pink-500/30' },
  Acceptance: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  Wisdom: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  'Value for Character': { bg: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-500/30' },
  'Selfless Love': { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
  Selflessness: { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30' },
  'Lifetime Commitment': { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  Responsibility: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  Forgiveness: { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' },
};

const DEFAULT_QUALITY_COLOR = { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' };

export default function ResultsPage() {
  const [answers, setAnswers] = useState<{ scenarioId: string; answer: 'yes' | 'no' }[]>([]);
  const [showDemographics, setShowDemographics] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [demographics, setDemographics] = useState<ScenarioAggregate[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userQualities, setUserQualities] = useState<string[]>([]);

  // Redirect forward if user already passed this step
  useEffect(() => {
    const step = localStorage.getItem('swipe-flow-step');
    if (step === 'reveal') {
      window.location.replace('/reveal');
      return;
    }
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
        type AnswersResponse = { success?: boolean; answers?: { scenarioId: string; answer: 'yes' | 'no' }[] };
        type ScenariosResponse = { success?: boolean; scenarios?: ScenarioData[] };
        type AggregatesResponse = { success?: boolean; aggregates?: Record<string, { yes: number; no: number }>; totalParticipants?: number };

        let userAnswers: { scenarioId: string; answer: 'yes' | 'no' }[] = [];

        // Fetch user's answers
        if (sessionId) {
          const answersResponse = await fetch(`/api/answers?sessionId=${sessionId}&roomId=${roomId}`);
          const answersData = await answersResponse.json() as AnswersResponse;
          if (answersData.success && answersData.answers) {
            userAnswers = answersData.answers;
          } else {
            const { getSessionAnswers } = await import('@/lib/mock-data');
            userAnswers = getSessionAnswers(sessionId);
          }
        }
        setAnswers(userAnswers);

        // Fetch scenarios (includes quality field)
        const scenariosResponse = await fetch('/api/scenarios', { cache: 'no-store' });
        const scenariosData = await scenariosResponse.json() as ScenariosResponse;

        // Fetch aggregates
        const aggregatesResponse = await fetch(`/api/aggregates?roomId=${roomId}`);
        const aggregatesData = await aggregatesResponse.json() as AggregatesResponse;

        let scenarios: ScenarioData[] = [];
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

        // Build demographics
        const demographicsData: ScenarioAggregate[] = scenarios.map((scenario) => {
          const agg = aggregates[scenario.id] || { yes: 0, no: 0 };
          const total = agg.yes + agg.no;
          return {
            id: scenario.id,
            text: scenario.text,
            quality: scenario.quality || null,
            yesCount: agg.yes,
            noCount: agg.no,
            yesPercentage: total > 0 ? Math.round((agg.yes / total) * 100) : 50,
          };
        });
        setDemographics(demographicsData);

        // Compute user qualities: qualities from scenarios where user said "yes"
        const yesScenarioIds = new Set(
          userAnswers.filter(a => a.answer === 'yes').map(a => a.scenarioId)
        );
        const qualities = scenarios
          .filter(s => yesScenarioIds.has(s.id) && s.quality)
          .map(s => s.quality as string);
        // Deduplicate
        setUserQualities([...new Set(qualities)]);

        if (!aggregatesData.totalParticipants) {
          const maxResponses = Math.max(...demographicsData.map((d) => d.yesCount + d.noCount), 0);
          setTotalResponses(maxResponses);
        }
      } catch (error) {
        console.error('Error loading results data:', error);
        const { getSessionAnswers, getAggregates, getActiveScenarios } = await import('@/lib/mock-data');

        let userAnswers: { scenarioId: string; answer: 'yes' | 'no' }[] = [];
        if (sessionId) {
          userAnswers = getSessionAnswers(sessionId);
        }
        setAnswers(userAnswers);

        const aggregates = getAggregates();
        const scenarios = getActiveScenarios();

        const demographicsData: ScenarioAggregate[] = scenarios.map((scenario) => {
          const agg = aggregates[scenario.id] || { yes: 0, no: 0 };
          const total = agg.yes + agg.no;
          return {
            id: scenario.id,
            text: scenario.text,
            quality: scenario.quality || null,
            yesCount: agg.yes,
            noCount: agg.no,
            yesPercentage: total > 0 ? Math.round((agg.yes / total) * 100) : 50,
          };
        });
        setDemographics(demographicsData);

        const yesIds = new Set(userAnswers.filter(a => a.answer === 'yes').map(a => a.scenarioId));
        const qualities = scenarios.filter(s => yesIds.has(s.id) && s.quality).map(s => s.quality as string);
        setUserQualities([...new Set(qualities)]);

        setTotalResponses(Math.max(...demographicsData.map((d) => d.yesCount + d.noCount), 0));
      }

      setIsLoading(false);

      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#a855f7', '#ec4899', '#f59e0b'] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#a855f7', '#ec4899', '#f59e0b'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }

    loadData();
  }, []);

  // Auto-expand insights, then enable button
  useEffect(() => {
    if (!isLoading) {
      const expandTimer = setTimeout(() => setShowDemographics(true), 1500);
      const buttonTimer = setTimeout(() => setButtonEnabled(true), 4000);
      return () => { clearTimeout(expandTimer); clearTimeout(buttonTimer); };
    }
  }, [isLoading]);

  const handleContinue = () => {
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
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Insights</h1>
          <p className="text-white/60">Here&apos;s what your answers reveal</p>
        </motion.div>

        {/* Your Qualities Section */}
        {userQualities.length > 0 && (
          <motion.div
            className="glass-card rounded-3xl p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Your Qualities</h3>
                <p className="text-sm text-white/50">Based on your answers, these are your qualities</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {userQualities.map((quality, index) => {
                const colors = QUALITY_COLORS[quality] || DEFAULT_QUALITY_COLOR;
                return (
                  <motion.div
                    key={quality}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 200 }}
                    className={`px-4 py-2 rounded-full border ${colors.bg} ${colors.border}`}
                  >
                    <span className={`text-sm font-semibold ${colors.text}`}>{quality}</span>
                  </motion.div>
                );
              })}
            </div>

            {userQualities.length === 0 && (
              <p className="text-white/40 text-sm text-center py-4">
                Swipe right on questions to reveal your qualities
              </p>
            )}
          </motion.div>
        )}

        {/* Demographics / Personality Insight Section */}
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
              <ChevronUp className="w-5 h-5 text-white/50 shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/50 shrink-0" />
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
                const qualityColors = item.quality ? (QUALITY_COLORS[item.quality] || DEFAULT_QUALITY_COLOR) : null;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="border border-white/10 rounded-xl p-4 bg-white/[0.02]"
                  >
                    {/* Question text */}
                    <p className="text-sm text-white/80 mb-3 line-clamp-2">{item.text}</p>

                    {/* Quality badge */}
                    {item.quality && qualityColors && (
                      <div className="mb-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${qualityColors.bg} ${qualityColors.border} ${qualityColors.text}`}>
                          {userAnswer === 'yes' ? '✓ ' : ''}{item.quality}
                        </span>
                      </div>
                    )}

                    {/* Bar chart area */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-white/40 w-[72px] text-right shrink-0">Swiped Right</span>
                        <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
                          <motion.div
                            className="h-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-400"
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

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-white/40 w-[72px] text-right shrink-0">Swiped Left</span>
                        <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
                          <motion.div
                            className="h-full rounded-lg bg-gradient-to-r from-rose-600 to-rose-400"
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

        {/* Continue Button */}
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
