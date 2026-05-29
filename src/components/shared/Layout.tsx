import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  MessageCircle,
  Zap,
  Swords,
  Users,
  TrendingUp,
  LogOut,
  Flame,
  Coins,
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard', id: 'dashboard' },
    {
      label: 'Socratic Tutor',
      icon: MessageCircle,
      href: '/tutor',
      id: 'tutor',
    },
    { label: 'Heatmap', icon: Zap, href: '/heatmap', id: 'heatmap' },
    { label: 'Battle', icon: Swords, href: '/battle', id: 'battle' },
    { label: 'Community', icon: Users, href: '/community', id: 'community' },
    { label: 'Insights', icon: TrendingUp, href: '/insights', id: 'insights' },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-32 bg-dark-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="hidden md:flex flex-col w-64 bg-dark-900 border-r border-dark-700/50 relative z-20"
          >
            {/* Logo */}
            <div className="p-6 border-b border-dark-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-orange-500 to-accent-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SA</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">SkillLink</h1>
                  <p className="text-xs text-dark-400">AI Education</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link key={item.id} to={item.href}>
                    <motion.button
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group ${
                        active
                          ? 'bg-accent-orange-500/20 text-accent-orange-400'
                          : 'text-dark-300 hover:bg-dark-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>

                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute right-0 w-1 h-6 bg-accent-orange-500 rounded-l-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}

                      {!active && (
                        <div className="absolute inset-0 rounded-lg bg-accent-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                      )}
                    </motion.button>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile Section */}
            {profile && (
              <div className="p-4 border-t border-dark-700/50">
                <div className="mb-4 p-3 bg-dark-800/50 rounded-lg">
                  <div className="text-xs text-dark-400 mb-2">Skill Coins</div>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-accent-orange-500" />
                    <span className="text-lg font-bold text-white">
                      {profile.skill_coins || 0}
                    </span>
                  </div>
                </div>

                {profile.streak_count > 0 && (
                  <div className="mb-4 p-3 bg-dark-800/50 rounded-lg flex items-center gap-2">
                    <Flame className="w-4 h-4 text-warning-400" />
                    <div>
                      <div className="text-xs text-dark-400">Streak</div>
                      <div className="text-lg font-bold text-white">
                        {profile.streak_count} days
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4 p-3 bg-dark-800/50 rounded-lg">
                  <div className="text-xs text-dark-400 mb-1">Role</div>
                  <div className="inline-block px-2 py-1 rounded bg-accent-blue-500/20 text-accent-blue-400 text-xs font-medium capitalize">
                    {profile.role}
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-error-500/10 text-error-400 hover:bg-error-500/20 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <motion.div
          className="bg-dark-900 border-b border-dark-700/50 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-dark-300" />
              ) : (
                <Menu className="w-5 h-5 text-dark-300" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-dark-300" />
              ) : (
                <Menu className="w-5 h-5 text-dark-300" />
              )}
            </button>

            <h1 className="text-lg font-bold text-white hidden md:block">
              Welcome back{profile ? `, ${profile.full_name?.split(' ')[0]}` : ''}!
            </h1>
          </div>

          {/* Profile Info */}
          <div className="flex items-center gap-4">
            {profile && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-dark-800/50 rounded-lg">
                  <Coins className="w-4 h-4 text-accent-orange-500" />
                  <span className="text-sm font-medium text-white">
                    {profile.skill_coins || 0}
                  </span>
                </div>

                {profile.streak_count > 0 && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-dark-800/50 rounded-lg">
                    <Flame className="w-4 h-4 text-warning-400" />
                    <span className="text-sm font-medium text-white">
                      {profile.streak_count}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-dark-900 border-b border-dark-700/50"
            >
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          active
                            ? 'bg-accent-orange-500/20 text-accent-orange-400'
                            : 'text-dark-300 hover:bg-dark-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden bg-dark-900 border-t border-dark-700/50 flex items-center justify-around">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.id}
                to={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                  active ? 'text-accent-orange-500' : 'text-dark-400'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
