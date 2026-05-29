'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Zap,
  Target,
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  Search,
  Plus,
  BookOpen,
  Brain,
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import type { PeerMatch } from '@/lib/types';

interface PeerMatchResult {
  id: string;
  name: string;
  matchScore: number;
  matchedOnTopics: string[];
  learningStyle: string;
  availability: string;
  avatar?: string;
  level: number;
  status: 'pending' | 'accepted' | 'active';
  lastActive: Date;
}

interface ActiveMatch {
  id: string;
  peerName: string;
  topic: string;
  status: 'waiting' | 'chatting' | 'studying';
  matchDate: Date;
  matchScore: number;
}

const TOPICS = [
  { id: '1', name: 'React', icon: '⚛️' },
  { id: '2', name: 'JavaScript', icon: '🚀' },
  { id: '3', name: 'System Design', icon: '🏗️' },
  { id: '4', name: 'Data Structures', icon: '📊' },
  { id: '5', name: 'Python', icon: '🐍' },
  { id: '6', name: 'Web Design', icon: '🎨' },
];

const LEARNING_STYLES = [
  'Visual',
  'Auditory',
  'Reading/Writing',
  'Kinesthetic',
];

const AVAILABILITY_OPTIONS = [
  '6am-9am EST',
  '9am-12pm EST',
  '12pm-3pm EST',
  '3pm-6pm EST',
  '6pm-9pm EST',
  'Weekends',
];

