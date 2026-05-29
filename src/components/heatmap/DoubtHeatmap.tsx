'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabase';
import { TopicMastery, Topic } from '@/lib/types';
import { RotateCw, TrendingUp } from 'lucide-react';

interface ExtendedTopicMastery {
  id: string;
  student_id: string;
  topic_id: string;
  mastery_level: number;
  questions_attempted: number;
  questions_correct: number;
  last_practiced: string | null;
  created_at: string;
  updated_at: string;
  topic?: Topic;
  topicName?: string;
}

const DEMO_TOPICS: ExtendedTopicMastery[] = [
  {
    id: '1',
    student_id: 'demo',
    topic_id: '1',
    mastery_level: 92,
    questions_attempted: 145,
    questions_correct: 133,
    last_practiced: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topicName: 'React Hooks',
  },
  {
    id: '2',
    student_id: 'demo',
    topic_id: '2',
    mastery_level: 78,
    questions_attempted: 98,
    questions_correct: 76,
    last_practiced: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topicName: 'TypeScript',
  },
  {
    id: '3',
    student_id: 'demo',
    topic_id: '3',
    mastery_level: 45,
    questions_attempted: 67,
    questions_correct: 30,
    last_practiced: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topicName: 'Node.js',
  },
  {
    id: '4',
    student_id: 'demo',
    topic_id: '4',
    mastery_level: 88,
    questions_attempted: 120,
    questions_correct: 106,
    last_practiced: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topicName: 'Database Design',
  },
  {
    id: '5',
    student_id: 'demo',
    topic_id: '5',
    mastery_level: 35,
    questions_attempted: 52,
    questions_correct: 18,
    last_practiced: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topicName: 'Machine Learning',
  },
  {
    id: '6',
    student_id: 'demo',
    topic_id: '6',
    mastery_level: 65,
    questions_attempted: 89,
    questions_correct: 58,
    last_practiced: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topicName: 'Web Security',
  },
  {
    id: '7',
    student_id: 'demo',
    topic_id: '7',
    mastery_level: 82,
    questions_attempted: 111,
    questions_correct: 91,
    last_practiced: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topicName: 'CSS Layouts',
  },
  {
    id: '8',
    student_id: 'demo',
    topic_id: '8',
    mastery_level: 72,
    questions_attempted: 103,
    questions_correct: 73,
    last_practiced: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topicName: 'REST APIs',
  },
];

const CATEGORIES = [
  'All',
  'Programming',
  'Frontend',
  'Backend',
  'Computer Science',
  'AI/ML',
  'Security',
];

const getMasteryColor = (level: number): string => {
  if (level >= 80) return 'bg-gradient-to-br from-success-500 to-success-400';
  if (level >= 60) return 'bg-gradient-to-br from-accent-blue-500 to-accent-blue-400';
  if (level >= 30) return 'bg-gradient-to-br from-accent-orange-500 to-accent-orange-400';
  return 'bg-gradient-to-br from-error-500 to-error-400';
};

const getMasteryBorderColor = (level: number): string => {
  if (level >= 80) return 'border-success-500/30';
  if (level >= 60) return 'border-accent-blue-500/30';
  if (level >= 30) return 'border-accent-orange-500/30';
  return 'border-error-500/30';
};

const CircularProgress: React.FC<{ value: number; size?: number }> = ({ value, size = 60 }) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-dark-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-accent-orange-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{value}%</span>
      </div>
    </div>
  );
};

