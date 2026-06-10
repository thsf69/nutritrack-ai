'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Flame, Droplet, Plus, Calendar, TrendingUp, Sparkles, Check, CheckCircle, 
  Trash2, ShieldCheck, Dumbbell, Award, ArrowUpRight
} from 'lucide-react';
import { parseTimeToDecimal, decimalToTimeString } from '../lib/nutritionEngine';

export default function Dashboard() {
  const { 
    profile, goals, mealSchedules, foodEntries, waterLogs, weightLogs, 
    streak, achievements, addWater, addWeight, deleteFoodEntry, setActiveTab 
  } = useStore();

  const [inputWeight, setInputWeight] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep time updated for meal gap countdown
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  if (!profile || !goals) return null;

  // Filter logs for today
  const todayStr = new Date().toDateString();
  const todayEntries = foodEntries.filter(
    entry => new Date(entry.loggedAt).toDateString() === todayStr
  );
  const todayWaterLogs = waterLogs.filter(
    w => new Date(w.loggedAt).toDateString() === todayStr
  );

  // Sum macros
  const consumedCalories = todayEntries.reduce((sum, item) => sum + item.calories, 0);
  const consumedProtein = todayEntries.reduce((sum, item) => sum + item.protein, 0);
  const consumedCarbs = todayEntries.reduce((sum, item) => sum + item.carbs, 0);
  const consumedFat = todayEntries.reduce((sum, item) => sum + item.fat, 0);
  const consumedFiber = todayEntries.reduce((sum, item) => sum + (item.fiber || 0), 0);

  const remainingCalories = Math.max(0, goals.recommendedCalories - consumedCalories);
  
  // Water total
  const totalWater = todayWaterLogs.reduce((sum, w) => sum + w.amountMl, 0);
  const waterPercent = Math.min(100, (totalWater / 2500) * 100);

  // Latest weight
  const currentWeight = weightLogs.length > 0 ? weightLogs[0].weight : profile.weight;
  const currentBmi = weightLogs.length > 0 ? weightLogs[0].bmi : goals.bmi;

  // Dynamic Next Meal Solver
  const getNextMeal = () => {
    if (mealSchedules.length === 0) return null;

    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
    
    // Sort schedules by time decimal
    const sorted = [...mealSchedules].sort((a, b) => 
      parseTimeToDecimal(a.timeStr) - parseTimeToDecimal(b.timeStr)
    );

    let next = sorted.find(meal => parseTimeToDecimal(meal.timeStr) > currentHour);

    if (!next) {
      // If none found, next meal is the first meal of tomorrow
      next = sorted[0];
      const nextHour = parseTimeToDecimal(next.timeStr) + 24; // offset by next day
      const diff = nextHour - currentHour;
      const h = Math.floor(diff);
      const m = Math.round((diff - h) * 60);
      return { meal: next, timeRemaining: `${h}h ${m}m (Tomorrow)` };
    }

    const diff = parseTimeToDecimal(next.timeStr) - currentHour;
    const h = Math.floor(diff);
    const m = Math.round((diff - h) * 60);

    return { 
      meal: next, 
      timeRemaining: h > 0 ? `${h}h ${m}m` : `${m} minutes` 
    };
  };

  const nextMealInfo = getNextMeal();

  // Progress circle configuration
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const caloriePercent = Math.min(100, (consumedCalories / goals.recommendedCalories) * 100);
  const strokeDashoffset = circumference - (caloriePercent / 100) * circumference;

  // Health Score computation
  const getHealthScore = () => {
    let score = 50; // base score
    
    // Calorie control (+15 if close to target)
    const calDiff = Math.abs(consumedCalories - goals.recommendedCalories);
    if (calDiff <= 150) score += 15;
    else if (consumedCalories > goals.recommendedCalories) score -= 10;
    
    // Protein intake (+15 if protein targets are met)
    if (consumedProtein >= goals.recommendedProtein * 0.8) score += 15;
    
    // Water tracking (+10 if water goals are met)
    if (totalWater >= 2000) score += 10;
    
    // Streak bonus (+10)
    if (streak.currentLoggingStreak > 0) score += Math.min(10, streak.currentLoggingStreak * 2);

    return Math.min(100, Math.max(20, score));
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(inputWeight);
    if (wt > 30 && wt < 250) {
      addWeight(wt);
      setInputWeight('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 glass-card rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Welcome back, {profile.name} <Sparkles className="w-5 h-5 text-emerald-400" />
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Track your macros, stay hydrated, and reach your goals today.</p>
        </div>
        
        {/* Streak Indicator */}
        <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 py-2 px-4 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Flame className="w-5 h-5 fill-amber-500 animate-bounce" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Daily Streak</div>
            <div className="text-sm font-bold text-white">{streak.currentLoggingStreak} Days</div>
          </div>
        </div>
      </div>

      {/* Main Stat Ring Grid */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Calorie Ring Widget */}
        <div className="md:col-span-5 glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center relative">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest absolute top-4 left-6">Calorie Target</h3>
          
          <div className="relative my-6 flex items-center justify-center">
            {/* Circular Progress Ring */}
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              {/* Underlay */}
              <circle
                stroke="var(--border)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Overlay */}
              <circle
                stroke="var(--primary)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            
            {/* Center Label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-white">{remainingCalories}</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">kcal left</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full border-t border-zinc-900/80 pt-4 text-left">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Consumed</span>
              <span className="text-lg font-black text-emerald-400">{consumedCalories} kcal</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Daily Budget</span>
              <span className="text-lg font-black text-zinc-300">{goals.recommendedCalories} kcal</span>
            </div>
          </div>
        </div>

        {/* Macro Bars and Dynamic Scheduler */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* Macronutrients Cards */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Macro Splits</h3>
            
            <div className="space-y-3">
              {/* Protein */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-300">Protein</span>
                  <span className="text-zinc-400">
                    <strong className="text-emerald-400">{consumedProtein}g</strong> / {goals.recommendedProtein}g
                  </span>
                </div>
                <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (consumedProtein / goals.recommendedProtein) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-300">Carbs</span>
                  <span className="text-zinc-400">
                    <strong className="text-amber-500">{consumedCarbs}g</strong> / {goals.recommendedCarbs}g
                  </span>
                </div>
                <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (consumedCarbs / goals.recommendedCarbs) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Fats */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-300">Fat</span>
                  <span className="text-zinc-400">
                    <strong className="text-rose-500">{consumedFat}g</strong> / {goals.recommendedFat}g
                  </span>
                </div>
                <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (consumedFat / goals.recommendedFat) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Fiber */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-300">Fiber</span>
                  <span className="text-zinc-400">
                    <strong className="text-teal-400">{consumedFiber.toFixed(1)}g</strong> / 25g
                  </span>
                </div>
                <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (consumedFiber / 25) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Smart Scheduler Countdown Widget */}
          {nextMealInfo && (
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div>
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">Next Scheduled Meal</span>
                <h2 className="text-xl font-black text-white mt-1">{nextMealInfo.meal.mealName}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Scheduled at: {nextMealInfo.meal.timeStr}</p>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Starts In</span>
                <span className="text-lg font-black text-white bg-zinc-900/60 border border-zinc-800 py-1.5 px-3 rounded-lg inline-block mt-1">
                  {nextMealInfo.timeRemaining}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trackers Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Water Tracker Widget */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Hydration Goal</span>
              <h3 className="text-lg font-black text-white mt-0.5 flex items-center gap-1.5">
                <Droplet className="w-5 h-5 text-blue-400 animate-pulse fill-blue-400" /> {totalWater}ml / 2500ml
              </h3>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-semibold text-blue-400">{Math.round(waterPercent)}% Met</span>
            </div>
          </div>

          {/* Water progress bar */}
          <div className="h-3 bg-zinc-900 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500" 
              style={{ width: `${waterPercent}%` }} 
            />
          </div>

          {/* Water Quick Add Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[250, 500, 750].map((ml) => (
              <button
                key={ml}
                onClick={() => addWater(ml)}
                className="bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/50 hover:bg-zinc-900 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" /> +{ml}ml
              </button>
            ))}
          </div>
        </div>

        {/* Weight Tracker Widget */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Weight Management</span>
            <div className="flex items-center justify-between mt-0.5">
              <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> {currentWeight} kg
              </h3>
              <span className="text-xs text-zinc-400">BMI: <strong className="text-white">{currentBmi}</strong></span>
            </div>
          </div>

          {/* Weight submission form */}
          <form onSubmit={handleWeightSubmit} className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="Log current weight (kg)"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 flex-1"
            />
            <button
              type="submit"
              className="bg-emerald-500 text-zinc-950 px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors flex items-center gap-1"
            >
              Log
            </button>
          </form>

          {/* Goals status */}
          <div className="text-xs text-zinc-500 flex items-center gap-1.5 justify-center border-t border-zinc-900/60 pt-4">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Active goal: <strong className="text-zinc-300 capitalize">{profile.goal.replace('_', ' ')}</strong>
          </div>
        </div>
      </div>

      {/* Under Section: Recent Logs & Today's Timeline */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Today's Timeline */}
        <div className="md:col-span-7 glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Today's Meal Timeline</h3>
            <button 
              onClick={() => setActiveTab('meals')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
            >
              Modify Timing <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative border-l border-zinc-800 ml-3 pl-6 space-y-5">
            {mealSchedules.map((meal) => (
              <div key={meal.id} className="relative">
                {/* Bullet */}
                <div className={`absolute left-[-29px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                  meal.consumedCalories >= meal.targetCalories - 50 ? 'bg-emerald-500 border-emerald-500/30' : 
                  meal.consumedCalories > 0 ? 'bg-amber-500 border-amber-500/30' : 
                  'bg-zinc-900 border-zinc-800'
                }`} />
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">{meal.mealName}</h4>
                    <span className="text-xs text-zinc-500">{meal.timeStr}</span>
                  </div>
                  
                  <div className="text-right text-xs">
                    <span className="text-zinc-400 font-medium">{meal.consumedCalories} kcal consumed</span>
                    <span className="block text-[10px] text-zinc-500">Target: {meal.targetCalories} kcal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Food Logs & Badges */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Health Score Widget */}
          <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Daily Health Score</span>
              <h3 className="text-3xl font-black text-white mt-1">{getHealthScore()}%</h3>
              <p className="text-xs text-zinc-500 mt-1">Based on nutrition adherence</p>
            </div>
            
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-8 h-8" />
            </div>
          </div>

          {/* Today's Logged Items */}
          <div className="glass-card p-6 rounded-2xl flex-1 flex flex-col justify-between space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Logged Foods Today</h3>
            
            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
              {todayEntries.length > 0 ? (
                todayEntries.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl">
                    <div>
                      <h4 className="text-xs font-bold text-white">{entry.name}</h4>
                      <p className="text-[10px] text-zinc-500">
                        {entry.servingSize} • P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fat}g{entry.fiber !== undefined && ` • Fb: ${entry.fiber}g`}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-zinc-300">{entry.calories} kcal</span>
                      <button 
                        onClick={() => deleteFoodEntry(entry.id)}
                        className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-zinc-500 font-medium">
                  No food logged today yet.
                </div>
              )}
            </div>

            <button 
              onClick={() => setActiveTab('logger')}
              className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-900/90 py-2.5 rounded-xl text-xs font-bold text-emerald-400 transition-colors text-center"
            >
              Add New Food Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
