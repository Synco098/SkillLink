import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Sparkles,
  Eye,
  Hammer,
  BookOpen,
  Zap,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { useNavigate } from 'react-router-dom';
import type { LearningDNA } from '@/lib/types';

type Step = 'welcome' | 'dna' | 'topics' | 'complete';

interface LearningStyle {
  id: LearningDNA;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
}

const learningStyles: LearningStyle[] = [
  {
    id: 'visual',
    title: 'Visual Learner',
    description: 'Diagrams, charts, and visual demonstrations help you understand better',
    icon: Eye,
    color: 'from-accent-orange-400 to-accent-orange-600',
    bgGradient: 'from-accent-orange-500/10 to-accent-orange-500/5',
  },
  {
    id: 'practical',
    title: 'Practical Learner',
    description: 'You learn best by doing, experimenting, and hands-on practice',
    icon: Hammer,
    color: 'from-accent-blue-400 to-accent-blue-600',
    bgGradient: 'from-accent-blue-500/10 to-accent-blue-500/5',
  },
  {
    id: 'theory',
    title: 'Theory Lover',
    description: 'Deep understanding of principles and concepts excites you',
    icon: BookOpen,
    color: 'from-purple-400 to-purple-600',
    bgGradient: 'from-purple-500/10 to-purple-500/5',
  },
  {
    id: 'mixed',
    title: 'Balanced Learner',
    description: 'You thrive with a mix of theory, visuals, and hands-on projects',
    icon: Zap,
    color: 'from-pink-400 to-pink-600',
    bgGradient: 'from-pink-500/10 to-pink-500/5',
  },
];

const popularTopics = [
  'Web Development',
  'Python',
  'Data Science',
  'Machine Learning',
  'React',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'SQL',
  'Cloud Computing',
  'DevOps',
  'Mobile Development',
];

