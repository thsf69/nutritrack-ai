'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { generateMealPlans, MealPlanDay } from '../lib/aiEngine';
import { DietaryPreference } from '../types';
import { 
  Sparkles, Calendar, Clock, ShoppingCart, BookOpen, Utensils, 
  ChevronRight, Edit3, CheckCircle, RefreshCw
} from 'lucide-react';

export default function MealPlanner() {
  const { 
    profile, goals, mealSchedules, updateMealTime, setMealTimingPreferences,
    wakeUpTime, sleepTime, breakfastTime, mealsPerDay, updateOnboarding
  } = useStore();

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [dietPref, setDietPref] = useState<DietaryPreference>('Veg');
  const [timeSpan, setTimeSpan] = useState<'daily' | 'weekly'>('weekly');
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editTimeStr, setEditTimeStr] = useState('');
  
  // Timing parameters
  const [wakeInput, setWakeInput] = useState(wakeUpTime);
  const [sleepInput, setSleepInput] = useState(sleepTime);
  const [breakfastInput, setBreakfastInput] = useState(breakfastTime);
  const [mealsCountInput, setMealsCountInput] = useState(mealsPerDay);

  const [completedGroceries, setCompletedGroceries] = useState<Record<string, boolean>>({});

  // Sync inputs with store values (crucial when store is hydrated asynchronously from LocalStorage)
  useEffect(() => {
    setWakeInput(wakeUpTime);
    setSleepInput(sleepTime);
    setBreakfastInput(breakfastTime);
    setMealsCountInput(mealsPerDay);
  }, [wakeUpTime, sleepTime, breakfastTime, mealsPerDay]);

  useEffect(() => {
    if (profile && goals) {
      setDietPref(profile.dietaryPreference);
      // Generate default plan
      const plan = generateMealPlans(profile.dietaryPreference, profile.goal, goals.recommendedCalories, mealsPerDay);
      setMealPlan(plan);
    }
  }, [profile, goals, mealsPerDay]);

  if (!profile || !goals) return null;

  const handleGeneratePlan = () => {
    const plan = generateMealPlans(dietPref, profile.goal, goals.recommendedCalories, mealsPerDay);
    setMealPlan(plan);
  };

  const handleSaveTimingPreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setMealTimingPreferences(wakeInput, sleepInput, breakfastInput, mealsCountInput);
  };

  const startEditingMeal = (id: string, currentTime: string) => {
    setEditingMealId(id);
    setEditTimeStr(currentTime);
  };

  const saveMealTime = (id: string) => {
    if (editTimeStr) {
      updateMealTime(id, editTimeStr);
      setEditingMealId(null);
    }
  };

  const toggleGroceryItem = (item: string) => {
    setCompletedGroceries(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const activeDayPlan = mealPlan[activeDayIndex] || null;

  // Generate available times array (15-min intervals)
  const generateTimeOptions = () => {
    const options: string[] = [];
    const periods = ['AM', 'PM'];
    for (let p = 0; p < 2; p++) {
      for (let h = 1; h <= 12; h++) {
        const hourStr = h.toString().padStart(2, '0');
        for (let m = 0; m < 60; m += 15) {
          const minStr = m.toString().padStart(2, '0');
          options.push(`${hourStr}:${minStr} ${periods[p]}`);
        }
      }
    }
    return options;
  };
  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-6">
      {/* Timing Schedule Preferences Settings */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" /> Smart Meal Timing Preferences
        </h2>

        <form onSubmit={handleSaveTimingPreferences} className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Wake Up Time</label>
            <select
              value={wakeInput}
              onChange={(e) => setWakeInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {timeOptions.map(t => <option key={`wake-${t}`} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Breakfast Time</label>
            <select
              value={breakfastInput}
              onChange={(e) => setBreakfastInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {timeOptions.map(t => <option key={`break-${t}`} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Bed Time</label>
            <select
              value={sleepInput}
              onChange={(e) => setSleepInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {timeOptions.map(t => <option key={`sleep-${t}`} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Meals per Day</label>
            <select
              value={mealsCountInput}
              onChange={(e) => setMealsCountInput(parseInt(e.target.value, 10))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value={3}>3 Meals</option>
              <option value={4}>4 Meals</option>
              <option value={5}>5 Meals</option>
              <option value={6}>6 Meals</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-800 py-2.5 rounded-xl text-xs font-bold text-emerald-400 transition-colors flex items-center justify-center gap-1.5"
          >
            Apply Schedule
          </button>
        </form>
      </div>

      {/* AI Planner Section */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left planner views */}
        <div className="md:col-span-8 space-y-6">
          {/* Controls Panel */}
          <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-400" /> AI Meal Planner
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Generated specifically for a {goals.recommendedCalories} kcal target.</p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={dietPref}
                onChange={(e) => {
                  const val = e.target.value as DietaryPreference;
                  setDietPref(val);
                  updateOnboarding({ dietaryPreference: val });
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
              </select>
              
              <button
                onClick={handleGeneratePlan}
                className="bg-emerald-500 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-Plan
              </button>
            </div>
          </div>

          {/* Calendar Week Tabs */}
          {mealPlan.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {mealPlan.map((p, index) => (
                <button
                  key={p.day}
                  onClick={() => setActiveDayIndex(index)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeDayIndex === index 
                      ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/15' 
                      : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {p.day}
                </button>
              ))}
            </div>
          )}

          {/* Active Day Meal Cards */}
          {activeDayPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Planned Meals for {activeDayPlan.day}</h3>
                <span className="text-xs font-semibold text-zinc-300">Total: {activeDayPlan.totalCalories} kcal</span>
              </div>

              <div className="grid gap-4">
                {activeDayPlan.meals.map((meal, index) => {
                  // Link calendar plan meals to schedule timings
                  const activeSchedule = mealSchedules[index];
                  const uniqueKey = activeSchedule?.id || `${meal.name}-${index}`;

                  return (
                    <div key={uniqueKey} className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {meal.name}
                          </span>
                          
                          {/* Timing Adjustment trigger */}
                          {activeSchedule && (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              {editingMealId === activeSchedule.id ? (
                                <div className="flex items-center gap-1">
                                  <select
                                    value={editTimeStr}
                                    onChange={(e) => setEditTimeStr(e.target.value)}
                                    className="bg-zinc-950 border border-zinc-800 text-white text-[11px] rounded px-1.5 py-0.5 focus:outline-none"
                                  >
                                    {timeOptions.map(t => <option key={`edit-${t}`} value={t}>{t}</option>)}
                                  </select>
                                  <button 
                                    onClick={() => saveMealTime(activeSchedule.id)}
                                    className="bg-emerald-500 text-zinc-950 px-2 py-0.5 rounded text-[10px] font-bold"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => startEditingMeal(activeSchedule.id, activeSchedule.timeStr)}
                                  className="hover:text-emerald-400 flex items-center gap-0.5 font-medium transition-colors"
                                >
                                  {activeSchedule.timeStr} <Edit3 className="w-3 h-3 text-zinc-600" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          {meal.items.map((item, idx) => (
                            <p key={idx} className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full" /> {item}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="text-left sm:text-right border-t sm:border-t-0 border-zinc-900/60 pt-3 sm:pt-0 shrink-0">
                        <span className="text-lg font-black text-white">{meal.calories} kcal</span>
                        <div className="flex gap-2 text-[10px] text-zinc-400 font-semibold mt-1">
                          <span>P: {meal.macros.p}g</span>
                          <span>C: {meal.macros.c}g</span>
                          <span>F: {meal.macros.f}g</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center p-12 glass-card rounded-2xl">
              <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-4" />
              <p className="text-sm text-zinc-400 font-bold">Generate plan to see meal schedules.</p>
            </div>
          )}
        </div>

        {/* Right side drawers: Recipes & Grocery Checklist */}
        <div className="md:col-span-4 space-y-6">
          {activeDayPlan && (
            <>
              {/* Recipe card */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> Featured Recipe
                </h3>
                
                <div>
                  <h4 className="text-base font-bold text-white">{activeDayPlan.recipe.title}</h4>
                  <span className="text-[10px] text-zinc-400 font-medium">Quick cook recipe recommendation</span>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <h5 className="text-xs font-bold text-zinc-400 mb-1">Ingredients</h5>
                    <ul className="list-inside list-disc text-xs text-zinc-300 space-y-1">
                      {activeDayPlan.recipe.ingredients.map((ing: string, i: number) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-zinc-400 mb-1">Instructions</h5>
                    <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-2 leading-relaxed">
                      {activeDayPlan.recipe.steps.map((step: string, i: number) => (
                        <li key={i} className="pl-1 text-zinc-300">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* Grocery checklist card */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" /> Grocery List Checklist
                </h3>

                <div className="space-y-2">
                  {activeDayPlan.groceryList.map((item: string, idx: number) => {
                    const completed = !!completedGroceries[item];
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleGroceryItem(item)}
                        className="w-full flex items-center gap-3 p-3 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-xl text-left transition-colors"
                      >
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          completed ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'border-zinc-800 bg-zinc-950'
                        }`}>
                          {completed && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <span className={`text-xs font-bold transition-all ${
                          completed ? 'text-zinc-500 line-through' : 'text-zinc-200'
                        }`}>
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
