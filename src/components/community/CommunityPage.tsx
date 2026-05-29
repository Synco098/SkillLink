'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Users,
  Briefcase,
  Search,
  Plus,
  Heart,
  MessageSquare,
  Clock,
  Star,
  Filter,
  X,
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import type { Community, CommunityPost, MentorListing, PeerMatch } from '@/lib/types';

type ActiveTab = 'discussions' | 'mentors' | 'peer-groups';

interface DiscussionRoom {
  id: string;
  name: string;
  description: string;
  type: string;
  topic_id: string | null;
  created_by: string;
  member_count: number;
  created_at: string;
  memberCount: number;
  lastActive: Date;
  category: string;
}

interface PostWithStats {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  content: string;
  upvotes: number;
  created_at: string;
  commentCount: number;
}

const MOCK_DISCUSSIONS: DiscussionRoom[] = [
  {
    id: '1',
    name: 'React Hooks Deep Dive',
    description: 'Advanced patterns and best practices',
    type: 'discussion',
    topic_id: null,
    created_by: 'user1',
    member_count: 342,
    created_at: new Date('2024-01-15').toISOString(),
    memberCount: 342,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    category: 'Frontend',
  },
  {
    id: '2',
    name: 'System Design Mastery',
    description: 'Learn to design scalable systems',
    type: 'discussion',
    topic_id: null,
    created_by: 'user2',
    member_count: 567,
    created_at: new Date('2024-01-20').toISOString(),
    memberCount: 567,
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    category: 'Backend',
  },
  {
    id: '3',
    name: 'JavaScript Interview Prep',
    description: 'Prepare for your dream job',
    type: 'discussion',
    topic_id: null,
    created_by: 'user3',
    member_count: 892,
    created_at: new Date('2024-02-01').toISOString(),
    memberCount: 892,
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
    category: 'Interviews',
  },
  {
    id: '4',
    name: 'Python Data Science',
    description: 'Analytics, ML, and big data',
    type: 'discussion',
    topic_id: null,
    created_by: 'user4',
    member_count: 654,
    created_at: new Date('2024-02-10').toISOString(),
    memberCount: 654,
    lastActive: new Date(Date.now() - 15 * 60 * 1000),
    category: 'Data Science',
  },
];

const MOCK_POSTS: PostWithStats[] = [
  {
    id: '1',
    community_id: '1',
    author_id: 'user1',
    title: 'Best practices for custom hooks',
    content:
      'I recently refactored our codebase to use custom hooks. Here are the patterns that worked best for us...',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    upvotes: 234,
    commentCount: 45,
  },
  {
    id: '2',
    community_id: '1',
    author_id: 'user2',
    title: 'useCallback vs useMemo - when to use what?',
    content: 'Im confused about the differences. Can someone explain the performance implications?',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    upvotes: 189,
    commentCount: 62,
  },
];

