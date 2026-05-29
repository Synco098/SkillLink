'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Swords,
  Trophy,
  Clock,
  TrendingUp,
  Flame,
  Target,
  Star,
  MessageCircle,
  ChevronRight,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

type BattleScreen = 'landing' | 'topic-select' | 'opponent-search' | 'battle' | 'results' | 'leaderboard';
type PlayerRole = 'player1' | 'player2' | 'moderator';

interface BattleMessage {
  id: string;
  role: PlayerRole;
  content: string;
  timestamp: Date;
  points?: number;
}

interface Player {
  id: string;
  name: string;
  level: number;
  wins: number;
  winRate: number;
  avatar?: string;
  score: number;
}

interface Round {
  number: number;
  question: string;
  answered: {
    player1: boolean;
    player2: boolean;
  };
}

const TOPICS = [
  { id: '1', name: 'JavaScript', emoji: '🚀' },
  { id: '2', name: 'React', emoji: '⚛️' },
  { id: '3', name: 'Python', emoji: '🐍' },
  { id: '4', name: 'Web Design', emoji: '🎨' },
  { id: '5', name: 'Data Structures', emoji: '📊' },
  { id: '6', name: 'Database Design', emoji: '💾' },
];

const MOCK_OPPONENTS: Player[] = [
  { id: '1', name: 'Alex Mentor', level: 15, wins: 47, winRate: 0.82, score: 0 },
  { id: '2', name: 'Jordan Scholar', level: 12, wins: 34, winRate: 0.76, score: 0 },
  { id: '3', name: 'Casey Expert', level: 14, wins: 42, winRate: 0.79, score: 0 },
];

const MOCK_QUESTIONS: Record<string, string[]> = {
  '1': [
    'Explain the difference between `const` and `let` in JavaScript and when you would use each.',
    'What is hoisting and how does it affect variable and function declarations?',
    'Describe event delegation and why it\'s useful in web development.',
    'What are closures and provide a practical use case.',
    'Explain the event loop and how it manages asynchronous operations.',
  ],
  '2': [
    'What is the Virtual DOM and how does React use it for performance optimization?',
    'Explain the difference between controlled and uncontrolled components.',
    'What are hooks and what problem do they solve?',
    'Describe the dependency array in useEffect and how it controls side effects.',
    'What is the difference between props and state?',
  ],
  '3': [
    'Explain the difference between lists and tuples in Python.',
    'What is a list comprehension and how is it different from a for loop?',
    'Describe decorators and their use cases.',
    'What is the GIL and how does it affect multithreading?',
    'Explain the difference between mutable and immutable objects.',
  ],
};

