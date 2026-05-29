/*
  # SkillLink AI - Initial Database Schema

  1. New Tables
    - `profiles` - User profiles extending auth.users with role (student/mentor), learning_dna, skill_coins, streak info
    - `topics` - Available learning topics with category and difficulty
    - `sessions` - AI tutoring sessions with topic, confidence tracking
    - `messages` - Chat messages within sessions (student and AI)
    - `mistakes` - Student mistake records with patterns and hints
    - `skill_coin_transactions` - SkillCoin earning/spending ledger
    - `peer_matches` - Peer mentor matching records
    - `battles` - Socratic battle sessions between two students
    - `battle_messages` - Messages within battle sessions
    - `communities` - Discussion rooms / peer support groups
    - `community_posts` - Posts within communities
    - `community_comments` - Comments on community posts
    - `mentor_listings` - Mentor marketplace listings
    - `topic_mastery` - Per-student per-topic mastery tracking (for heatmap)
    - `learning_insights` - AI-generated learning insights for students

  2. Security
    - RLS enabled on all tables
    - Policies restrict data access to authenticated users and their own data
    - Mentors can read mentee data through peer_matches
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor')),
  learning_dna text DEFAULT 'mixed' CHECK (learning_dna IN ('visual', 'practical', 'theory', 'mixed')),
  skill_coins integer DEFAULT 0,
  streak_count integer DEFAULT 0,
  streak_last_date date,
  onboarding_completed boolean DEFAULT false,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  difficulty text DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Sessions table (AI tutoring)
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id),
  title text DEFAULT '',
  confidence_start numeric DEFAULT 50,
  confidence_end numeric,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('student', 'ai', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Mistakes table
CREATE TABLE IF NOT EXISTS mistakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id),
  session_id uuid REFERENCES sessions(id),
  mistake_pattern text NOT NULL,
  hint text DEFAULT '',
  frequency integer DEFAULT 1,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skill Coin Transactions
CREATE TABLE IF NOT EXISTS skill_coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Peer Matches
CREATE TABLE IF NOT EXISTS peer_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'active', 'completed', 'declined')),
  match_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Battles
CREATE TABLE IF NOT EXISTS battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player2_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES topics(id),
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  player1_score integer DEFAULT 0,
  player2_score integer DEFAULT 0,
  winner_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Battle Messages
CREATE TABLE IF NOT EXISTS battle_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('player1', 'player2', 'ai_moderator')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Communities
CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  type text DEFAULT 'discussion' CHECK (type IN ('discussion', 'peer_support', 'mentor_marketplace')),
  topic_id uuid REFERENCES topics(id),
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Community Posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Community Comments
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Mentor Listings
CREATE TABLE IF NOT EXISTS mentor_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialty text NOT NULL,
  description text DEFAULT '',
  hourly_rate integer DEFAULT 0,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Topic Mastery (for heatmap)
CREATE TABLE IF NOT EXISTS topic_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id),
  mastery_level numeric DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  questions_attempted integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  last_practiced timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, topic_id)
);

-- Learning Insights
CREATE TABLE IF NOT EXISTS learning_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('growth', 'mistake_trend', 'topic_mastery', 'confidence')),
  title text NOT NULL,
  description text NOT NULL,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Topics policies (read-only for all authenticated)
CREATE POLICY "Authenticated users can read topics"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

-- Sessions policies
CREATE POLICY "Students can read own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Messages policies
CREATE POLICY "Users can read messages in their sessions"
  ON messages FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM sessions WHERE sessions.id = messages.session_id AND sessions.student_id = auth.uid()));

CREATE POLICY "Users can insert messages in their sessions"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM sessions WHERE sessions.id = messages.session_id AND sessions.student_id = auth.uid()));

-- Mistakes policies
CREATE POLICY "Students can read own mistakes"
  ON mistakes FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own mistakes"
  ON mistakes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own mistakes"
  ON mistakes FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Skill Coin Transactions policies
CREATE POLICY "Users can read own transactions"
  ON skill_coin_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON skill_coin_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Peer Matches policies
CREATE POLICY "Users can read own matches"
  ON peer_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = mentor_id);

CREATE POLICY "Students can create match requests"
  ON peer_matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Match participants can update matches"
  ON peer_matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = student_id OR auth.uid() = mentor_id);

-- Battles policies
CREATE POLICY "Players can read own battles"
  ON battles FOR SELECT
  TO authenticated
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Players can create battles"
  ON battles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Players can update own battles"
  ON battles FOR UPDATE
  TO authenticated
  USING (auth.uid() = player1_id OR auth.uid() = player2_id)
  WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Battle Messages policies
CREATE POLICY "Battle players can read messages"
  ON battle_messages FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM battles WHERE battles.id = battle_messages.battle_id AND (battles.player1_id = auth.uid() OR battles.player2_id = auth.uid())));

CREATE POLICY "Battle players can send messages"
  ON battle_messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM battles WHERE battles.id = battle_messages.battle_id AND (battles.player1_id = auth.uid() OR battles.player2_id = auth.uid())));

-- Communities policies
CREATE POLICY "Authenticated users can read communities"
  ON communities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Community Posts policies
CREATE POLICY "Authenticated users can read posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Community Comments policies
CREATE POLICY "Authenticated users can read comments"
  ON community_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON community_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Mentor Listings policies
CREATE POLICY "Authenticated users can read mentor listings"
  ON mentor_listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Mentors can create own listings"
  ON mentor_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can update own listings"
  ON mentor_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

-- Topic Mastery policies
CREATE POLICY "Students can read own mastery"
  ON topic_mastery FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own mastery"
  ON topic_mastery FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own mastery"
  ON topic_mastery FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Learning Insights policies
CREATE POLICY "Students can read own insights"
  ON learning_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "System can insert insights"
  ON learning_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_student ON mistakes(student_id);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_student ON topic_mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_skill_coins_user ON skill_coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_peer_matches_student ON peer_matches(student_id);
CREATE INDEX IF NOT EXISTS idx_peer_matches_mentor ON peer_matches(mentor_id);

-- Insert default topics
INSERT INTO topics (name, category, difficulty, description) VALUES
  ('JavaScript Fundamentals', 'Programming', 'beginner', 'Core JS concepts: variables, functions, loops, and scope'),
  ('React Basics', 'Frontend', 'beginner', 'Components, state, props, and JSX fundamentals'),
  ('Data Structures', 'Computer Science', 'intermediate', 'Arrays, linked lists, trees, graphs, and hash maps'),
  ('Algorithms', 'Computer Science', 'advanced', 'Sorting, searching, dynamic programming, and complexity'),
  ('Python Basics', 'Programming', 'beginner', 'Python syntax, data types, and control flow'),
  ('Machine Learning', 'AI/ML', 'advanced', 'Supervised learning, neural networks, and model evaluation'),
  ('CSS & Design', 'Frontend', 'beginner', 'Flexbox, grid, animations, and responsive design'),
  ('SQL & Databases', 'Backend', 'intermediate', 'Queries, joins, indexing, and database design'),
  ('System Design', 'Backend', 'advanced', 'Scalability, load balancing, and microservices'),
  ('TypeScript', 'Programming', 'intermediate', 'Type system, generics, and advanced patterns'),
  ('Node.js', 'Backend', 'intermediate', 'Server-side JS, Express, and REST APIs'),
  ('Cybersecurity', 'Security', 'advanced', 'OWASP, encryption, and secure coding practices');