interface TopicCardProps {
  topic: ExtendedTopicMastery;
  isExpanded: boolean;
  onHover: (id: string | null) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, isExpanded, onHover }) => {
  const masteryColor = getMasteryColor(topic.mastery_level);
  const borderColor = getMasteryBorderColor(topic.mastery_level);

  return (
    <motion.div
      layout
      onHoverStart={() => onHover(topic.id)}
      onHoverEnd={() => onHover(null)}
      className={`card border ${borderColor} cursor-pointer overflow-hidden group`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`${masteryColor} absolute inset-0 opacity-10`} />
      <div className="relative p-4 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white truncate group-hover:text-accent-orange-400 transition-colors">
              {topic.topicName}
            </h3>
          </div>
        </div>

        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2 text-xs text-dark-200"
          >
            <div className="flex justify-between">
              <span>Attempted:</span>
              <span className="text-accent-orange-400 font-semibold">{topic.questions_attempted}</span>
            </div>
            <div className="flex justify-between">
              <span>Correct:</span>
              <span className="text-success-400 font-semibold">
                {topic.questions_correct} ({Math.round((topic.questions_correct / topic.questions_attempted) * 100)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Practiced:</span>
              <span className="text-accent-blue-400 font-semibold">
                {Math.floor((Date.now() - new Date(topic.last_practiced || '').getTime()) / (1000 * 60 * 60 * 24))} days ago
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <CircularProgress value={topic.mastery_level} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const WeeklyAnalytics: React.FC = () => {
  const chartData = [
    { category: 'Frontend', hours: 12, week: 'W1' },
    { category: 'Frontend', hours: 14, week: 'W2' },
    { category: 'Frontend', hours: 16, week: 'W3' },
    { category: 'Backend', hours: 10, week: 'W1' },
    { category: 'Backend', hours: 12, week: 'W2' },
    { category: 'Backend', hours: 15, week: 'W3' },
    { category: 'AI/ML', hours: 8, week: 'W1' },
    { category: 'AI/ML', hours: 9, week: 'W2' },
    { category: 'AI/ML', hours: 11, week: 'W3' },
  ];

  const aggregatedData = [
    { week: 'Week 1', Frontend: 12, Backend: 10, 'AI/ML': 8 },
    { week: 'Week 2', Frontend: 14, Backend: 12, 'AI/ML': 9 },
    { week: 'Week 3', Frontend: 16, Backend: 15, 'AI/ML': 11 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent-orange-500" />
          Weekly Analytics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Most Improved */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="card border border-success-500/30 bg-gradient-to-br from-success-500/10 to-dark-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-300 mb-1">Most Improved</p>
                <h4 className="text-lg font-bold text-success-400">React Hooks</h4>
                <p className="text-xs text-dark-400 mt-1">+12% improvement this week</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-success-400" />
              </div>
            </div>
          </motion.div>

          {/* Needs Attention */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="card border border-error-500/30 bg-gradient-to-br from-error-500/10 to-dark-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-300 mb-1">Needs Attention</p>
                <h4 className="text-lg font-bold text-error-400">Machine Learning</h4>
                <p className="text-xs text-dark-400 mt-1">Only 35% mastery • 7 days since practice</p>
              </div>
              <div className="flex items-center gap-2">
                <RotateCw className="w-8 h-8 text-error-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Practice Hours Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card border border-accent-blue-500/20"
        >
          <h4 className="text-sm font-semibold text-white mb-4">Practice Hours by Category</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aggregatedData}>
              <defs>
                <linearGradient id="colorFrontend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorBackend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorAIML" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Frontend" fill="url(#colorFrontend)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Backend" fill="url(#colorBackend)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="AI/ML" fill="url(#colorAIML)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function DoubtHeatmap() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<ExtendedTopicMastery[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!user?.id) {
        setTopics(DEMO_TOPICS);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('topic_mastery')
          .select('*, topics(*)')
          .eq('user_id', user.id);

        if (error) throw error;

        const enhancedTopics: ExtendedTopicMastery[] = (data || []).map((item: any) => ({
          ...item,
          topicName: item.topics?.name || 'Unknown Topic',
        }));

        setTopics(enhancedTopics.length > 0 ? enhancedTopics : DEMO_TOPICS);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
        setTopics(DEMO_TOPICS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [user?.id]);

  const filteredTopics =
    activeCategory === 'All' ? topics : topics.filter((t) => t.topicName?.includes(activeCategory) || false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-orange-400 to-accent-blue-400 bg-clip-text text-transparent mb-2">
          Learning Heatmap
        </h1>
        <p className="text-dark-300">Track your mastery across all topics at a glance</p>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {CATEGORIES.map((category) => (
          <motion.button
            key={category}
            onClick={() => setActiveCategory(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeCategory === category
                ? 'bg-gradient-to-r from-accent-orange-500 to-accent-blue-500 text-white shadow-lg shadow-accent-orange-500/50'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700 border border-dark-700'
            }`}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>

      {/* Heatmap Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-40 bg-dark-800/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredTopics.map((topic) => (
            <motion.div key={topic.id} variants={itemVariants}>
              <TopicCard
                topic={topic}
                isExpanded={expandedId === topic.id}
                onHover={setExpandedId}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Weekly Analytics */}
      <WeeklyAnalytics />
    </div>
  );
}
