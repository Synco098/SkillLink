'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Filter,
  ChevronDown,
  Lightbulb,
  Target,
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabase';
import type { Mistake } from '@/lib/types';

interface ExtendedMistake {
  id: string;
  user_id: string;
  pattern: string;
  description: string;
  hint?: string;
  context?: string;
  resolved: boolean;
  created_at: string;
  topic?: { name: string };
  frequency?: number;
  expandedHints?: boolean;
}

type FilterType = 'all' | 'unresolved' | 'resolved';

const MistakeMemory = () => {
  const { user } = useAuth();
  const [mistakes, setMistakes] = useState<ExtendedMistake[]>([]);
  const [filteredMistakes, setFilteredMistakes] = useState<ExtendedMistake[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMistakeId, setExpandedMistakeId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    unresolved: 0,
    mostCommon: '',
  });

  // Fetch mistakes
  useEffect(() => {
    if (!user?.id) return;

    const fetchMistakes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('mistakes')
          .select('*, topic:topics(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Calculate frequency of each pattern
          const mistakesWithFrequency = data.map((mistake) => {
            const frequency = data.filter(
              (m) => m.pattern === mistake.pattern
            ).length;
            return { ...mistake, frequency };
          });

          setMistakes(mistakesWithFrequency as ExtendedMistake[]);

          // Calculate stats
          const resolved = mistakesWithFrequency.filter(
            (m) => m.resolved
          ).length;
          const unresolved = mistakesWithFrequency.filter(
            (m) => !m.resolved
          ).length;

          const patternCounts = mistakesWithFrequency.reduce(
            (acc, m) => {
              acc[m.pattern] = (acc[m.pattern] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );

          const mostCommonPattern = (Object.entries(patternCounts) as [string, number][]).sort(
            (a, b) => b[1] - a[1]
          )[0]?.[0];

          setStats({
            total: mistakesWithFrequency.length,
            resolved,
            unresolved,
            mostCommon: mostCommonPattern || 'None yet',
          });
        }
      } catch (error) {
        console.error('Failed to fetch mistakes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMistakes();
  }, [user?.id]);

  // Apply filter
  useEffect(() => {
    let filtered = mistakes;

    if (filter === 'resolved') {
      filtered = mistakes.filter((m) => m.resolved);
    } else if (filter === 'unresolved') {
      filtered = mistakes.filter((m) => !m.resolved);
    }

    // Group by topic
    const grouped = filtered.reduce(
      (acc, mistake) => {
        const topicName = mistake.topic?.name || 'Other';
        if (!acc[topicName]) {
          acc[topicName] = [];
        }
        acc[topicName].push(mistake);
        return acc;
      },
      {} as Record<string, ExtendedMistake[]>
    );

    // Flatten back to array, maintaining grouping order
    const result: ExtendedMistake[] = [];
    Object.entries(grouped).forEach(([, mistakes]) => {
      result.push(...mistakes);
    });

    setFilteredMistakes(result);
  }, [mistakes, filter]);

  // Toggle mistake resolution
  const handleToggleResolved = async (mistakeId: string, currentResolved: boolean) => {
    try {
      const { error } = await supabase
        .from('mistakes')
        .update({ resolved: !currentResolved })
        .eq('id', mistakeId);

      if (!error) {
        setMistakes((prev) =>
          prev.map((m) =>
            m.id === mistakeId ? { ...m, resolved: !m.resolved } : m
          )
        );
      }
    } catch (error) {
      console.error('Failed to update mistake:', error);
    }
  };

  // Group mistakes by topic
  const mistakesByTopic = filteredMistakes.reduce(
    (acc, mistake) => {
      const topicName = mistake.topic?.name || 'Other';
      if (!acc[topicName]) {
        acc[topicName] = [];
      }
      acc[topicName].push(mistake);
      return acc;
    },
    {} as Record<string, ExtendedMistake[]>
  );

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Mistakes' },
    { value: 'unresolved', label: 'Unresolved' },
    { value: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle size={32} className="text-accent-orange-500" />
            <h1 className="text-3xl sm:text-4xl font-bold text-dark-100">
              Mistake Memory
            </h1>
          </div>
          <p className="text-dark-500">
            Track and learn from your learning patterns
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Total Mistakes */}
          <div className="card bg-dark-900 border border-dark-700 p-6 rounded-lg hover:border-accent-orange-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-dark-500 text-sm font-medium">
                Total Mistakes
              </h3>
              <AlertCircle
                size={20}
                className="text-accent-orange-400 opacity-60"
              />
            </div>
            <motion.p
              key={stats.total}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-accent-orange-400"
            >
              {stats.total}
            </motion.p>
          </div>

          {/* Resolved Count */}
          <div className="card bg-dark-900 border border-dark-700 p-6 rounded-lg hover:border-success-400/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-dark-500 text-sm font-medium">
                Resolved
              </h3>
              <CheckCircle2
                size={20}
                className="text-success-400 opacity-60"
              />
            </div>
            <motion.p
              key={stats.resolved}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-success-400"
            >
              {stats.resolved}
            </motion.p>
          </div>

          {/* Unresolved Count */}
          <div className="card bg-dark-900 border border-dark-700 p-6 rounded-lg hover:border-warning-400/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-dark-500 text-sm font-medium">
                Unresolved
              </h3>
              <TrendingUp
                size={20}
                className="text-warning-400 opacity-60"
              />
            </div>
            <motion.p
              key={stats.unresolved}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-warning-400"
            >
              {stats.unresolved}
            </motion.p>
          </div>

          {/* Most Common Pattern */}
          <div className="card bg-dark-900 border border-dark-700 p-6 rounded-lg hover:border-accent-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-dark-500 text-sm font-medium">
                Top Pattern
              </h3>
              <Target
                size={20}
                className="text-accent-blue-400 opacity-60"
              />
            </div>
            <p className="text-lg font-bold text-accent-blue-400 truncate">
              {stats.mostCommon}
            </p>
          </div>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex items-center gap-3"
        >
          <Filter size={18} className="text-dark-500" />
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all card ${
                  filter === option.value
                    ? 'bg-accent-blue-600 text-dark-950 border border-accent-blue-400'
                    : 'bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Mistakes List */}
        <div className="space-y-6">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-accent-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-dark-500">Loading mistakes...</p>
              </div>
            </motion.div>
          ) : filteredMistakes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 card bg-dark-900 border border-dark-700 rounded-lg p-8"
            >
              <CheckCircle2
                size={48}
                className="mx-auto mb-4 text-success-400/50"
              />
              <h3 className="text-xl font-bold text-dark-100 mb-2">
                {filter === 'resolved'
                  ? 'No resolved mistakes yet'
                  : filter === 'unresolved'
                  ? 'No unresolved mistakes'
                  : 'No mistakes recorded'}
              </h3>
              <p className="text-dark-500">
                {filter === 'all'
                  ? 'Keep learning and mistakes will appear here'
                  : 'Great progress!'}
              </p>
            </motion.div>
          ) : (
            Object.entries(mistakesByTopic).map(([topicName, topicMistakes], topicIndex) => (
              <motion.div
                key={topicName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: topicIndex * 0.1 }}
              >
                {/* Topic Header */}
                <h2 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-accent-blue-500 to-accent-blue-400 rounded-full" />
                  {topicName}
                </h2>

                {/* Mistakes */}
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {topicMistakes.map((mistake, index) => (
                      <motion.div
                        key={mistake.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="card bg-dark-900 border border-dark-700 rounded-lg overflow-hidden hover:border-dark-600 transition-all group"
                      >
                        {/* Main Content */}
                        <div
                          className="p-4 sm:p-5 cursor-pointer"
                          onClick={() =>
                            setExpandedMistakeId(
                              expandedMistakeId === mistake.id
                                ? null
                                : mistake.id
                            )
                          }
                        >
                          <div className="flex items-start gap-4">
                            {/* Status Icon */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleResolved(
                                  mistake.id,
                                  mistake.resolved
                                );
                              }}
                              className="mt-1 p-1.5 rounded-lg hover:bg-dark-800 transition-colors flex-shrink-0"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {mistake.resolved ? (
                                <CheckCircle2
                                  size={22}
                                  className="text-success-400"
                                />
                              ) : (
                                <AlertCircle
                                  size={22}
                                  className="text-warning-400"
                                />
                              )}
                            </motion.button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-dark-100 group-hover:text-dark-50 transition-colors break-words">
                                {mistake.pattern}
                              </h3>
                              <p className="text-sm text-dark-500 mt-1 break-words">
                                {mistake.description}
                              </p>

                              {/* Frequency Badge */}
                              {mistake.frequency && mistake.frequency > 1 && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="inline-flex items-center gap-1.5 mt-3 px-2 py-1 bg-warning-400/10 rounded text-warning-400 text-xs font-medium"
                                >
                                  <TrendingUp size={12} />
                                  Seen {mistake.frequency} times
                                </motion.div>
                              )}
                            </div>

                            {/* Chevron */}
                            <motion.div
                              animate={{
                                rotate:
                                  expandedMistakeId === mistake.id ? 180 : 0,
                              }}
                              className="flex-shrink-0"
                            >
                              <ChevronDown
                                size={20}
                                className="text-dark-600"
                              />
                            </motion.div>
                          </div>
                        </div>

                        {/* Expanded Content - Hint */}
                        <AnimatePresence>
                          {expandedMistakeId === mistake.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-dark-700 bg-dark-800/50 p-4 sm:p-5"
                            >
                              <div className="flex gap-3">
                                <Lightbulb
                                  size={18}
                                  className="text-accent-orange-400 flex-shrink-0 mt-0.5"
                                />
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-dark-100 mb-2">
                                    Learning Hint
                                  </h4>
                                  <p className="text-sm text-dark-300 leading-relaxed break-words">
                                    {mistake.hint ||
                                      'Review the concept and practice similar problems to avoid this pattern.'}
                                  </p>
                                </div>
                              </div>

                              {/* Context if available */}
                              {mistake.context && (
                                <div className="mt-4 pt-4 border-t border-dark-700">
                                  <h4 className="text-xs font-semibold text-dark-500 mb-2 uppercase tracking-wider">
                                    Context
                                  </h4>
                                  <p className="text-xs text-dark-400 break-words">
                                    {mistake.context}
                                  </p>
                                </div>
                              )}

                              {/* Metadata */}
                              <div className="mt-4 pt-4 border-t border-dark-700 flex items-center justify-between text-xs text-dark-600">
                                <span>
                                  {new Date(
                                    mistake.created_at
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                                {mistake.resolved && (
                                  <span className="text-success-400 font-medium">
                                    ✓ Resolved
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MistakeMemory;
