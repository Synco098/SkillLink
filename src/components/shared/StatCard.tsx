import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  trend?: number;
  color: 'orange' | 'blue' | 'green' | 'yellow';
}

export function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate counter on mount
  useEffect(() => {
    const duration = 1000; // 1 second
    const start = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);
      setDisplayValue(Math.floor(value * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animate();
  }, [value]);

  const colorConfig = {
    orange: {
      bg: 'bg-accent-orange-500/10',
      icon: 'text-accent-orange-500',
      text: 'text-accent-orange-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    },
    blue: {
      bg: 'bg-accent-blue-500/10',
      icon: 'text-accent-blue-500',
      text: 'text-accent-blue-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    },
    green: {
      bg: 'bg-success-500/10',
      icon: 'text-success-500',
      text: 'text-success-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    },
    yellow: {
      bg: 'bg-warning-400/10',
      icon: 'text-warning-400',
      text: 'text-warning-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]',
    },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.02 }}
      className={`group relative p-6 rounded-xl bg-dark-800/50 border border-dark-700/50 backdrop-blur-sm transition-all duration-300 ${config.glow}`}
    >
      {/* Background gradient effect */}
      <div
        className={`absolute inset-0 rounded-xl ${config.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
      />

      {/* Icon container */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${config.bg}`}>
          <Icon className={`w-6 h-6 ${config.icon}`} />
        </div>

        {trend !== undefined && trend !== 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
              trend > 0
                ? 'bg-success-500/20 text-success-400'
                : 'bg-error-500/20 text-error-400'
            }`}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </motion.div>
        )}
      </div>

      {/* Label */}
      <p className="text-dark-300 text-sm font-medium mb-2">{label}</p>

      {/* Value */}
      <motion.div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">
          {displayValue.toLocaleString()}
        </span>
      </motion.div>

      {/* Bottom accent line */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 rounded-b-xl ${config.bg}`}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.5, duration: 0.6 }}
      />
    </motion.div>
  );
}
