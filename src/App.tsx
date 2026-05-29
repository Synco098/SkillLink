import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/useAuth';
import { Layout } from './components/shared/Layout';
import AuthPage from './components/auth/AuthPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { MentorDashboard } from './components/dashboard/MentorDashboard';
import SocraticTutor from './components/chat/SocraticTutor';
import MistakeMemory from './components/chat/MistakeMemory';
import DoubtHeatmap from './components/heatmap/DoubtHeatmap';
import BattleMode from './components/battle/BattleMode';
import CommunityPage from './components/community/CommunityPage';
import PeerMatch from './components/community/PeerMatch';
import InsightsDashboard from './components/insights/InsightsDashboard';
import LearningDNA from './components/learning/LearningDNA';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-accent-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading SkillLink AI...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { profile } = useAuth();

  if (profile && !profile.onboarding_completed) {
    return <OnboardingFlow />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={profile?.role === 'mentor' ? <MentorDashboard /> : <DashboardPage />} />
        <Route path="/tutor" element={<SocraticTutor />} />
        <Route path="/mistakes" element={<MistakeMemory />} />
        <Route path="/heatmap" element={<DoubtHeatmap />} />
        <Route path="/battle" element={<BattleMode />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/peers" element={<PeerMatch />} />
        <Route path="/insights" element={<InsightsDashboard />} />
        <Route path="/learning-dna" element={<LearningDNA />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-accent-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading SkillLink AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <ProtectedRoute>
      <AppRoutes />
    </ProtectedRoute>
  );
}
