import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Coins,
  BookOpen,
  Target,
  AlertCircle,
  Clock,
  ArrowRight,
  Users,
  Swords,
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabase';
import { StatCard } from '@/components/shared/StatCard';
import { Session, TopicMastery } from '@/lib/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

interface WeeklyData {
  day: string;
  sessions: number;
}

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [weakTopics, setWeakTopics] = useState<TopicMastery[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock seed data for demonstration
  const generateMockWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({
      day,
      sessions: Math.floor(Math.random() * 8) + 2,
    }));
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch recent sessions
        const { data: sessions } = await supabase
          .from('sessions')
          .select('*, topic:topics(*)')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentSessions(sessions || []);

        // Count completed sessions
        const { count: completedCount } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id)
          .eq('status', 'completed');

        setSessionsCompleted(completedCount || 0);

        // Calculate average confidence from completed sessions
        if (sessions && sessions.length > 0) {
          const completedSessions = sessions.filter((s) => s.status === 'completed');
          if (completedSessions.length > 0) {
            const avgConfidence =
              completedSessions.reduce((sum, s) => sum + (s.confidence_end || 0), 0) /
              completedSessions.length;
            setAverageConfidence(Math.round(avgConfidence));
          }
        }

        // Fetch weak topics (mastery < 40%)
        const { data: topicMasteries } = await supabase
          .from('topic_masteries')
          .select('*, topic:topics(*)')
          .eq('student_id', user.id)
          .lt('mastery_level', 40)
          .order('mastery_level', { ascending: true })
          .limit(6);

        setWeakTopics(topicMasteries || []);

        // Set mock weekly data
        setWeeklyData(generateMockWeeklyData());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const learningDnaConfig = {
    visual: { color: 'accent-blue-500', label: 'Visual Learner' },
    practical: { color: 'accent-orange-500', label: 'Hands-on Learner' },
    theory: { color: 'accent-blue-400', label: 'Theory Focused' },
    mixed: { color: 'success-500', label: 'Mixed Learning' },
  };

  const dnaConfig = profile?.learning_dna
    ? learningDnaConfig[profile.learning_dna]
    : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-dark-800 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-dark-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-dark-950 p-4 md:p-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, {profile?.full_name?.split(' ')[0]}!
              </h1>
              <p className="text-dark-300 flex items-center gap-2">
                {dnaConfig && (
                  <>
                    <span className={`inline-block w-3 h-3 rounded-full bg-${dnaConfig.color}`}></span>
                    <span>{dnaConfig.label}</span>
                  </>
                )}
              </p>
            </div>

            {profile?.learning_dna && (
              <div className="inline-block px-4 py-2 bg-accent-orange-500/20 rounded-full">
                <p className="text-accent-orange-400 text-sm font-medium capitalize">
                  {profile.learning_dna} Learning Style
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          variants={itemVariants}
        >
          <StatCard
            icon={Flame}
            label="Learning Streak"
            value={profile?.streak_count || 0}
            color="orange"
          />
          <StatCard
            icon={Coins}
            label="Skill Coins"
            value={profile?.skill_coins || 0}
            color="yellow"
          />
          <StatCard
            icon={BookOpen}
            label="Sessions Completed"
            value={sessionsCompleted}
            color="blue"
          />
          <StatCard
            icon={Target}
            label="Confidence Level"
            value={averageConfidence}
            color="green"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Weak Topics Section */}
          <motion.div
            className="lg:col-span-2"
            variants={itemVariants}
          >
            <div className="bg-dark-900 border border-dark-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-error-400" />
                <h2 className="text-xl font-bold text-white">Areas for Improvement</h2>
                <span className="ml-auto text-sm text-dark-400">
                  {weakTopics.length} topics
                </span>
              </div>

              {weakTopics.length > 0 ? (
                <div className="space-y-3">
                  {weakTopics.map((mastery, idx) => (
                    <motion.div
                      key={mastery.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group p-4 bg-dark-800/50 rounded-lg border border-dark-700/50 hover:border-error-400/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-error-400 transition-colors">
                            {mastery.topic?.name || 'Unknown Topic'}
                          </h3>
                          <p className="text-xs text-dark-400 mt-1">
                            {mastery.questions_correct} / {mastery.questions_attempted} correct
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-error-400">
                            {mastery.mastery_level}%
                          </div>
                        </div>
                      </div>

                      {/* Mastery Progress Bar */}
                      <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-error-500 to-error-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${mastery.mastery_level}%` }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Target className="w-12 h-12 text-dark-600 mx-auto mb-3 opacity-50" />
                  <p className="text-dark-400">All topics mastered! Keep up the great work!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="lg:col-span-1"
            variants={itemVariants}
          >
            <div className="bg-dark-900 border border-dark-700/50 rounded-xl p-6 backdrop-blur-sm h-full flex flex-col">
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>

              <div className="space-y-3 flex-1">
                <Link
                  to="/tutor"
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-accent-orange-500/20 to-accent-orange-500/10 rounded-lg border border-accent-orange-500/30 hover:border-accent-orange-500/60 transition-all duration-200"
                >
                  <div>
                    <p className="font-semibold text-white group-hover:text-accent-orange-400 transition-colors">
                      Start New Session
                    </p>
                    <p className="text-xs text-dark-400 mt-1">Learn with AI tutor</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-accent-orange-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                </Link>

                <Link
                  to="/community"
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-accent-blue-500/20 to-accent-blue-500/10 rounded-lg border border-accent-blue-500/30 hover:border-accent-blue-500/60 transition-all duration-200"
                >
                  <div>
                    <p className="font-semibold text-white group-hover:text-accent-blue-400 transition-colors">
                      Find a Peer
                    </p>
                    <p className="text-xs text-dark-400 mt-1">Learn with peers</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-accent-blue-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                </Link>

                <Link
                  to="/battle"
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-success-500/20 to-success-500/10 rounded-lg border border-success-500/30 hover:border-success-500/60 transition-all duration-200"
                >
                  <div>
                    <p className="font-semibold text-white group-hover:text-success-400 transition-colors">
                      Join Battle
                    </p>
                    <p className="text-xs text-dark-400 mt-1">Compete & learn</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-success-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-dark-700/50">
                <p className="text-xs text-dark-400 text-center">
                  Complete actions to earn Skill Coins and boost your streak!
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Chart */}
        <motion.div
          className="bg-dark-900 border border-dark-700/50 rounded-xl p-6 backdrop-blur-sm mb-8"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold text-white mb-6">Weekly Learning Activity</h2>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={weeklyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#2a2a45"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161625',
                  border: '1px solid #2a2a45',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                cursor={{ stroke: '#f97316', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#f97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSessions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          className="bg-dark-900 border border-dark-700/50 rounded-xl p-6 backdrop-blur-sm"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Sessions
            </h2>
            {recentSessions.length > 0 && (
              <span className="text-sm text-dark-400">{recentSessions.length} sessions</span>
            )}
          </div>

          {recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    session.status === 'completed'
                      ? 'bg-success-500/5 border-success-500/20 hover:border-success-500/40'
                      : 'bg-dark-800/50 border-dark-700/50 hover:border-dark-600/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">
                        {session.topic?.name || session.title}
                      </h3>
                      <p className="text-xs text-dark-400 mt-1">
                        {new Date(session.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {session.status === 'completed' && session.confidence_end && (
                        <div className="text-right">
                          <p className="text-xs text-dark-400">Confidence</p>
                          <p className="text-sm font-bold text-success-400">
                            {session.confidence_end}%
                          </p>
                        </div>
                      )}

                      <div className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-dark-700/50 text-dark-300">
                        {session.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-dark-600 mx-auto mb-3 opacity-50" />
              <p className="text-dark-400 mb-4">No sessions yet. Start learning today!</p>
              <Link
                to="/tutor"
                className="inline-block px-6 py-2 bg-accent-orange-500/20 border border-accent-orange-500/50 text-accent-orange-400 rounded-lg hover:bg-accent-orange-500/30 transition-colors text-sm font-medium"
              >
                Start Your First Session
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
