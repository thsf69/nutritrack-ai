'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

export default function AchievementsView() {
  const { achievements, streak } = useStore();

  const getIcon = (name: string, isUnlocked: boolean) => {
    // Dynamic mapping of icon components
    const IconComponent = (Icons as any)[name] || Icons.Award;
    return <IconComponent className={`w-8 h-8 ${isUnlocked ? 'text-zinc-950 stroke-[2.5px]' : 'text-zinc-650'}`} />;
  };

  const unlockedCount = achievements.filter(a => a.unlockedAt !== null).length;

  return (
    <div className="space-y-6">
      {/* Overview stats header */}
      <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Icons.Award className="w-5 h-5 text-amber-500" /> Trophies & Achievements
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Unlock badges by tracking meals, water, weights and hitting streaks.</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Unlocked</span>
            <span className="text-2xl font-black text-white">{unlockedCount} / {achievements.length}</span>
          </div>

          <div className="w-px h-8 bg-zinc-850" />

          <div className="text-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Max Streak</span>
            <span className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
              <Icons.Flame className="w-5 h-5 fill-amber-500" /> {streak.maxLoggingStreak} Days
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => {
          const isUnlocked = ach.unlockedAt !== null;

          return (
            <motion.div
              key={ach.id}
              whileHover={isUnlocked ? { scale: 1.02 } : {}}
              className={`glass-card p-5 rounded-2xl flex gap-4 items-start relative overflow-hidden transition-all ${
                isUnlocked 
                  ? 'border-amber-500/30 shadow-md shadow-amber-500/5 bg-gradient-to-br from-amber-500/5 to-zinc-950' 
                  : 'opacity-70 grayscale'
              }`}
            >
              {/* Badge Icon container */}
              <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center relative ${
                isUnlocked 
                  ? 'bg-gradient-to-tr from-amber-500 to-amber-300 shadow-lg shadow-amber-500/20' 
                  : 'bg-zinc-900 border border-zinc-800'
              }`}>
                {/* Visual glow ring for unlocked */}
                {isUnlocked && (
                  <span className="absolute inset-0 rounded-2xl border border-white/30 animate-pulse" />
                )}
                {getIcon(ach.iconName, isUnlocked)}
              </div>

              {/* Text metadata */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white leading-tight">{ach.title}</h4>
                  {isUnlocked && (
                    <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                      Unlocked
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{ach.description}</p>
                
                {isUnlocked && ach.unlockedAt && (
                  <span className="block text-[9px] text-zinc-550 pt-1">
                    Earned on: {new Date(ach.unlockedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
