export type UserRole = 'student' | 'mentor';
export type LearningDNA = 'visual' | 'practical' | 'theory' | 'mixed';
export type SessionStatus = 'active' | 'completed' | 'abandoned';
export type MatchStatus = 'pending' | 'accepted' | 'active' | 'completed' | 'declined';
export type BattleStatus = 'waiting' | 'active' | 'completed';
export type CommunityType = 'discussion' | 'peer_support' | 'mentor_marketplace';
export type InsightType = 'growth' | 'mistake_trend' | 'topic_mastery' | 'confidence';
export type MessageRole = 'student' | 'ai' | 'system';
export type BattleMessageRole = 'player1' | 'player2' | 'ai_moderator';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  learning_dna: LearningDNA;
  skill_coins: number;
  streak_count: number;
  streak_last_date: string | null;
  onboarding_completed: boolean;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  created_at: string;
}

export interface Session {
  id: string;
  student_id: string;
  topic_id: string | null;
  title: string;
  confidence_start: number;
  confidence_end: number | null;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
  topic?: Topic;
}

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Mistake {
  id: string;
  student_id: string;
  topic_id: string | null;
  session_id: string | null;
  mistake_pattern: string;
  hint: string;
  frequency: number;
  resolved: boolean;
  created_at: string;
  updated_at: string;
  topic?: Topic;
}

export interface SkillCoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  reference_id: string | null;
  created_at: string;
}

export interface PeerMatch {
  id: string;
  student_id: string;
  mentor_id: string;
  topic_id: string | null;
  status: MatchStatus;
  match_score: number;
  created_at: string;
  updated_at: string;
  mentor?: Profile;
  student?: Profile;
  topic?: Topic;
}

export interface Battle {
  id: string;
  player1_id: string;
  player2_id: string;
  topic_id: string | null;
  status: BattleStatus;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
  player1?: Profile;
  player2?: Profile;
  topic?: Topic;
}

export interface BattleMessage {
  id: string;
  battle_id: string;
  sender_id: string;
  role: BattleMessageRole;
  content: string;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  type: CommunityType;
  topic_id: string | null;
  created_by: string;
  member_count: number;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  content: string;
  upvotes: number;
  created_at: string;
  author?: Profile;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface MentorListing {
  id: string;
  mentor_id: string;
  specialty: string;
  description: string;
  hourly_rate: number;
  rating: number;
  review_count: number;
  available: boolean;
  created_at: string;
  updated_at: string;
  mentor?: Profile;
}

export interface TopicMastery {
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
}

export interface LearningInsight {
  id: string;
  student_id: string;
  insight_type: InsightType;
  title: string;
  description: string;
  data: Record<string, unknown>;
  created_at: string;
}
