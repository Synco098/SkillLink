import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  DollarSign,
  User,
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabase';
import { StatCard } from '@/components/shared/StatCard';
import { PeerMatch, Session } from '@/lib/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

interface MenteeStats {
  activeMentees: number;
  pendingMatches: number;
  sessionsThisMonth: number;
  totalEarnings: number;
}

interface WeeklyEarnings {
  day: string;
  earnings: number;
}

export function MentorDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<MenteeStats>({
    activeMentees: 0,
    pendingMatches: 0,
    sessionsThisMonth: 0,
    totalEarnings: 0,
  });
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [pendingMatches, setPendingMatches] = useState<PeerMatch[]>([]);
  const [weeklyEarnings, setWeeklyEarnings] = useState<WeeklyEarnings[]>([]);
  const [loading, setLoading] = useState(true);

  const generateMockEarningsData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({
      day,
      earnings: Math.floor(Math.random() * 150) + 50,
    }));
  };

  useEffect(() => {
    const fetchMentorData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch active mentees (accepted peer matches)
        const { data: activeMentees } = await supabase
          .from('peer_matches')
          .select('student_id')
          .eq('mentor_id', user.id)
          .eq('status', 'active');

        // Fetch pending match requests
        const { data: pendingReqs } = await supabase
          .from('peer_matches')
          .select('*, student:profiles(*), topic:topics(*)')
          .eq('mentor_id', user.id)
          .eq('status', 'pending')
          .limit(5);

        setPendingMatches(pendingReqs || []);

        // Count sessions this month
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const { data: monthlySessions } = await supabase
          .from('sessions')
          .select('*')
          .eq('mentor_id', user.id)
          .gte('created_at', monthAgo.toISOString())
          .eq('status', 'completed');

        // Calculate total earnings (mock calculation: 50 coins per session)
        const totalEarnings = (monthlySessions?.length || 0) * 50;

        // Fetch recent sessions mentored
        const { data: sessions } = await supabase
          .from('sessions')
          .select('*, topic:topics(*), student:profiles(*)')
          .eq('mentor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentSessions(sessions || []);

        setStats({
          activeMentees: activeMentees?.length || 0,
          pendingMatches: pendingReqs?.length || 0,
          sessionsThisMonth: monthlySessions?.length || 0,
          totalEarnings,
        });

        // Set mock earnings data
        setWeeklyEarnings(generateMockEarningsData());
      } catch (error) {
        console.error('Error fetching mentor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [user]);

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
                Mentor Dashboard
              </h1>
              <p className="text-dark-300">
                Welcome back, {profile?.full_name?.split(' ')[0]}!
              </p>
            </div>

            <div className="inline-block px-4 py-2 bg-accent-blue-500/20 rounded-full">
              <p className="text-accent-blue-400 text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                Mentor
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          variants={itemVariants}
        >
          <StatCard
            icon={Users}
            label="Active Mentees"
            value={stats.activeMentees}
            color="blue"
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Requests"
            value={stats.pendingMatches}
            color="orange"
          />
          <StatCard
            icon={Clock}
            label="Sessions This Month"
            value={stats.sessionsThisMonth}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            label="Total Earnings"
            value={stats.totalEarnings}
            color="yellow"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Pending Requests Section */}
          <motion.div
            className="lg:col-span-2"
            variants={itemVariants}
          >
            <div className="bg-dark-900 border border-dark-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-warning-400" />
                <h2 className="text-xl font-bold text-white">Pending Match Requests</h2>
                <span className="ml-auto text-sm text-dark-400">
                  {stats.pendingMatches} requests
                </span>
              </div>

              {pendingMatches.length > 0 ? (
                <div className="space-y-3">
                  {pendingMatches.map((match, idx) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group p-4 bg-dark-800/50 rounded-lg border border-dark-700/50 hover:border-accent-orange-500/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {match.student?.avatar_url && (
                            <img
                              src={match.student.avatar_url}
                              alt={match.student.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-accent-orange-400 transition-colors">
                              {match.student?.full_name || 'Unknown Student'}
                            </h3>
                            {match.topic && (
                              <p className="text-xs text-dark-400 mt-1">
                                Topic: {match.topic.name}
                              </p>
                            )}
                            <p className="text-xs text-dark-400 mt-1">
                              Match Score: {Math.round(match.match_score * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Match Score Bar */}
                      <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden mb-4">
                        <motion.div
                          className="h-full bg-gradient-to-r from-accent-orange-500 to-accent-orange-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${match.match_score * 100}%` }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="flex-1 px-4 py-2 bg-success-500/20 border border-success-500/50 text-success-400 rounded-lg hover:bg-success-500/30 transition-colors text-sm font-medium">
                          Accept
                        </button>
                        <button className="flex-1 px-4 py-2 bg-error-500/20 border border-error-500/50 text-error-400 rounded-lg hover:bg-error-500/30 transition-colors text-sm font-medium">
                          Decline
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-3 opacity-50" />
                  <p className="text-dark-400">No pending requests. All matched!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="lg:col-span-1"
            variants={itemVariants}
          >
            <div className="bg-dark-900 border border-dark-700/50 rounded-xl p-6 backdrop-blur-sm h-full">
              <h2 className="text-xl font-bold text-white mb-6">Quick Overview</h2>

              <div className="space-y-4">
                <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700/50">
                  <p className="text-dark-400 text-sm mb-2">Your Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex text-accent-orange-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-lg">
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-dark-400">(12 reviews)</span>
                  </div>
                </div>

                <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700/50">
                  <p className="text-dark-400 text-sm mb-2">Response Time</p>
                  <p className="text-lg font-bold text-white">
                    &lt;2 hours
                  </p>
                </div>

                <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700/50">
                  <p className="text-dark-400 text-sm mb-2">Total Students Helped</p>
                  <p className="text-lg font-bold text-white">47</p>
                </div>

                <Link
                  to="/mentor-settings"
                  className="w-full py-2 px-4 bg-accent-blue-500/20 border border-accent-blue-500/50 text-accent-blue-400 rounded-lg hover:bg-accent-blue-500/30 transition-colors text-sm font-medium text-center"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Earnings Chart */}
        <motion.div
          className="bg-dark-900 border border-dark-700/50 rounded-xl p-6 backdrop-blur-sm mb-8"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold text-white mb-6">Weekly Earnings</h2>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={weeklyEarnings}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
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
                cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEarnings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Sessions Mentored */}
        <motion.div
          className="bg-dark-900 border border-dark-700/50 rounded-xl p-6 backdrop-blur-sm"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Sessions Mentored
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
                    <div className="flex items-start gap-3 flex-1">
                      {session.topic && (
                        <div>
                          <h3 className="font-semibold text-white">
                            {session.topic.name}
                          </h3>
                          <p className="text-xs text-dark-400 mt-1">
                            Student: {session.topic ? 'Connected' : 'N/A'}
                          </p>
                          <p className="text-xs text-dark-400 mt-1">
                            {new Date(session.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {session.status === 'completed' && (
                        <div className="text-right">
                          <p className="text-xs text-dark-400">Confidence Gain</p>
                          <p className="text-sm font-bold text-success-400">
                            +{Math.max(0, (session.confidence_end || 0) - session.confidence_start)}%
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
              <User className="w-12 h-12 text-dark-600 mx-auto mb-3 opacity-50" />
              <p className="text-dark-400 mb-4">No sessions mentored yet.</p>
              <p className="text-xs text-dark-400">Accept match requests to start mentoring!</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
