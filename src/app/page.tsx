'use client';

import React, { useEffect } from 'react';
import { useStore, hydrateStore } from '../store/useStore';
import Auth from '../components/Auth';
import Onboarding from '../components/Onboarding';
import Dashboard from '../components/Dashboard';
import FoodLogger from '../components/FoodLogger';
import MealPlanner from '../components/MealPlanner';
import AICoach from '../components/AICoach';
import Analytics from '../components/Analytics';
import AchievementsView from '../components/AchievementsView';
import MockAdOverlay from '../components/MockAdOverlay';
import { initializeAdMob, showBannerAd } from '../lib/admob';

import { 
  Flame, Sparkles, LayoutDashboard, Utensils, CalendarRange, 
  Bot, BarChart3, Award, Moon, Sun, LogOut 
} from 'lucide-react';

export default function Home() {
  const { 
    isHydrated, userSession, profile, activeTab, theme, streak,
    setActiveTab, toggleTheme, logoutUser 
  } = useStore();

  // Load state from localStorage on initial render
  useEffect(() => {
    hydrateStore();
  }, []);

  // Initialize AdMob when store is hydrated
  useEffect(() => {
    if (isHydrated && userSession) {
      initializeAdMob();
      showBannerAd();
    }
  }, [isHydrated, userSession]);

  // Show premium loading spinner while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 font-medium">Hydrating your nutrition vault...</p>
        </div>
      </div>
    );
  }

  // 1. Auth Gate
  if (!userSession) {
    return <Auth />;
  }

  // 2. Onboarding Gate
  if (!profile) {
    return <Onboarding />;
  }

  // Navigation Config
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'logger', label: 'Food Logger', icon: Utensils },
    { id: 'meals', label: 'Meal Planner', icon: CalendarRange },
    { id: 'coach', label: 'AI Coach', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'achievements', label: 'Badges', icon: Award }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'logger': return <FoodLogger />;
      case 'meals': return <MealPlanner />;
      case 'coach': return <AICoach />;
      case 'analytics': return <Analytics />;
      case 'achievements': return <AchievementsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col md:flex-row relative">
      
      {/* Visual background ambient grids */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Side Navigation - Tablet/Desktop */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-zinc-900 bg-zinc-950/40 backdrop-blur-xl p-6 shrink-0 relative z-10">
        <div className="space-y-8">
          {/* Logo Header */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-4.5 h-4.5 text-zinc-950" />
            </div>
            <h1 className="text-lg font-black tracking-tight text-white">
              NutriTrack <span className="text-emerald-400">AI</span>
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/10' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="border-t border-zinc-900 pt-6 space-y-4">
          {/* Theme toggler & Logout */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-zinc-900/60 border border-zinc-850 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            
            <button
              onClick={logoutUser}
              className="w-10 h-10 rounded-xl bg-zinc-900/60 border border-zinc-850 hover:border-rose-900/30 hover:bg-rose-950/20 flex items-center justify-center text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="text-[10px] text-zinc-650 font-medium text-center">
            NutriTrack AI v1.0.0
          </div>
        </div>
      </aside>

      {/* Main Content Pane Wrapper */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 pb-20 md:pb-0 h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="flex justify-between items-center px-6 py-4 border-b border-zinc-900 bg-zinc-950/20 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {/* Small screen menu triggers activeTab name */}
            <h2 className="text-base font-black text-white capitalize tracking-tight block md:hidden">
              NutriTrack <span className="text-emerald-400">AI</span>
            </h2>
            <h2 className="text-sm font-extrabold text-zinc-400 capitalize tracking-tight hidden md:block">
              {activeTab.replace('_', ' ')}
            </h2>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Mobile quick actions for theme toggling */}
            <button
              onClick={toggleTheme}
              className="md:hidden w-8.5 h-8.5 rounded-lg bg-zinc-900/60 border border-zinc-850 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 py-1 px-3 rounded-lg text-amber-500 text-xs font-black">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{streak.currentLoggingStreak} Day Streak</span>
            </div>

            {/* User display */}
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-zinc-550 block uppercase tracking-wider">Active Profile</span>
              <span className="text-xs font-bold text-white">{profile.name}</span>
            </div>
          </div>
        </header>

        {/* Inner Scrolling active page */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          {renderActiveTab()}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-zinc-900 bg-zinc-950/70 backdrop-blur-xl py-2 px-4 flex justify-between items-center z-50">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                isActive ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mock Ad Banner (Web Browser Demo) */}
      {(() => {
        const isMobileSession = typeof window !== 'undefined' && (window.location.protocol === 'file:' || (window as any).Capacitor);
        if (!isMobileSession) {
          return (
            <div className="fixed bottom-0 inset-x-0 md:left-64 bg-zinc-950/80 border-t border-zinc-900 px-6 py-2.5 flex items-center justify-between text-[11px] text-zinc-400 backdrop-blur-md z-40 pb-22 md:pb-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-zinc-800 text-[8px] text-zinc-500 font-bold px-1.5 py-0.5 rounded border border-zinc-850">AD</span>
                <span>Get 20% off NutriTrack Premium with yearly subscription plans.</span>
              </div>
              <button 
                onClick={() => useStore.setState({ activeTab: 'dashboard' })} 
                className="text-emerald-400 font-black hover:underline cursor-pointer"
              >
                Upgrade Now
              </button>
            </div>
          );
        }
        return null;
      })()}

      {/* Full-Screen Mock Ad Overlay (Web Browser Demo) */}
      <MockAdOverlay />

    </div>
  );
}
