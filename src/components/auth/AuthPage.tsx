import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles, Zap, Brain, Heart } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'signup';
type UserRole = 'student' | 'mentor';

const AnimatedGeometry = ({ delay }: { delay: number }) => {
  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-accent-orange-500/20 to-accent-blue-500/20"
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        width: `${100 + delay * 20}px`,
        height: `${100 + delay * 20}px`,
      }}
    />
  );
};

const FeatureHighlight = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <motion.div
    className="flex gap-3"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-orange-500/20 flex items-center justify-center">
      <Icon className="w-6 h-6 text-accent-orange-500" />
    </div>
    <div>
      <h4 className="font-semibold text-white text-sm">{title}</h4>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  </motion.div>
);

const RoleCard = ({
  role,
  selected,
  onClick,
}: {
  role: UserRole;
  selected: boolean;
  onClick: () => void;
}) => {
  const isStudent = role === 'student';
  const Icon = isStudent ? Brain : Heart;
  const title = isStudent ? 'Student' : 'Mentor';
  const description = isStudent
    ? 'Learn through adaptive questions'
    : 'Guide and mentor other learners';

  return (
    <motion.button
      onClick={onClick}
      className={`relative w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
        selected
          ? 'border-accent-orange-500 bg-accent-orange-500/10'
          : 'border-dark-600/50 bg-dark-800/50 hover:border-dark-500'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`w-5 h-5 mt-0.5 ${
            selected ? 'text-accent-orange-500' : 'text-gray-500'
          }`}
        />
        <div>
          <h4 className="font-semibold text-white text-sm">{title}</h4>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      {selected && (
        <motion.div
          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-orange-500"
          layoutId="roleIndicator"
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        />
      )}
    </motion.button>
  );
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { signUp, signIn, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;
      if (mode === 'signup') {
        result = await signUp(email, password, fullName, selectedRole);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        setError(result.error);
      } else {
        // Navigation will be handled by the app router when auth state changes
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
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
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-accent-orange-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-blue-500/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left side - Branding & Features */}
        <motion.div
          className="hidden lg:flex flex-col justify-between p-8 lg:p-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated background shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <AnimatedGeometry key={i} delay={i * 0.2} />
            ))}
          </div>

          {/* Logo & Tagline */}
          <div className="relative z-10">
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-orange-500 to-accent-blue-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">SkillLink AI</h1>
            </motion.div>

            <motion.p
              className="text-4xl font-bold mb-4 leading-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <span className="text-white">Learn Through </span>
              <span className="text-gradient-orange">Questions,</span>
              <br />
              <span className="text-white">Not Answers</span>
            </motion.p>

            <motion.p
              className="text-gray-400 text-lg mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Master skills through adaptive questioning, peer mentoring, and AI-powered insights.
            </motion.p>
          </div>

          {/* Feature highlights */}
          <div className="relative z-10 space-y-4">
            <FeatureHighlight
              icon={Brain}
              title="Adaptive Learning"
              description="Questions adapt to your learning style"
            />
            <FeatureHighlight
              icon={Zap}
              title="Instant Feedback"
              description="Real-time insights on your progress"
            />
            <FeatureHighlight
              icon={Heart}
              title="Community Support"
              description="Learn from mentors and peers"
            />
          </div>
        </motion.div>

        {/* Right side - Auth Forms */}
        <motion.div
          className="flex items-center justify-center p-6 lg:p-12"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-full max-w-md">
            {/* Mode toggle */}
            <div className="flex gap-4 mb-8">
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    mode === m
                      ? 'bg-accent-orange-500 text-white'
                      : 'bg-dark-800/50 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <motion.div
                    layoutId="tabIndicator"
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    {m === 'login' ? 'Log In' : 'Sign Up'}
                  </motion.div>
                </button>
              ))}
            </div>

            {/* Forms container */}
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form
                  key="login"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Logging in...' : 'Log In'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      I am a...
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <RoleCard
                        role="student"
                        selected={selectedRole === 'student'}
                        onClick={() => setSelectedRole('student')}
                      />
                      <RoleCard
                        role="mentor"
                        selected={selectedRole === 'mentor'}
                        onClick={() => setSelectedRole('mentor')}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer text */}
            <motion.p
              className="text-center text-gray-500 text-sm mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-accent-orange-400 hover:text-accent-orange-300 font-semibold transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
