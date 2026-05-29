'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Plus,
  MessageCircle,
  Calendar,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabase';
import type { Session, Message, Topic } from '@/lib/types';

interface ExtendedSession {
  id: string;
  user_id: string;
  topic_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  topic?: { name: string; id?: string; category?: string; difficulty?: string; description?: string; created_at?: string };
  message_count?: number;
}

interface ChatMessage extends Message {
  confidence_update?: number;
}

const SocraticTutor = () => {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<ExtendedSession[]>([]);
  const [activeSession, setActiveSession] = useState<ExtendedSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [mistakeDetected, setMistakeDetected] = useState<{
    detected: boolean;
    hint?: string;
  }>({ detected: false });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const questionCountRef = useRef(0);

  // Fetch sessions
  useEffect(() => {
    if (!user?.id) return;

    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, topic:topics(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSessions(data);
      }
    };

    fetchSessions();
  }, [user?.id]);

  // Fetch topics for selector
  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('name');

      if (!error && data) {
        setTopics(data);
      }
    };

    fetchTopics();
  }, []);

  // Fetch messages for active session
  useEffect(() => {
    if (!activeSession?.id) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', activeSession.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        // Extract confidence from session if available
        if (activeSession.metadata?.confidence) {
          setConfidence(Number(activeSession.metadata.confidence));
        }
      }
    };

    fetchMessages();
  }, [activeSession?.id]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mock Socratic AI response generator
  const generateSocraticResponse = useCallback(
    (studentMessage: string, topicId: string, questionNum: number) => {
      const socraticPatterns: Record<string, Record<number, (msg: string) => string[]>> = {
        default: {
          1: () => [
            'What aspects of this topic are you already familiar with?',
            'Can you describe what you already understand about this concept?',
            'What prior knowledge do you have about this area?',
          ],
          2: () => [
            'That\'s a good start. Can you explain why that\'s the case?',
            'Interesting. What evidence supports that thinking?',
            'I see. Let me ask you this: what would happen if the opposite were true?',
          ],
          3: () => [
            'Good reasoning. Now, how does that connect to what we discussed earlier?',
            'That\'s thoughtful. Can you think of any exceptions to that rule?',
            'Hmm, what about this scenario: [slight variation]? How would your answer change?',
          ],
          4: () => [
            'Excellent synthesis. Can you teach this back to me in your own words?',
            'You\'re getting there! What might be a real-world application of this?',
            'How does this principle extend to other domains you know about?',
          ],
          5: () => [
            'You\'ve built strong understanding. What are the limitations of this concept?',
            'How could someone misapply this principle?',
            'What deeper questions does this raise for you?',
          ],
        },
      };

      // Detect common mistakes
      const hasIncompleteThinking =
        studentMessage.length < 20 || studentMessage.split(' ').length < 5;
      const hasUncertaintyMarkers =
        studentMessage.includes('i think') ||
        studentMessage.includes('maybe') ||
        studentMessage.includes('probably');

      let hint = '';
      let detectedMistake = false;

      if (hasIncompleteThinking && questionNum > 2) {
        hint =
          'Try elaborating more on your thoughts. What specific examples or reasoning led you to that conclusion?';
        detectedMistake = true;
      }

      if (hasUncertaintyMarkers && questionNum > 3) {
        hint =
          'Great intuition! Can you build confidence in your answer by finding evidence or reasoning to back it up?';
        detectedMistake = true;
      }

      const patterns =
        socraticPatterns[topicId] || socraticPatterns['default'];
      const questionOptions = patterns[Math.min(questionNum, 5)] || patterns[5];
      const question = questionOptions(studentMessage)[
        Math.floor(Math.random() * questionOptions(studentMessage).length)
      ];

      return {
        response: question,
        mistakeDetected,
        hint,
        confidenceUpdate: Math.min(
          100,
          confidence + (detectedMistake ? 5 : 8 + Math.random() * 4)
        ),
      };
    },
    [confidence]
  );

  // Create new session
  const handleNewSession = async (topicId: string) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([
          {
            user_id: user.id,
            topic_id: topicId,
            metadata: { confidence: 0 },
          },
        ])
        .select();

      if (sessionError) throw sessionError;

      const newSession = sessionData?.[0] as ExtendedSession;
      setActiveSession(newSession);
      setMessages([]);
      setConfidence(0);
      questionCountRef.current = 0;
      setShowTopicSelector(false);
      setMobileMenuOpen(false);

      // Send initial greeting
      const greetingResponse = `Hello! I'm excited to help you explore this topic. Before we dive in, I'd like to understand your current thinking. What do you already know about this subject? Feel free to share whatever comes to mind, even if you're not entirely sure.`;

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            session_id: newSession.id,
            role: 'assistant',
            content: greetingResponse,
          },
        ])
        .select();

      if (!messageError && messageData) {
        setMessages([messageData[0]]);
        questionCountRef.current = 1;
      }

      // Refresh sessions list
      const { data } = await supabase
        .from('sessions')
        .select('*, topic:topics(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message and get AI response
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeSession?.id || isLoading) return;

    try {
      setIsLoading(true);

      // Save student message
      const { data: studentMsgData, error: studentMsgError } = await supabase
        .from('messages')
        .insert([
          {
            session_id: activeSession.id,
            role: 'user',
            content: messageInput,
          },
        ])
        .select();

      if (studentMsgError) throw studentMsgError;

      const studentMessage = studentMsgData?.[0];
      if (studentMessage) {
        setMessages((prev) => [...prev, studentMessage]);
      }

      setMessageInput('');

      // Generate Socratic response
      questionCountRef.current += 1;
      const {
        response,
        mistakeDetected: mistakeInfo,
        hint,
        confidenceUpdate,
      } = generateSocraticResponse(
        messageInput,
        activeSession.topic_id || '',
        questionCountRef.current
      );

      setMistakeDetected(mistakeInfo ? { detected: true, hint } : { detected: false });
      setConfidence(confidenceUpdate);

      // Simulate typing delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Save AI response
      const { data: aiMsgData, error: aiMsgError } = await supabase
        .from('messages')
        .insert([
          {
            session_id: activeSession.id,
            role: 'assistant',
            content: response,
            metadata: mistakeInfo ? { mistake_hint: hint } : {},
          },
        ])
        .select();

      if (aiMsgError) throw aiMsgError;

      if (aiMsgData?.[0]) {
        setMessages((prev) => [...prev, aiMsgData[0]]);
      }

      // Update session confidence
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          metadata: { confidence: confidenceUpdate },
        })
        .eq('id', activeSession.id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-screen bg-dark-950">
      {/* Left Panel - Sessions */}
      <motion.div
        className={`w-full sm:w-80 bg-dark-900 border-r border-dark-700 flex flex-col transition-all ${
          mobileMenuOpen ? 'block' : 'hidden sm:flex'
        }`}
        layout
      >
        {/* Header */}
        <div className="p-6 border-b border-dark-700">
          <button
            onClick={() => setShowTopicSelector(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-accent-orange-500 to-accent-orange-600 rounded-lg font-medium text-dark-950 hover:shadow-lg hover:shadow-accent-orange-500/50 transition-all btn-primary"
          >
            <Plus size={20} />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <AnimatePresence>
            {sessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-dark-600"
              >
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chats yet</p>
              </motion.div>
            ) : (
              sessions.map((session, index) => (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setActiveSession(session);
                    setMobileMenuOpen(false);
                    questionCountRef.current = (session.message_count || 0) / 2;
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all card ${
                    activeSession?.id === session.id
                      ? 'bg-dark-700 border border-accent-blue-500'
                      : 'hover:bg-dark-800'
                  }`}
                >
                  <div className="font-medium text-sm text-dark-100 truncate">
                    {session.topic?.name || 'Untitled'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-dark-500 mt-1">
                    <Calendar size={12} />
                    {formatDate(session.created_at)}
                  </div>
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer Stats */}
        {profile && (
          <div className="p-4 border-t border-dark-700 space-y-2 text-xs">
            <div className="flex justify-between text-dark-400">
              <span>Skill Coins</span>
              <span className="text-accent-orange-400 font-medium">
                {profile.skill_coins || 0}
              </span>
            </div>
            <div className="flex justify-between text-dark-400">
              <span>Streak</span>
              <span className="text-success-400 font-medium">
                {profile.streak_count || 0}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col bg-dark-950 relative">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden absolute top-4 left-4 p-2 bg-dark-800 rounded-lg text-dark-300 hover:bg-dark-700 z-50"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Topic Selector Modal */}
        <AnimatePresence>
          {showTopicSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
              onClick={() => setShowTopicSelector(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-dark-900 rounded-xl border border-dark-700 p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
              >
                <h2 className="text-xl font-bold mb-4 text-dark-100">
                  Select a Topic
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {topics.map((topic, index) => (
                    <motion.button
                      key={topic.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNewSession(topic.id)}
                      disabled={isLoading}
                      className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg text-left transition-all card-hover border border-dark-700 hover:border-accent-blue-500"
                    >
                      <div className="font-medium text-dark-100">
                        {topic.name}
                      </div>
                      <div className="text-xs text-dark-500 mt-1">
                        {topic.description || 'Explore this topic'}
                      </div>
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={() => setShowTopicSelector(false)}
                  className="w-full mt-4 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg text-dark-300 text-sm transition-all"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Header */}
        {activeSession && (
          <div className="border-b border-dark-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-dark-100">
                  {activeSession.topic?.name || 'Chat Session'}
                </h1>
                <p className="text-sm text-dark-500">
                  Socratic learning experience
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dark-500">Confidence</span>
                  <div className="w-32 h-2 bg-dark-800 rounded-full overflow-hidden border border-dark-700">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent-blue-400 to-accent-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs text-accent-blue-400 font-medium w-8 text-right">
                    {Math.round(confidence)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        {activeSession ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, index) => {
                const isAI = msg.role === 'ai';
                const hasMistake =
                  isAI && !!msg.metadata?.mistake_hint;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md lg:max-w-lg ${
                        isAI ? 'rounded-br-xl' : 'rounded-bl-xl'
                      } rounded-2xl px-4 py-3 glass ${
                        isAI
                          ? 'bg-dark-800 border border-accent-blue-500/30 text-dark-100'
                          : 'bg-gradient-to-br from-accent-orange-600 to-accent-orange-500 text-dark-950 font-medium'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">
                        {msg.content}
                      </p>
                      {hasMistake && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 pt-3 border-t border-accent-orange-400/30 text-xs text-accent-orange-300"
                        >
                          <div className="flex items-start gap-2">
                            <Sparkles
                              size={14}
                              className="mt-0.5 flex-shrink-0"
                            />
                            <span>{String(msg.metadata?.mistake_hint || '')}</span>
                          </div>
                        </motion.div>
                      )}
                      <div className="text-xs mt-2 opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <motion.div
                  key="typing-indicator"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-dark-800 border border-accent-blue-500/30 rounded-br-xl rounded-2xl px-4 py-3 glass">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-accent-blue-400"
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            delay: i * 0.1,
                            repeat: Infinity,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mistake Detected Indicator */}
            <AnimatePresence>
              {mistakeDetected.detected && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-center"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-warning-400/10 border border-warning-400/30 rounded-full text-warning-400 text-xs font-medium glow-orange"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-warning-400 animate-pulse" />
                    Gentle redirect - think more deeply
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles
                size={48}
                className="mx-auto mb-4 text-accent-orange-500/50"
              />
              <h2 className="text-2xl font-bold text-dark-100 mb-2">
                Welcome to Socratic Learning
              </h2>
              <p className="text-dark-500 mb-6 max-w-xs">
                Start a new chat to begin your guided learning journey
              </p>
              <button
                onClick={() => setShowTopicSelector(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-orange-500 to-accent-orange-600 rounded-lg font-medium text-dark-950 hover:shadow-lg hover:shadow-accent-orange-500/50 transition-all btn-primary"
              >
                <Plus size={20} />
                Start New Chat
              </button>
            </motion.div>
          </div>
        )}

        {/* Message Input */}
        {activeSession && (
          <div className="border-t border-dark-700 p-4 sm:p-6 bg-dark-900/50 backdrop-blur-sm">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or share your thoughts..."
                disabled={isLoading}
                rows={1}
                className="flex-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 placeholder-dark-600 focus:outline-none focus:border-accent-blue-500 focus:ring-1 focus:ring-accent-blue-500/50 resize-none max-h-32 input-field"
                style={{
                  lineHeight: '1.5rem',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !messageInput.trim()}
                className="px-4 py-3 bg-gradient-to-r from-accent-orange-500 to-accent-orange-600 rounded-lg text-dark-950 font-medium hover:shadow-lg hover:shadow-accent-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-primary"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocraticTutor;