const LearningDNACard = ({
  style,
  selected,
  onClick,
}: {
  style: LearningStyle;
  selected: boolean;
  onClick: () => void;
}) => {
  const Icon = style.icon;

  return (
    <motion.button
      onClick={onClick}
      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden h-full ${
        selected
          ? 'border-current bg-gradient-to-br shadow-lg'
          : 'border-dark-600/50 bg-dark-800/50 hover:border-dark-500'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={selected ? { borderColor: 'currentColor' } : {}}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${style.bgGradient} pointer-events-none`}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <Icon
            className={`w-8 h-8 ${
              selected ? `text-transparent bg-clip-text bg-gradient-to-r ${style.color}` : 'text-gray-400'
            }`}
          />
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="w-6 h-6 text-accent-orange-500" />
            </motion.div>
          )}
        </div>

        <h3 className="font-semibold text-white mb-2 text-lg">{style.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{style.description}</p>
      </div>

      {/* Animated border on hover */}
      {selected && (
        <motion.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${style.color} opacity-10 pointer-events-none`}
          animate={{ opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

const TopicCard = ({
  topic,
  selected,
  onClick,
}: {
  topic: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-300 relative ${
      selected
        ? 'border-accent-orange-500 bg-accent-orange-500/15 text-accent-orange-300'
        : 'border-dark-600/50 bg-dark-800/30 text-gray-400 hover:border-dark-500 hover:text-gray-300'
    }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="flex items-center gap-2">
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <CheckCircle2 className="w-4 h-4" />
        </motion.div>
      )}
      {topic}
    </div>

    {selected && (
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-orange-500 to-accent-orange-500 opacity-5 pointer-events-none"
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    )}
  </motion.button>
);

const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const steps: Step[] = ['welcome', 'dna', 'topics', 'complete'];
  const progress = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        {steps.map((step, idx) => (
          <motion.div
            key={step}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx < current
                ? 'bg-accent-orange-500 scale-125'
                : idx === current
                  ? 'bg-accent-orange-500'
                  : 'bg-dark-600'
            }`}
          />
        ))}
      </div>
      <motion.div
        className="h-1 bg-dark-700 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-accent-orange-500 to-accent-orange-600 rounded-full"
          initial={{ width: `${(1 / total) * 100}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </motion.div>
    </div>
  );
};

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { updateProfile, profile, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedDNA, setSelectedDNA] = useState<LearningDNA | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const steps: Step[] = ['welcome', 'dna', 'topics', 'complete'];
  const currentStepIndex = steps.indexOf(step);

  const toggleTopic = (topic: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topic)) {
      newSelected.delete(topic);
    } else {
      newSelected.add(topic);
    }
    setSelectedTopics(newSelected);
  };

  const canProceed = () => {
    if (step === 'dna') return selectedDNA !== null;
    if (step === 'topics') return selectedTopics.size >= 3;
    return true;
  };

  const handleNext = async () => {
    if (step === 'topics') {
      // Save and complete onboarding
      setLoading(true);
      try {
        const topicsArray = Array.from(selectedTopics);
        await updateProfile({
          learning_dna: selectedDNA || 'mixed',
          onboarding_completed: true,
        });
        setStep('complete');
      } catch (err) {
        console.error('Failed to save profile:', err);
      } finally {
        setLoading(false);
      }
    } else if (step === 'welcome') {
      setStep('dna');
    } else if (step === 'dna') {
      setStep('topics');
    }
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-accent-orange-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-accent-orange-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/2 w-96 h-96 bg-accent-blue-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/4" />
      </div>

      <div className="relative">
        {/* Header with progress */}
        <div className="px-6 py-8 lg:px-12 lg:py-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <ProgressBar current={currentStepIndex + 1} total={steps.length} />
          </motion.div>
        </div>

        {/* Content area */}
        <div className="px-6 lg:px-12 pb-12 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  className="inline-block mb-8"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-orange-500 to-accent-blue-500 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  Welcome to
                  <span className="block text-gradient-orange">SkillLink AI</span>
                </h1>

                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                  We're excited to help you on your learning journey. Let's get to know how you
                  learn best and set up your profile.
                </p>

                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
                >
                  Get Started
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {step === 'dna' && (
              <motion.div
                key="dna"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                <div className="mb-12">
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    What's your learning style?
                  </h2>
                  <p className="text-gray-400 text-lg">
                    We'll personalize your experience based on how you learn best.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {learningStyles.map((style, idx) => (
                    <motion.div
                      key={style.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                    >
                      <LearningDNACard
                        style={style}
                        selected={selectedDNA === style.id}
                        onClick={() => setSelectedDNA(style.id)}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => setStep('welcome')}
                    className="btn-ghost flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    whileHover={canProceed() ? { scale: 1.02 } : {}}
                    whileTap={canProceed() ? { scale: 0.98 } : {}}
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'topics' && (
              <motion.div
                key="topics"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                <div className="mb-12">
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    What do you want to learn?
                  </h2>
                  <p className="text-gray-400 text-lg">
                    Select at least 3 topics that interest you. You can always add more later.
                  </p>
                </div>

                <div className="bg-dark-800/30 border border-dark-600/50 rounded-2xl p-8 mb-12">
                  <div className="flex flex-wrap gap-3">
                    {popularTopics.map((topic, idx) => (
                      <motion.div
                        key={topic}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                      >
                        <TopicCard
                          topic={topic}
                          selected={selectedTopics.has(topic)}
                          onClick={() => toggleTopic(topic)}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <motion.p
                    className="text-sm text-gray-500 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Selected: {selectedTopics.size} / 3 minimum
                  </motion.p>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => setStep('dna')}
                    className="btn-ghost flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    whileHover={canProceed() && !loading ? { scale: 1.02 } : {}}
                    whileTap={canProceed() && !loading ? { scale: 0.98 } : {}}
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Setting up...' : 'Complete Setup'}
                    {!loading && <CheckCircle2 className="w-5 h-5" />}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'complete' && (
              <motion.div
                key="complete"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                  className="mb-8"
                >
                  <div className="inline-block">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <CheckCircle2 className="w-20 h-20 text-accent-orange-500" />
                    </motion.div>
                  </div>
                </motion.div>

                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  You're all set!
                </h1>

                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
                  Your profile has been personalized based on your learning style:{' '}
                  <span className="font-semibold text-accent-orange-300">
                    {selectedDNA && learningStyles.find((s) => s.id === selectedDNA)?.title}
                  </span>
                </p>

                <p className="text-gray-500 max-w-2xl mx-auto mb-12">
                  Selected topics: {Array.from(selectedTopics).join(', ')}
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={handleComplete}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>

                {/* Confetti animation background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: '-10px',
                        backgroundColor: [
                          'rgba(249, 115, 22, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                        ][i % 2],
                      }}
                      animate={{
                        y: [0, window.innerHeight + 100],
                        x: [0, (Math.random() - 0.5) * 200],
                        opacity: [1, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 1,
                        delay: i * 0.1,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
