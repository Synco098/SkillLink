'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabase';
import {
  Palette,
  Hammer,
  BookOpen,
  Zap,
  ChevronRight,
  Lightbulb,
  Target,
  Clock,
} from 'lucide-react';

type LearningDNAType = 'Visual' | 'Practical' | 'Theory' | 'Mixed';

interface DNATypeInfo {
  type: LearningDNAType;
  icon: React.ReactNode;
  title: string;
  description: string;
  characteristics: string[];
  approaches: string[];
}

const DNA_TYPES: Record<LearningDNAType, DNATypeInfo> = {
  Visual: {
    type: 'Visual',
    icon: <Palette className="w-8 h-8" />,
    title: 'Visual Learner',
    description:
      'You learn best through images, diagrams, charts, and visual representations. You prefer seeing the big picture before diving into details.',
    characteristics: [
      'Strong spatial reasoning',
      'Good with colors and patterns',
      'Prefers diagrams and infographics',
      'Visual memory is strength',
    ],
    approaches: [
      'Watch video tutorials',
      'Study infographics and flowcharts',
      'Use mind maps for organization',
      'Color-code your notes',
    ],
  },
  Practical: {
    type: 'Practical',
    icon: <Hammer className="w-8 h-8" />,
    title: 'Practical Learner',
    description:
      'You learn by doing. Hands-on experience and real projects are your best teacher. You prefer to jump in and experiment.',
    characteristics: [
      'Hands-on problem solver',
      'Quick learner with practice',
      'Good at applying concepts',
      'Needs real examples',
    ],
    approaches: [
      'Build projects from scratch',
      'Write code first, theory later',
      'Participate in code reviews',
      'Use interactive coding platforms',
    ],
  },
  Theory: {
    type: 'Theory',
    icon: <BookOpen className="w-8 h-8" />,
    title: 'Theory Learner',
    description:
      'You want to understand the why behind concepts. You prefer comprehensive reading material and deep knowledge before implementation.',
    characteristics: [
      'Loves understanding concepts',
      'Enjoys reading documentation',
      'Good at abstract thinking',
      'Prefers structured learning',
    ],
    approaches: [
      'Read books and articles',
      'Study documentation thoroughly',
      'Take structured courses',
      'Understand algorithms deeply',
    ],
  },
  Mixed: {
    type: 'Mixed',
    icon: <Zap className="w-8 h-8" />,
    title: 'Mixed Learner',
    description:
      'You use a combination of different learning styles. You adapt your approach based on the subject matter and context.',
    characteristics: [
      'Flexible learning approach',
      'Adapts to different contexts',
      'Uses multiple resources',
      'Well-rounded learner',
    ],
    approaches: [
      'Combine multiple resources',
      'Use projects + theory',
      'Experiment with different methods',
      'Balance practice and study',
    ],
  },
};

