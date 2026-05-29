'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabase';
import { LearningInsight } from '@/lib/types';
import { TrendingUp, Brain, Award, Zap } from 'lucide-react';

const DEMO_GROWTH_DATA = [
  { week: 'Week 1', growth: 20 },
  { week: 'Week 2', growth: 28 },
  { week: 'Week 3', growth: 35 },
  { week: 'Week 4', growth: 42 },
  { week: 'Week 5', growth: 51 },
  { week: 'Week 6', growth: 62 },
  { week: 'Week 7', growth: 75 },
];

const DEMO_MISTAKE_TRENDS = [
  { week: 'Week 1', Programming: 15, Frontend: 12, Backend: 8, 'AI/ML': 10 },
  { week: 'Week 2', Programming: 13, Frontend: 10, Backend: 7, 'AI/ML': 9 },
  { week: 'Week 3', Programming: 11, Frontend: 8, Backend: 6, 'AI/ML': 7 },
  { week: 'Week 4', Programming: 9, Frontend: 6, Backend: 5, 'AI/ML': 5 },
  { week: 'Week 5', Programming: 7, Frontend: 5, Backend: 4, 'AI/ML': 4 },
  { week: 'Week 6', Programming: 5, Frontend: 3, Backend: 2, 'AI/ML': 2 },
  { week: 'Week 7', Programming: 3, Frontend: 2, Backend: 1, 'AI/ML': 1 },
];

const DEMO_RADAR_DATA = [
  { subject: 'React', value: 92 },
  { subject: 'TypeScript', value: 78 },
  { subject: 'Backend', value: 75 },
  { subject: 'Database', value: 88 },
  { subject: 'Security', value: 65 },
  { subject: 'AI/ML', value: 35 },
];

const DEMO_CONFIDENCE_DATA = [
  { session: 1, confidence: 55, date: 'Jan 1' },
  { session: 2, confidence: 58, date: 'Jan 5' },
  { session: 3, confidence: 62, date: 'Jan 10' },
  { session: 4, confidence: 68, date: 'Jan 15' },
  { session: 5, confidence: 72, date: 'Jan 20' },
  { session: 6, confidence: 78, date: 'Jan 25' },
  { session: 7, confidence: 82, date: 'Feb 1' },
  { session: 8, confidence: 85, date: 'Feb 7' },
  { session: 9, confidence: 88, date: 'Feb 14' },
  { session: 10, confidence: 91, date: 'Feb 20' },
];

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  color: string;
  trend?: number;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, suffix, color, trend, delay }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayValue((prev) => {
          const nextValue = Math.min(prev + Math.ceil(value / 20), value);
          if (nextValue === value) clearInterval(interval);
          return nextValue;
        });
      }, 30);

      return () => clearInterval(interval);
    }, delay * 100);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="card border border-dark-700 hover:border-dark-600 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-success-400" />
            <span className="text-xs font-semibold text-success-400">+{trend}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-dark-400 mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-white">
        {displayValue}
        <span className="text-lg text-dark-400 ml-1">{suffix}</span>
      </h3>
    </motion.div>
  );
};

const ChartCard: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
  delay: number;
}> = ({ title, description, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="card border border-dark-700"
  >
    <div className="mb-6">
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-dark-400">{description}</p>
    </div>
    <div className="overflow-x-auto">{children}</div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-900 border border-dark-700 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-dark-300 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function InsightsDashboard() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('learning_insights')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInsights(data || []);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [user?.id]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-orange-400 to-accent-blue-400 bg-clip-text text-transparent mb-2">
          Learning Insights
        </h1>
        <p className="text-dark-300">AI-powered analysis of your learning journey</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-accent-orange-400" />}
          label="Learning Growth"
          value={75}
          suffix="%"
          color="bg-accent-orange-500/20"
          trend={12}
          delay={0}
        />
        <StatCard
          icon={<Brain className="w-6 h-6 text-accent-blue-400" />}
          label="Mistakes Reduced"
          value={62}
          suffix="%"
          color="bg-accent-blue-500/20"
          trend={8}
          delay={0.1}
        />
        <StatCard
          icon={<Award className="w-6 h-6 text-success-400" />}
          label="Topics Mastered"
          value={12}
          suffix=""
          color="bg-success-500/20"
          trend={3}
          delay={0.2}
        />
        <StatCard
          icon={<Zap className="w-6 h-6 text-warning-400" />}
          label="Avg Confidence"
          value={88}
          suffix="%"
          color="bg-warning-500/20"
          trend={5}
          delay={0.3}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Growth Chart */}
        <ChartCard
          title="Learning Growth"
          description="Your overall learning progression over time"
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={DEMO_GROWTH_DATA}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="growth" stroke="#f97316" fill="url(#colorGrowth)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Confidence Graph */}
        <ChartCard
          title="Confidence Progression"
          description="Your confidence level across learning sessions"
          delay={0.25}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={DEMO_CONFIDENCE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Confidence %"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Mistake Trends Chart */}
        <ChartCard
          title="Mistake Trends"
          description="Number of mistakes per week by category"
          delay={0.3}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={DEMO_MISTAKE_TRENDS}>
              <defs>
                <linearGradient id="prog" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="front" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="back" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="ai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#eab308" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#eab308" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Programming" fill="url(#prog)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Frontend" fill="url(#front)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Backend" fill="url(#back)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="AI/ML" fill="url(#ai)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Topic Mastery Radar */}
        <ChartCard
          title="Topic Mastery Radar"
          description="Your mastery level across different topics"
          delay={0.35}
        >
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={DEMO_RADAR_DATA}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Radar
                name="Mastery Level"
                dataKey="value"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.3}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Additional Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="card border border-accent-orange-500/20 bg-gradient-to-br from-accent-orange-500/10 to-dark-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent-orange-500/20">
              <TrendingUp className="w-5 h-5 text-accent-orange-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Fastest Progress</h4>
              <p className="text-xs text-dark-300">React Hooks: +92 points in 2 weeks</p>
            </div>
          </div>
        </div>

        <div className="card border border-accent-blue-500/20 bg-gradient-to-br from-accent-blue-500/10 to-dark-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent-blue-500/20">
              <Brain className="w-5 h-5 text-accent-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Best Performance</h4>
              <p className="text-xs text-dark-300">Database Design: 88% mastery</p>
            </div>
          </div>
        </div>

        <div className="card border border-success-500/20 bg-gradient-to-br from-success-500/10 to-dark-800">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-success-500/20">
              <Award className="w-5 h-5 text-success-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Consistency</h4>
              <p className="text-xs text-dark-300">12-day streak of daily learning</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