const LEADERBOARD_DATA = [
  { rank: 1, name: 'CodeMaster', wins: 152, winRate: 0.88, skillCoins: 4850 },
  { rank: 2, name: 'LogicWizard', wins: 128, winRate: 0.84, skillCoins: 4120 },
  { rank: 3, name: 'BrainAce', wins: 115, winRate: 0.81, skillCoins: 3890 },
  { rank: 4, name: 'SkillHunter', wins: 98, winRate: 0.77, skillCoins: 3240 },
  { rank: 5, name: 'MindForge', wins: 87, winRate: 0.75, skillCoins: 2950 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function BattleMode() {
  const { user, profile } = useAuth();
  const [screen, setScreen] = useState<BattleScreen>('landing');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [messages, setMessages] = useState<BattleMessage[]>([]);
  const [playerInput, setPlayerInput] = useState('');
  const [currentRound, setCurrentRound] = useState<Round>({
    number: 1,
    question: '',
    answered: { player1: false, player2: false },
  });
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isSearching, setIsSearching] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);

  const currentPlayer: Player = {
    id: user?.id || '',
    name: profile?.full_name || 'You',
    level: 8,
    wins: 24,
    winRate: 0.71,
    score: player1Score,
  };

  const handleFindOpponent = () => {
    setIsSearching(true);
    setTimeout(() => {
      const randomOpponent = MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)];
      setOpponent(randomOpponent);
      setIsSearching(false);
      setScreen('opponent-search');
    }, 2000);
  };

  const handleStartBattle = () => {
    setBattleStarted(true);
    setScreen('battle');
    poseModeratorsQuestion();
  };

  const poseModeratorsQuestion = () => {
    const questions = MOCK_QUESTIONS[selectedTopic] || MOCK_QUESTIONS['1'];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentRound({
      number: currentRound.number,
      question: randomQuestion,
      answered: { player1: false, player2: false },
    });
    setMessages((prev) => [
      ...prev,
      {
        id: `mod-${Date.now()}`,
        role: 'moderator',
        content: randomQuestion,
        timestamp: new Date(),
      },
    ]);
    setTimeRemaining(60);
  };

  const handleSubmitAnswer = () => {
    if (!playerInput.trim()) return;

    const newMessage: BattleMessage = {
      id: `p1-${Date.now()}`,
      role: 'player1',
      content: playerInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    setCurrentRound((prev) => ({
      ...prev,
      answered: { ...prev.answered, player1: true },
    }));

    setPlayerInput('');

    // Simulate opponent answering
    setTimeout(() => {
      const opponentAnswers = [
        'I think the key aspect here is understanding the fundamental principle of how this works in the runtime environment.',
        'Based on my knowledge, this involves several important considerations that affect performance.',
        'The main point is that you need to consider both the practical and theoretical implications.',
      ];

      const randomAnswer = opponentAnswers[Math.floor(Math.random() * opponentAnswers.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: `p2-${Date.now()}`,
          role: 'player2',
          content: randomAnswer,
          timestamp: new Date(),
        },
      ]);

      setCurrentRound((prev) => ({
        ...prev,
        answered: { ...prev.answered, player2: true },
      }));
    }, 1500);
  };

  // Simulate moderator evaluation when both players answered
  useEffect(() => {
    if (currentRound.answered.player1 && currentRound.answered.player2 && battleStarted) {
      const timer = setTimeout(() => {
        const player1Wins = Math.random() > 0.5;
        const points = 25;

        if (player1Wins) {
          setPlayer1Score((prev) => prev + points);
        } else {
          setPlayer2Score((prev) => prev + points);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `mod-eval-${Date.now()}`,
            role: 'moderator',
            content: player1Wins
              ? `Excellent answer! You demonstrated deeper understanding of the core concepts. +${points} points!`
              : `Your opponent provided a more comprehensive analysis. They earn +${points} points.`,
            timestamp: new Date(),
            points,
          },
        ]);

        // Next round or end battle
        if (currentRound.number < 5) {
          setTimeout(() => {
            setCurrentRound({
              number: currentRound.number + 1,
              question: '',
              answered: { player1: false, player2: false },
            });
            poseModeratorsQuestion();
          }, 2000);
        } else {
          setTimeout(() => setScreen('results'), 2000);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentRound.answered, currentRound.number, battleStarted]);

  // Timer countdown
  useEffect(() => {
    if (!battleStarted || currentRound.answered.player1) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [battleStarted, currentRound.answered.player1]);

  const isBattleWon = player1Score > player2Score;
  const pointsDifference = Math.abs(player1Score - player2Score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-accent-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 30, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="border-b border-dark-700/50 glass backdrop-blur-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 rounded-lg bg-gradient-to-br from-accent-orange-500 to-accent-orange-600"
                whileHover={{ scale: 1.1 }}
              >
                <Swords className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-orange">Battle Arena</h1>
                <p className="text-sm text-dark-400">Socratic Learning Battles</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-dark-400">Skill Coins</p>
              <p className="text-2xl font-bold text-success-400">{profile?.skill_coins || 0}</p>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {/* Landing Screen */}
            {screen === 'landing' && (
              <motion.div
                key="landing"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]"
              >
                <motion.div variants={itemVariants} className="text-left">
                  <motion.h2
                    className="text-5xl lg:text-6xl font-bold mb-6 text-gradient-orange"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Enter the Arena
                  </motion.h2>
                  <motion.p
                    className="text-lg text-dark-300 mb-8 leading-relaxed"
                    variants={itemVariants}
                  >
                    Challenge opponents in intense Socratic battles. Test your knowledge, defend your reasoning,
                    and earn Skill Coins as you climb the ranks. Every battle sharpens your understanding.
                  </motion.p>
                  <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      onClick={() => setScreen('topic-select')}
                      className="btn-primary flex items-center justify-center gap-2 group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Zap className="w-5 h-5 group-hover:glow-orange" />
                      Battle Now
                    </motion.button>
                    <motion.button
                      onClick={() => setScreen('leaderboard')}
                      className="btn-secondary flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trophy className="w-5 h-5" />
                      Leaderboard
                    </motion.button>
                  </motion.div>
                </motion.div>

                {/* Battle Logo Animation */}
                <motion.div
                  className="relative h-full min-h-[500px] flex items-center justify-center"
                  variants={itemVariants}
                >
                  <motion.div
                    className="relative w-full h-full flex items-center justify-center"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <div className="relative w-72 h-72">
                      <motion.div
                        className="absolute inset-0 card border-2 border-accent-orange-500/50 rounded-3xl flex items-center justify-center"
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(245, 158, 11, 0.3)',
                            '0 0 40px rgba(245, 158, 11, 0.6)',
                            '0 0 20px rgba(245, 158, 11, 0.3)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Swords className="w-32 h-32 text-accent-orange-500 animate-pulse" />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 border-2 border-accent-blue-500/50 rounded-3xl"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* Topic Select Screen */}
            {screen === 'topic-select' && (
              <motion.div
                key="topic-select"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
              >
                <motion.button
                  onClick={() => setScreen('landing')}
                  className="mb-8 text-dark-400 hover:text-dark-200 flex items-center gap-2 transition-colors"
                  whileHover={{ x: -5 }}
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  Back
                </motion.button>

                <motion.h2 className="text-4xl font-bold text-gradient-blue mb-12" variants={itemVariants}>
                  Choose Your Battle Topic
                </motion.h2>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                >
                  {TOPICS.map((topic) => (
                    <motion.button
                      key={topic.id}
                      onClick={() => {
                        setSelectedTopic(topic.id);
                        handleFindOpponent();
                      }}
                      className={`card p-8 text-center cursor-pointer transition-all border-2 ${
                        selectedTopic === topic.id
                          ? 'border-accent-orange-500 bg-accent-orange-500/10'
                          : 'border-dark-700 hover:border-accent-blue-500'
                      }`}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-6xl mb-4">{topic.emoji}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{topic.name}</h3>
                      <p className="text-sm text-dark-400">Master this topic</p>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Opponent Search Screen */}
            {screen === 'opponent-search' && (
              <motion.div
                key="opponent-search"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center min-h-[70vh] gap-8"
              >
                {isSearching ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Zap className="w-16 h-16 text-accent-orange-500" />
                    </motion.div>
                    <motion.h2
                      className="text-3xl font-bold text-gradient-blue"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Finding Your Opponent...
                    </motion.h2>
                  </>
                ) : (
                  <>
                    <motion.h2 className="text-3xl font-bold text-gradient-orange" variants={itemVariants}>
                      Opponent Found!
                    </motion.h2>

                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-2xl"
                      variants={containerVariants}
                    >
                      {/* Current Player */}
                      <motion.div
                        className="card border border-accent-blue-500/50 p-6"
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-accent-blue-500/20 border border-accent-blue-500">
                          <span className="text-2xl font-bold text-accent-blue-500">P1</span>
                        </div>
                        <h3 className="text-lg font-bold text-center text-white mb-1">{currentPlayer.name}</h3>
                        <p className="text-center text-sm text-dark-400 mb-4">Level {currentPlayer.level}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-dark-400">Wins:</span>
                            <span className="text-white font-semibold">{currentPlayer.wins}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-dark-400">Win Rate:</span>
                            <span className="text-success-400 font-semibold">{(currentPlayer.winRate * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* VS */}
                      <motion.div
                        className="flex flex-col items-center justify-center"
                        variants={itemVariants}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Flame className="w-8 h-8 text-accent-orange-500 mb-2" />
                        <span className="text-2xl font-bold text-gradient-orange">VS</span>
                        <Flame className="w-8 h-8 text-accent-orange-500 mt-2" />
                      </motion.div>

                      {/* Opponent */}
                      {opponent && (
                        <motion.div
                          className="card border border-accent-orange-500/50 p-6"
                          variants={itemVariants}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-accent-orange-500/20 border border-accent-orange-500">
                            <span className="text-2xl font-bold text-accent-orange-500">P2</span>
                          </div>
                          <h3 className="text-lg font-bold text-center text-white mb-1">{opponent.name}</h3>
                          <p className="text-center text-sm text-dark-400 mb-4">Level {opponent.level}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-dark-400">Wins:</span>
                              <span className="text-white font-semibold">{opponent.wins}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark-400">Win Rate:</span>
                              <span className="text-success-400 font-semibold">{(opponent.winRate * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>

                    <motion.button
                      onClick={handleStartBattle}
                      className="btn-primary flex items-center justify-center gap-2 mt-8 text-lg px-8 py-4 group"
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Zap className="w-6 h-6 group-hover:glow-orange" />
                      Begin Battle
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}

            {/* Battle Screen */}
            {screen === 'battle' && (
              <motion.div
                key="battle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Score & Timer Bar */}
                <motion.div
                  className="card border border-dark-700 p-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Player 1 Score */}
                    <motion.div className="text-center flex-1" whileHover={{ scale: 1.05 }}>
                      <p className="text-sm text-dark-400 mb-2">Player 1</p>
                      <motion.div
                        className="text-4xl font-bold text-accent-blue-500"
                        key={player1Score}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        {player1Score}
                      </motion.div>
                    </motion.div>

                    {/* Center Info */}
                    <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <div className="text-sm text-dark-400 mb-2">Round {currentRound.number}/5</div>
                      <motion.div
                        className="flex items-center gap-3 justify-center"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="w-2 h-2 rounded-full bg-accent-orange-500" />
                        <span className="text-lg font-bold text-gradient-orange">LIVE</span>
                        <div className="w-2 h-2 rounded-full bg-accent-orange-500 animate-pulse" />
                      </motion.div>
                    </motion.div>

                    {/* Player 2 Score */}
                    <motion.div className="text-center flex-1" whileHover={{ scale: 1.05 }}>
                      <p className="text-sm text-dark-400 mb-2">Player 2</p>
                      <motion.div
                        className="text-4xl font-bold text-accent-orange-500"
                        key={player2Score}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        {player2Score}
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Timer */}
                  <motion.div className="mt-6 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-dark-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time Remaining
                      </span>
                      <span className={`font-bold ${timeRemaining < 10 ? 'text-error-400' : 'text-success-400'}`}>
                        {timeRemaining}s
                      </span>
                    </div>
                    <motion.div
                      className="h-2 bg-dark-800 rounded-full overflow-hidden"
                      initial={{ width: '100%' }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-accent-blue-500 to-accent-orange-500"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(timeRemaining / 60) * 100}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Chat Area */}
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Player 1 Messages */}
                  <motion.div className="card border border-dark-700 p-4 flex flex-col overflow-hidden">
                    <h3 className="text-sm font-bold text-accent-blue-500 mb-4">Your Answers</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      {messages
                        .filter((m) => m.role === 'player1')
                        .map((msg, idx) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-accent-blue-500/10 border border-accent-blue-500/30 rounded-lg p-3"
                          >
                            <p className="text-sm text-dark-200 leading-relaxed">{msg.content}</p>
                            {msg.points && (
                              <motion.p
                                className="text-xs text-success-400 mt-2 font-semibold"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                +{msg.points} points
                              </motion.p>
                            )}
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>

                  {/* Moderator Messages */}
                  <motion.div className="card border border-dark-700 p-4 flex flex-col overflow-hidden">
                    <h3 className="text-sm font-bold text-accent-orange-500 mb-4">AI Moderator</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      {messages
                        .filter((m) => m.role === 'moderator')
                        .map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-r from-accent-orange-500/10 to-accent-blue-500/10 border border-accent-orange-500/30 rounded-lg p-3"
                          >
                            <p className="text-sm text-dark-200 leading-relaxed italic">{msg.content}</p>
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>

                  {/* Player 2 Messages */}
                  <motion.div className="card border border-dark-700 p-4 flex flex-col overflow-hidden">
                    <h3 className="text-sm font-bold text-accent-orange-500 mb-4">Opponent Answers</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      {messages
                        .filter((m) => m.role === 'player2')
                        .map((msg, idx) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-accent-orange-500/10 border border-accent-orange-500/30 rounded-lg p-3"
                          >
                            <p className="text-sm text-dark-200 leading-relaxed">{msg.content}</p>
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Input Area */}
                {!currentRound.answered.player1 && (
                  <motion.div
                    className="card border border-dark-700 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="block text-sm font-bold text-dark-300 mb-3">Your Answer</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                        placeholder="Provide your answer here..."
                        className="input-field flex-1"
                      />
                      <motion.button
                        onClick={handleSubmitAnswer}
                        disabled={!playerInput.trim()}
                        className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Submit
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {currentRound.answered.player1 && !currentRound.answered.player2 && (
                  <motion.div
                    className="card border border-accent-orange-500/50 p-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                      <Zap className="w-6 h-6 text-accent-orange-500 mx-auto mb-2" />
                    </motion.div>
                    <p className="text-dark-300">Waiting for opponent to answer...</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Results Screen */}
            {screen === 'results' && (
              <motion.div
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[80vh] gap-8"
              >
                {/* Confetti Animation */}
                {isBattleWon && (
                  <div className="fixed inset-0 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                          background: [
                            '#F59E0B',
                            '#3B82F6',
                            '#10B981',
                            '#F59E0B',
                          ][i % 4],
                          left: `${Math.random() * 100}%`,
                          top: '-10px',
                        }}
                        animate={{
                          y: [0, 500],
                          x: [0, (Math.random() - 0.5) * 200],
                          rotate: [0, 360],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 2 + Math.random(),
                          ease: 'easeOut',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Winner Badge */}
                <motion.div
                  className="text-center"
                  variants={itemVariants}
                  animate={{ scale: [0, 1.1, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  {isBattleWon ? (
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1 }}>
                      <Trophy className="w-24 h-24 text-success-400 mx-auto mb-4" />
                    </motion.div>
                  ) : (
                    <Target className="w-24 h-24 text-warning-400 mx-auto mb-4" />
                  )}
                </motion.div>

                {/* Result Text */}
                <motion.h2 className="text-5xl font-bold text-gradient-orange" variants={itemVariants}>
                  {isBattleWon ? 'Victory!' : 'Defeat'}
                </motion.h2>

                <motion.p className="text-2xl text-dark-300" variants={itemVariants}>
                  Final Score: {player1Score} - {player2Score}
                </motion.p>

                {/* Reward Card */}
                <motion.div
                  className="card border-2 border-success-400 p-8 w-full max-w-md"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <Star className="w-8 h-8 text-success-400 mx-auto mb-2" />
                      <p className="text-sm text-dark-400 mb-2">Experience</p>
                      <p className="text-2xl font-bold text-white">+250 XP</p>
                    </div>
                    <div>
                      <Flame className="w-8 h-8 text-accent-orange-500 mx-auto mb-2" />
                      <p className="text-sm text-dark-400 mb-2">Skill Coins</p>
                      <p className="text-2xl font-bold text-success-400">+{pointsDifference * 10}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
                  <motion.button
                    onClick={() => {
                      setScreen('landing');
                      setMessages([]);
                      setPlayer1Score(0);
                      setPlayer2Score(0);
                      setCurrentRound({ number: 1, question: '', answered: { player1: false, player2: false } });
                      setBattleStarted(false);
                    }}
                    className="btn-primary flex items-center justify-center gap-2 px-8"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCw className="w-5 h-5" />
                    Battle Again
                  </motion.button>
                  <motion.button
                    onClick={() => setScreen('leaderboard')}
                    className="btn-secondary flex items-center justify-center gap-2 px-8"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trophy className="w-5 h-5" />
                    View Leaderboard
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Leaderboard Screen */}
            {screen === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                <motion.button
                  onClick={() => setScreen('landing')}
                  className="mb-8 text-dark-400 hover:text-dark-200 flex items-center gap-2 transition-colors"
                  whileHover={{ x: -5 }}
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  Back
                </motion.button>

                <motion.h2 className="text-4xl font-bold text-gradient-orange mb-12 flex items-center gap-3" variants={itemVariants}>
                  <Trophy className="w-8 h-8" />
                  Battle Leaderboard
                </motion.h2>

                <motion.div className="card border border-dark-700 overflow-hidden" variants={itemVariants}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-700 bg-dark-800/50">
                          <th className="text-left px-6 py-4 text-sm font-bold text-dark-300">Rank</th>
                          <th className="text-left px-6 py-4 text-sm font-bold text-dark-300">Player</th>
                          <th className="text-right px-6 py-4 text-sm font-bold text-dark-300">Wins</th>
                          <th className="text-right px-6 py-4 text-sm font-bold text-dark-300">Win Rate</th>
                          <th className="text-right px-6 py-4 text-sm font-bold text-accent-orange-500">Skill Coins</th>
                        </tr>
                      </thead>
                      <tbody>
                        {LEADERBOARD_DATA.map((entry, idx) => (
                          <motion.tr
                            key={entry.rank}
                            className="border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <td className="px-6 py-4">
                              <motion.div className="flex items-center gap-2">
                                {entry.rank <= 3 && <Star className="w-5 h-5 text-accent-orange-500" />}
                                <span className="font-bold text-lg text-white">{entry.rank}</span>
                              </motion.div>
                            </td>
                            <td className="px-6 py-4 text-white font-semibold">{entry.name}</td>
                            <td className="text-right px-6 py-4 text-dark-300">{entry.wins}</td>
                            <td className="text-right px-6 py-4">
                              <span className="text-success-400 font-semibold">{(entry.winRate * 100).toFixed(0)}%</span>
                            </td>
                            <td className="text-right px-6 py-4">
                              <motion.span className="text-accent-orange-500 font-bold text-lg">
                                {entry.skillCoins}
                              </motion.span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
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