const MOCK_MENTORS: MentorListing[] = [
  {
    id: '1',
    mentor_id: 'mentor1',
    specialty: 'React & Frontend',
    hourly_rate: 65,
    available: true,
    rating: 4.9,
    review_count: 42,
    description: 'Expert React developer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    mentor_id: 'mentor2',
    specialty: 'System Design',
    hourly_rate: 85,
    available: true,
    rating: 4.8,
    review_count: 38,
    description: 'Senior system architect',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    mentor_id: 'mentor3',
    specialty: 'Python & Data Science',
    hourly_rate: 55,
    available: false,
    rating: 4.7,
    review_count: 29,
    description: 'Data science specialist',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    mentor_id: 'mentor4',
    specialty: 'Interview Preparation',
    hourly_rate: 75,
    available: true,
    rating: 4.9,
    review_count: 55,
    description: 'FAANG interview coach',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_PEER_GROUPS: Community[] = [
  {
    id: 'pg1',
    name: 'Early Morning Study Crew',
    description: '6am-8am EST daily study sessions',
    type: 'peer_support',
    topic_id: null,
    created_by: 'user1',
    member_count: 24,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pg2',
    name: 'Weekend Coding Hackathons',
    description: 'Build projects together on weekends',
    type: 'peer_support',
    topic_id: null,
    created_by: 'user2',
    member_count: 56,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pg3',
    name: 'Job Search Support',
    description: 'Mutual support during job hunting',
    type: 'peer_support',
    topic_id: null,
    created_by: 'user3',
    member_count: 89,
    created_at: new Date().toISOString(),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -8, transition: { duration: 0.3 } },
};

export default function CommunityPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('discussions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // Filter discussions by search
  const filteredDiscussions = MOCK_DISCUSSIONS.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter mentors by specialty
  const filteredMentors =
    specialtyFilter === 'all'
      ? MOCK_MENTORS
      : MOCK_MENTORS.filter((m) => m.specialty.toLowerCase().includes(specialtyFilter.toLowerCase()));

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleCreatePost = () => {
    if (newPostTitle.trim() && newPostContent.trim()) {
      // In a real app, this would be sent to the server
      console.log('Creating post:', { title: newPostTitle, content: newPostContent });
      setShowNewPostModal(false);
      setNewPostTitle('');
      setNewPostContent('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="border-b border-dark-700/50 glass backdrop-blur-xl sticky top-0 z-40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gradient-blue flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  Community Hub
                </h1>
                <p className="text-dark-400 text-sm mt-1">Learn together, grow together</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <motion.div className="flex gap-2 overflow-x-auto pb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {[
                { id: 'discussions', label: 'Discussions', icon: MessageCircle },
                { id: 'mentors', label: 'Mentor Marketplace', icon: Briefcase },
                { id: 'peer-groups', label: 'Peer Groups', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-accent-blue-500 text-white'
                        : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {/* Discussions Tab */}
            {activeTab === 'discussions' && (
              <motion.div
                key="discussions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {!selectedRoom ? (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    {/* Search Bar */}
                    <motion.div className="mb-8" variants={itemVariants}>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                          type="text"
                          placeholder="Search discussion rooms..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="input-field pl-12 w-full"
                        />
                      </div>
                    </motion.div>

                    {/* Discussion Rooms Grid */}
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      variants={containerVariants}
                    >
                      {filteredDiscussions.map((room) => (
                        <motion.button
                          key={room.id}
                          onClick={() => setSelectedRoom(room.id)}
                          className="card border border-dark-700 hover:border-accent-blue-500/50 p-6 text-left group overflow-hidden relative"
                          variants={itemVariants}
                          whileHover="hover"
                          initial="rest"
                          animate="rest"
                          custom={cardHoverVariants}
                        >
                          {/* Animated background on hover */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-accent-blue-500/10 to-accent-orange-500/10 opacity-0 group-hover:opacity-100"
                            transition={{ duration: 0.3 }}
                          />

                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-white group-hover:text-accent-blue-400 transition-colors">
                                  {room.name}
                                </h3>
                                <p className="text-sm text-dark-400 mt-1">{room.description}</p>
                              </div>
                              <motion.div
                                className="px-3 py-1 rounded-full bg-accent-orange-500/20 border border-accent-orange-500/50 text-xs font-semibold text-accent-orange-400 ml-3 flex-shrink-0"
                                whileHover={{ scale: 1.05 }}
                              >
                                {room.category}
                              </motion.div>
                            </div>

                            <div className="space-y-3 mt-6 pt-4 border-t border-dark-700">
                              <div className="flex items-center gap-2 text-sm text-dark-400">
                                <Users className="w-4 h-4" />
                                <span>{room.memberCount.toLocaleString()} members</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-dark-400">
                                <Clock className="w-4 h-4" />
                                <span>Active {formatTimeAgo(room.lastActive.toISOString())}</span>
                              </div>
                            </div>

                            <motion.div
                              className="mt-4 flex items-center gap-2 text-accent-blue-400 font-semibold text-sm group-hover:gap-3 transition-all"
                              initial={{ x: 0 }}
                              whileHover={{ x: 5 }}
                            >
                              View Room
                              <ChevronRight className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                ) : (
                  /* Discussion Room Detail */
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.button
                      onClick={() => setSelectedRoom(null)}
                      className="mb-6 text-dark-400 hover:text-dark-200 flex items-center gap-2 transition-colors group"
                      whileHover={{ x: -5 }}
                    >
                      <ChevronRight className="w-5 h-5 rotate-180 group-hover:scale-110 transition-transform" />
                      Back to Discussions
                    </motion.button>

                    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                      <motion.div className="flex items-center justify-between" variants={itemVariants}>
                        <h2 className="text-3xl font-bold text-gradient-blue">
                          {MOCK_DISCUSSIONS.find((r) => r.id === selectedRoom)?.name}
                        </h2>
                        <motion.button
                          onClick={() => setShowNewPostModal(true)}
                          className="btn-primary flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus className="w-5 h-5" />
                          New Post
                        </motion.button>
                      </motion.div>

                      {/* Posts List */}
                      <motion.div className="space-y-4" variants={containerVariants}>
                        {MOCK_POSTS.map((post, idx) => (
                          <motion.div
                            key={post.id}
                            className="card border border-dark-700 hover:border-accent-blue-500/50 p-6 cursor-pointer group transition-all"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -4 }}
                          >
                            <h3 className="text-lg font-bold text-white group-hover:text-accent-blue-400 transition-colors mb-2">
                              {post.title}
                            </h3>
                            <p className="text-dark-300 mb-4 line-clamp-2">{post.content}</p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400 pt-4 border-t border-dark-700">
                              <motion.button
                                className="flex items-center gap-2 hover:text-success-400 transition-colors group/like"
                                whileHover={{ scale: 1.1 }}
                              >
                                <Heart className="w-4 h-4 group-hover/like:fill-current" />
                                {post.upvotes} upvotes
                              </motion.button>
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                {post.commentCount} comments
                              </div>
                              <div className="flex items-center gap-2 ml-auto">
                                <Clock className="w-4 h-4" />
                                {formatTimeAgo(post.created_at)}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Mentor Marketplace Tab */}
            {activeTab === 'mentors' && (
              <motion.div
                key="mentors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                variants={containerVariants}
              >
                {/* Filter Bar */}
                <motion.div className="mb-8 flex items-center gap-4" variants={itemVariants}>
                  <Filter className="w-5 h-5 text-dark-400" />
                  <select
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="input-field py-2 px-4"
                  >
                    <option value="all">All Specialties</option>
                    <option value="React">React & Frontend</option>
                    <option value="System">System Design</option>
                    <option value="Python">Python & Data Science</option>
                    <option value="Interview">Interview Preparation</option>
                  </select>
                </motion.div>

                {/* Mentor Cards Grid */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  variants={containerVariants}
                >
                  {filteredMentors.map((mentor) => (
                    <motion.div
                      key={mentor.id}
                      className="card border border-dark-700 p-6 flex flex-col h-full hover:border-accent-orange-500/50 group transition-all"
                      variants={itemVariants}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      {/* Mentor Avatar */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-orange-500 to-accent-blue-500 mb-4 flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>

                      {/* Mentor Info */}
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent-orange-400 transition-colors">
                        {mentor.specialty}
                      </h3>
                      <p className="text-sm text-dark-400 mb-4 line-clamp-2">{mentor.description}</p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <motion.div key={i} whileHover={{ scale: 1.2 }}>
                            <Star
                              className={`w-4 h-4 ${
                                i < Math.floor(mentor.rating)
                                  ? 'fill-accent-orange-400 text-accent-orange-400'
                                  : 'text-dark-600'
                              }`}
                            />
                          </motion.div>
                        ))}
                        <span className="text-sm text-dark-400 ml-2">{mentor.rating}</span>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2 mb-4 pb-4 border-b border-dark-700 flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-dark-400">Rate</span>
                          <span className="text-accent-orange-400 font-semibold">${mentor.hourly_rate}/hr</span>
                        </div>
                      </div>

                      {/* Availability & Button */}
                      <motion.div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                          mentor.available
                            ? 'bg-success-400/20 text-success-400'
                            : 'bg-warning-400/20 text-warning-400'
                        }`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {mentor.available ? 'Available' : 'Limited'}
                      </motion.div>

                      <motion.button
                        className="btn-primary w-full"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Request Session
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Peer Groups Tab */}
            {activeTab === 'peer-groups' && (
              <motion.div
                key="peer-groups"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                variants={containerVariants}
              >
                <motion.div className="mb-8" variants={itemVariants}>
                  <motion.button
                    onClick={() => setShowNewGroupModal(true)}
                    className="btn-primary flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5" />
                    Create New Group
                  </motion.button>
                </motion.div>

                {/* Peer Groups List */}
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
                  {MOCK_PEER_GROUPS.map((group) => (
                    <motion.div
                      key={group.id}
                      className="card border border-dark-700 p-6 hover:border-accent-blue-500/50 group cursor-pointer transition-all"
                      variants={itemVariants}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-blue-500 to-accent-blue-600 flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-accent-blue-400 transition-colors">
                            {group.name}
                          </h3>
                          <p className="text-sm text-dark-400">{group.description}</p>
                        </div>
                      </div>

                      <motion.button
                        className="btn-secondary w-full mt-6"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Join Group
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPostModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewPostModal(false)}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <motion.div
              className="card border border-dark-700 p-8 max-w-md w-full relative z-10"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gradient-blue">Create New Post</h3>
                <motion.button
                  onClick={() => setShowNewPostModal(false)}
                  className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <X className="w-5 h-5 text-dark-400" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="What's your question or insight?"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-300 mb-2">Content</label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={5}
                    className="input-field w-full resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={() => setShowNewPostModal(false)}
                  className="btn-secondary flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleCreatePost}
                  className="btn-primary flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Post
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Group Modal */}
      <AnimatePresence>
        {showNewGroupModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewGroupModal(false)}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <motion.div
              className="card border border-dark-700 p-8 max-w-md w-full relative z-10"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gradient-blue">Create New Group</h3>
                <motion.button
                  onClick={() => setShowNewGroupModal(false)}
                  className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <X className="w-5 h-5 text-dark-400" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-300 mb-2">Group Name</label>
                  <input type="text" placeholder="Group name..." className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-300 mb-2">Description</label>
                  <textarea
                    placeholder="What's this group about?"
                    rows={4}
                    className="input-field w-full resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={() => setShowNewGroupModal(false)}
                  className="btn-secondary flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="btn-primary flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