const MOCK_MATCH_RESULTS: PeerMatchResult[] = [
  {
    id: '1',
    name: 'Alex Chen',
    matchScore: 92,
    matchedOnTopics: ['React', 'JavaScript'],
    learningStyle: 'Visual',
    availability: '9am-12pm EST',
    level: 8,
    status: 'pending',
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: '2',
    name: 'Jordan Smith',
    matchScore: 87,
    matchedOnTopics: ['React', 'Web Design'],
    learningStyle: 'Kinesthetic',
    availability: '6pm-9pm EST',
    level: 7,
    status: 'pending',
    lastActive: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: '3',
    name: 'Casey Williams',
    matchScore: 78,
    matchedOnTopics: ['JavaScript', 'System Design'],
    learningStyle: 'Auditory',
    availability: '9am-12pm EST',
    level: 9,
    status: 'pending',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

const MOCK_ACTIVE_MATCHES: ActiveMatch[] = [
  {
    id: '1',
    peerName: 'Morgan Lee',
    topic: 'React Hooks',
    status: 'chatting',
    matchDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    matchScore: 88,
  },
  {
    id: '2',
    peerName: 'Riley Johnson',
    topic: 'JavaScript Async',
    status: 'waiting',
    matchDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
    matchScore: 85,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PeerMatch() {
  const { user, profile } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedLearningStyle, setSelectedLearningStyle] = useState<string>('');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchResults, setMatchResults] = useState<PeerMatchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [activeMatches, setActiveMatches] = useState<ActiveMatch[]>(MOCK_ACTIVE_MATCHES);
  const [selectedMatchChat, setSelectedMatchChat] = useState<string | null>(null);

  const handleFindMatch = () => {
    if (!selectedTopic || !selectedLearningStyle || !selectedAvailability) {
      alert('Please select all criteria');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setMatchResults(MOCK_MATCH_RESULTS);
      setShowResults(true);
      setIsSearching(false);
    }, 2000);
  };

  const handleRequestMatch = (matchId: string) => {
    setMatchResults((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: 'accepted' } : m))
    );
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-80 h-80 bg-accent-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-accent-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="border-b border-dark-700/50 glass backdrop-blur-xl sticky top-0 z-40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="p-2 rounded-lg bg-gradient-to-br from-accent-blue-500 to-accent-blue-600"
                whileHover={{ scale: 1.1 }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gradient-blue">Peer Brain Match</h1>
                <p className="text-dark-400 text-sm">Find your perfect study buddy</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {/* Main Finder View */}
            {!showResults && !selectedMatchChat && (
              <motion.div
                key="finder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Active Matches Section */}
                {activeMatches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-gradient-orange flex items-center gap-3">
                      <CheckCircle className="w-6 h-6" />
                      Active Matches
                    </h2>
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={containerVariants}>
                      {activeMatches.map((match) => (
                        <motion.button
                          key={match.id}
                          onClick={() => setSelectedMatchChat(match.id)}
                          className="card border-2 border-success-400 p-5 text-left hover:bg-success-400/5 transition-all group"
                          variants={itemVariants}
                          whileHover={{ scale: 1.02, y: -4 }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white group-hover:text-success-400 transition-colors">
                                {match.peerName}
                              </h3>
                              <p className="text-sm text-dark-400">{match.topic}</p>
                            </div>
                            <motion.div
                              className="text-right"
                              whileHover={{ scale: 1.1 }}
                            >
                              <div className="inline-block px-2 py-1 rounded-full bg-success-400/20 text-success-400 text-xs font-bold">
                                {match.status === 'chatting' ? '💬 Chatting' : '⏳ Waiting'}
                              </div>
                            </motion.div>
                          </div>

                          <div className="flex items-center gap-3 pt-3 border-t border-dark-700">
                            <motion.button
                              className="flex-1 flex items-center justify-center gap-2 text-sm text-accent-blue-400 hover:text-accent-blue-300 font-semibold transition-colors"
                              whileHover={{ gap: 8 }}
                            >
                              <MessageCircle className="w-4 h-4" />
                              Open Chat
                            </motion.button>
                            <div className="text-right text-xs text-dark-400">
                              Match: {match.matchScore}%
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* Match Finder Section */}
                <motion.div
                  className="space-y-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.h2 className="text-2xl font-bold text-gradient-blue" variants={itemVariants}>
                    Find Your Study Buddy
                  </motion.h2>

                  {/* Match Criteria */}
                  <motion.div className="space-y-6" variants={containerVariants}>
                    {/* Topic Selection */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-bold text-dark-300 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-accent-blue-500" />
                        What topic do you want to study?
                      </label>
                      <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-3" variants={containerVariants}>
                        {TOPICS.map((topic) => (
                          <motion.button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic.id)}
                            className={`card p-4 text-center cursor-pointer border-2 transition-all ${
                              selectedTopic === topic.id
                                ? 'border-accent-blue-500 bg-accent-blue-500/10'
                                : 'border-dark-700 hover:border-accent-blue-400'
                            }`}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="text-2xl mb-2">{topic.icon}</div>
                            <p className="text-sm font-semibold text-white">{topic.name}</p>
                          </motion.button>
                        ))}
                      </motion.div>
                    </motion.div>

                    {/* Learning Style Selection */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-bold text-dark-300 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-accent-orange-500" />
                        Your learning style
                      </label>
                      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" variants={containerVariants}>
                        {LEARNING_STYLES.map((style) => (
                          <motion.button
                            key={style}
                            onClick={() => setSelectedLearningStyle(style)}
                            className={`card p-4 text-center cursor-pointer border-2 transition-all ${
                              selectedLearningStyle === style
                                ? 'border-accent-orange-500 bg-accent-orange-500/10'
                                : 'border-dark-700 hover:border-accent-orange-400'
                            }`}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <p className="text-sm font-semibold text-white">{style}</p>
                          </motion.button>
                        ))}
                      </motion.div>
                    </motion.div>

                    {/* Availability Selection */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-bold text-dark-300 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-success-400" />
                        Your availability
                      </label>
                      <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-3" variants={containerVariants}>
                        {AVAILABILITY_OPTIONS.map((time) => (
                          <motion.button
                            key={time}
                            onClick={() => setSelectedAvailability(time)}
                            className={`card p-4 text-center cursor-pointer border-2 transition-all ${
                              selectedAvailability === time
                                ? 'border-success-400 bg-success-400/10'
                                : 'border-dark-700 hover:border-success-400'
                            }`}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <p className="text-sm font-semibold text-white">{time}</p>
                          </motion.button>
                        ))}
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {/* Find Match Button */}
                  <motion.button
                    onClick={handleFindMatch}
                    disabled={isSearching || !selectedTopic || !selectedLearningStyle || !selectedAvailability}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSearching ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                          <Zap className="w-6 h-6 group-hover:glow-orange" />
                        </motion.div>
                        Finding Your Match...
                      </>
                    ) : (
                      <>
                        <Search className="w-6 h-6" />
                        Find Your Study Buddy
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Match Results View */}
            {showResults && !selectedMatchChat && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <motion.button
                  onClick={() => {
                    setShowResults(false);
                    setMatchResults([]);
                  }}
                  className="text-dark-400 hover:text-dark-200 flex items-center gap-2 transition-colors group"
                  whileHover={{ x: -5 }}
                  variants={itemVariants}
                >
                  <ChevronRight className="w-5 h-5 rotate-180 group-hover:scale-110 transition-transform" />
                  Back to Finder
                </motion.button>

                <motion.h2 className="text-3xl font-bold text-gradient-blue" variants={itemVariants}>
                  {matchResults.length} Perfect Matches Found!
                </motion.h2>

                <motion.p className="text-dark-300 text-lg" variants={itemVariants}>
                  Based on your {selectedTopic && `${TOPICS.find(t => t.id === selectedTopic)?.name}`} study preference,
                  these peers are your best matches.
                </motion.p>

                {/* Match Results Grid */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                >
                  {matchResults.map((match) => (
                    <motion.div
                      key={match.id}
                      className="card border border-dark-700 p-6 cursor-pointer group overflow-hidden relative"
                      variants={itemVariants}
                      onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                      whileHover={{ scale: 1.02, y: -4 }}
                    >
                      {/* Animated background */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-accent-blue-500/10 to-accent-orange-500/10 opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />

                      <div className="relative z-10">
                        {/* Match Score Badge */}
                        <motion.div
                          className="absolute top-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-accent-orange-500 to-accent-orange-600 flex items-center justify-center"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{match.matchScore}%</div>
                            <div className="text-xs text-orange-100">Match</div>
                          </div>
                        </motion.div>

                        {/* Peer Avatar */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-blue-400 to-accent-blue-600 flex items-center justify-center mb-4">
                          <Users className="w-8 h-8 text-white" />
                        </div>

                        {/* Peer Info */}
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-accent-blue-400 transition-colors">
                          {match.name}
                        </h3>
                        <p className="text-sm text-dark-400 mb-4">Level {match.level}</p>

                        {/* Topics */}
                        <div className="mb-4">
                          <p className="text-xs font-bold text-dark-400 mb-2">Matched Topics</p>
                          <div className="flex flex-wrap gap-2">
                            {match.matchedOnTopics.map((topic) => (
                              <motion.span
                                key={topic}
                                className="px-3 py-1 rounded-full bg-accent-blue-500/20 border border-accent-blue-500/50 text-xs font-semibold text-accent-blue-400"
                                whileHover={{ scale: 1.1 }}
                              >
                                {topic}
                              </motion.span>
                            ))}
                          </div>
                        </div>

                        {/* Expandable Details */}
                        <AnimatePresence>
                          {expandedMatch === match.id && (
                            <motion.div
                              className="space-y-3 pt-4 border-t border-dark-700 mt-4"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <div>
                                <p className="text-xs font-bold text-dark-400 mb-1">Learning Style</p>
                                <p className="text-sm text-dark-300">{match.learningStyle}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-dark-400 mb-1">Availability</p>
                                <p className="text-sm text-dark-300">{match.availability}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-dark-400 mb-1">Last Active</p>
                                <p className="text-sm text-dark-300">{formatTimeAgo(match.lastActive)}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Request Button */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestMatch(match.id);
                          }}
                          className={`w-full mt-4 py-2 rounded-lg font-semibold transition-all ${
                            match.status === 'pending'
                              ? 'btn-primary'
                              : 'bg-success-400/20 border border-success-400 text-success-400 hover:bg-success-400/30'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {match.status === 'pending' ? (
                            <span className="flex items-center justify-center gap-2">
                              <Plus className="w-4 h-4" />
                              Request Match
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Match Requested
                            </span>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Chat View */}
            {selectedMatchChat && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <motion.button
                  onClick={() => setSelectedMatchChat(null)}
                  className="text-dark-400 hover:text-dark-200 flex items-center gap-2 transition-colors group"
                  whileHover={{ x: -5 }}
                  variants={itemVariants}
                >
                  <ChevronRight className="w-5 h-5 rotate-180 group-hover:scale-110 transition-transform" />
                  Back to Matches
                </motion.button>

                {/* Chat Header */}
                <motion.div
                  className="card border border-dark-700 p-6 flex items-center justify-between"
                  variants={itemVariants}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue-400 to-accent-blue-600 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {activeMatches.find(m => m.id === selectedMatchChat)?.peerName}
                      </h3>
                      <p className="text-sm text-success-400">🟢 Online</p>
                    </div>
                  </div>
                  <motion.button
                    className="px-4 py-2 rounded-lg bg-accent-blue-500/20 border border-accent-blue-500 text-accent-blue-400 hover:bg-accent-blue-500/30 transition-colors font-semibold"
                    whileHover={{ scale: 1.05 }}
                  >
                    📞 Call
                  </motion.button>
                </motion.div>

                {/* Chat Placeholder */}
                <motion.div
                  className="card border border-dark-700 p-8 h-96 flex flex-col items-center justify-center text-center"
                  variants={itemVariants}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MessageCircle className="w-16 h-16 text-accent-blue-500 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-dark-300 mb-4">Chat interface coming soon</p>
                  <p className="text-sm text-dark-400">Send messages and collaborate with your study buddy</p>
                </motion.div>

                {/* Input Area */}
                <motion.div className="card border border-dark-700 p-4" variants={itemVariants}>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="input-field flex-1"
                    />
                    <motion.button
                      className="btn-primary px-6"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Send
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