const DNAHelix: React.FC = () => {
  return (
    <div className="relative h-40 w-full flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 200 160" className="w-full h-full max-w-xs" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="dnaGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="dnaGradient2" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Left Helix */}
        <motion.path
          d="M 50 20 Q 40 40, 50 60 T 50 140"
          stroke="url(#dnaGradient1)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Right Helix */}
        <motion.path
          d="M 150 20 Q 160 40, 150 60 T 150 140"
          stroke="url(#dnaGradient2)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut', delay: 0.1 }}
        />

        {/* Connecting bonds */}
        {[20, 40, 60, 80, 100, 120, 140].map((y, i) => (
          <motion.line
            key={i}
            x1="50"
            y1={y}
            x2="150"
            y2={y}
            stroke="#fbbf24"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );
};

const RecommendationItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  content: string;
  delay: number;
}> = ({ icon, label, content, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay }}
    className="flex items-start gap-3 p-3 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors"
  >
    <div className="flex-shrink-0 text-accent-orange-400 mt-1">{icon}</div>
    <div>
      <p className="text-xs font-semibold text-dark-300 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-dark-200">{content}</p>
    </div>
  </motion.div>
);

export default function LearningDNA() {
  const { user, profile } = useAuth();
  const [currentDNA, setCurrentDNA] = useState<LearningDNAType>('Mixed');
  const [isChanging, setIsChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.learning_dna) {
      // Map the learning_dna value to LearningDNAType
      const dnaMap: Record<string, LearningDNAType> = {
        visual: 'Visual',
        practical: 'Practical',
        theory: 'Theory',
        mixed: 'Mixed',
      };
      const mappedDNA = dnaMap[profile.learning_dna.toLowerCase()] || 'Mixed';
      setCurrentDNA(mappedDNA);
    }
    setIsLoading(false);
  }, [profile]);

  const handleChangeDNA = async (newType: LearningDNAType) => {
    if (!user?.id) return;

    setIsChanging(true);
    try {
      // Map back to lowercase for database storage
      const dnaValue = newType.toLowerCase();
      const { error } = await supabase
        .from('profiles')
        .update({ learning_dna: dnaValue })
        .eq('id', user.id);

      if (error) throw error;
      setCurrentDNA(newType);
    } catch (error) {
      console.error('Failed to update DNA type:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const currentInfo = DNA_TYPES[currentDNA];

  const getRecommendations = () => {
    const recommendationMap: Record<LearningDNAType, { topic: string; approach: string; duration: string }[]> = {
      Visual: [
        { topic: 'React Component Architecture', approach: 'Watch component diagrams and architecture videos', duration: '45 min sessions' },
        { topic: 'Database Design', approach: 'Study ER diagrams and visual schemas', duration: '60 min sessions' },
        { topic: 'CSS Layouts', approach: 'Use interactive grid/flex visualizers', duration: '30 min sessions' },
      ],
      Practical: [
        { topic: 'Build a REST API', approach: 'Create a real project from scratch', duration: '90 min sessions' },
        { topic: 'Deploy to Production', approach: 'Deploy actual projects to cloud', duration: '120 min sessions' },
        { topic: 'React Hooks', approach: 'Build interactive components immediately', duration: '60 min sessions' },
      ],
      Theory: [
        { topic: 'Computer Science Fundamentals', approach: 'Read algorithms and data structures books', duration: '90 min sessions' },
        { topic: 'System Design', approach: 'Study design patterns and architectural docs', duration: '120 min sessions' },
        { topic: 'TypeScript Advanced', approach: 'Deep dive into type system documentation', duration: '75 min sessions' },
      ],
      Mixed: [
        { topic: 'Full Stack Development', approach: 'Combine tutorials, reading, and projects', duration: '90 min sessions' },
        { topic: 'Web Performance', approach: 'Use visual tools + performance docs + optimization projects', duration: '60 min sessions' },
        { topic: 'Security Best Practices', approach: 'Theory + practical vulnerability testing', duration: '75 min sessions' },
      ],
    };

    return recommendationMap[currentDNA] || [];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card h-64 bg-dark-800/50 animate-pulse" />
      </div>
    );
  }

  const recommendations = getRecommendations();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-orange-400 to-accent-blue-400 bg-clip-text text-transparent mb-2">
          Your Learning DNA
        </h1>
        <p className="text-dark-300">Discover your unique learning style and optimize your education journey</p>
      </motion.div>

      {/* Current DNA Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card border border-accent-orange-500/30 bg-gradient-to-br from-accent-orange-500/10 to-dark-800 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30 glow-orange" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-orange-500 to-accent-blue-500 flex items-center justify-center text-white mb-4"
              >
                {currentInfo.icon}
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">{currentInfo.title}</h2>
              <p className="text-dark-300 leading-relaxed">{currentInfo.description}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {}}
              className="btn-primary inline-flex items-center gap-2"
            >
              Change DNA Type
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex items-center justify-center">
            <DNAHelix />
          </div>
        </div>
      </motion.div>

      {/* DNA Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Choose Your Learning Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(DNA_TYPES).map((dna, index) => (
            <motion.button
              key={dna.type}
              onClick={() => handleChangeDNA(dna.type)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className={`card border transition-all ${
                currentDNA === dna.type
                  ? 'border-accent-orange-500 bg-gradient-to-br from-accent-orange-500/20 to-dark-800 ring-2 ring-accent-orange-500/50'
                  : 'border-dark-700 hover:border-dark-600'
              }`}
              disabled={isChanging}
            >
              <div className={`${currentDNA === dna.type ? 'text-accent-orange-400' : 'text-dark-400'} mb-3`}>
                {dna.icon}
              </div>
              <h4 className="font-semibold text-white mb-2 text-sm">{dna.title}</h4>
              <p className="text-xs text-dark-400 leading-relaxed">{dna.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Current DNA Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Characteristics */}
        <div className="card border border-dark-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent-orange-400" />
            Key Characteristics
          </h3>
          <ul className="space-y-2">
            {currentInfo.characteristics.map((characteristic, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.08 }}
                className="flex items-center gap-2 text-dark-300"
              >
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-accent-orange-500 to-accent-blue-500" />
                {characteristic}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Recommended Approaches */}
        <div className="card border border-dark-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-blue-400" />
            Recommended Approaches
          </h3>
          <ul className="space-y-2">
            {currentInfo.approaches.map((approach, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.08 }}
                className="flex items-center gap-2 text-dark-300"
              >
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-accent-blue-500 to-accent-orange-500" />
                {approach}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Personalized Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Based on Your {currentInfo.title}</h3>

        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="card border border-dark-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-white">{rec.topic}</h4>
                <span className="text-xs bg-accent-orange-500/20 text-accent-orange-400 px-2 py-1 rounded">
                  {rec.duration}
                </span>
              </div>
              <p className="text-sm text-dark-300">{rec.approach}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Additional Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <RecommendationItem
          icon={<Lightbulb className="w-5 h-5" />}
          label="Study Tips"
          content="Take regular breaks every 25-45 minutes depending on your learning style to maintain focus and retention."
          delay={0.5}
        />
        <RecommendationItem
          icon={<Clock className="w-5 h-5" />}
          label="Optimal Session Length"
          content={
            currentDNA === 'Practical'
              ? '90-120 minute sessions for hands-on projects'
              : currentDNA === 'Theory'
                ? '75-90 minute sessions for deep study'
                : '60-75 minute sessions for mixed approach'
          }
          delay={0.55}
        />
        <RecommendationItem
          icon={<Target className="w-5 h-5" />}
          label="Next Steps"
          content="Focus on your weak areas while maintaining momentum in strong topics. Practice regularly to reinforce learning."
          delay={0.6}
        />
      </motion.div>
    </div>
  );
}
