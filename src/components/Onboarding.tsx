'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { UserProfile, ActivityLevel, HealthGoal, DietaryPreference } from '../types';
import { calculateGoals } from '../lib/nutritionEngine';
import { ChevronRight, ChevronLeft, User, Ruler, Weight, Activity, Target, Sparkles, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding() {
  const setProfile = useStore((state) => state.setProfile);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    age: 25,
    gender: 'male',
    height: 170,
    weight: 70,
    activityLevel: 'moderately_active',
    goal: 'weight_loss',
    dietaryPreference: 'Veg'
  });

  const [preview, setPreview] = useState<any>(null);

  // Recalculate goals preview in real-time as user changes data
  useEffect(() => {
    if (formData.height > 100 && formData.weight > 30 && formData.age > 10) {
      try {
        const calcs = calculateGoals(formData);
        setPreview(calcs);
      } catch (e) {
        console.error(e);
      }
    }
  }, [formData]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() === '') {
      alert('Please enter your name');
      return;
    }
    setProfile(formData);
  };

  const activityLabels: Record<ActivityLevel, { title: string; desc: string }> = {
    sedentary: { title: 'Sedentary', desc: 'Little or no exercise, desk job' },
    lightly_active: { title: 'Lightly Active', desc: 'Light exercise/sports 1-3 days/week' },
    moderately_active: { title: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
    very_active: { title: 'Very Active', desc: 'Hard exercise/sports 6-7 days/week' },
    extra_active: { title: 'Extra Active', desc: 'Very hard exercise, physical job' }
  };

  const goalLabels: Record<HealthGoal, string> = {
    weight_loss: 'Weight Loss',
    weight_maintenance: 'Weight Maintenance',
    weight_gain: 'Weight Gain',
    muscle_building: 'Muscle Building',
    lean_bulking: 'Lean Bulking',
    fat_loss: 'Fat Loss'
  };

  const dietLabels: DietaryPreference[] = [
    'Veg', 'Non-Veg'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-slate-900 via-zinc-950 to-black relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl grid md:grid-cols-12 gap-6 relative z-10"
      >
        {/* Left Form Panel */}
        <div className="md:col-span-7 glass-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-5 h-5 text-zinc-950" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">NutriTrack <span className="text-emerald-400">AI</span></h1>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center">
                  <div className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${s <= step ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-semibold text-white mb-2">Let's get to know you</h2>
                      <p className="text-zinc-400 text-sm">We'll use these details to calculate your caloric needs accurately.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Name input */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="Enter your name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Age & Gender */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Age</label>
                          <input
                            type="number"
                            min="10"
                            max="100"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 25 })}
                            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Gender</label>
                          <div className="grid grid-cols-2 gap-2 bg-zinc-900/60 p-1 border border-zinc-800 rounded-xl">
                            {(['male', 'female'] as const).map((g) => (
                              <button
                                type="button"
                                key={g}
                                onClick={() => setFormData({ ...formData, gender: g })}
                                className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${formData.gender === g ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'}`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Height & Weight */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Height (cm)</label>
                          <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                              type="number"
                              min="80"
                              max="250"
                              value={formData.height}
                              onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 170 })}
                              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Weight (kg)</label>
                          <div className="relative">
                            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                              type="number"
                              min="30"
                              max="200"
                              value={formData.weight}
                              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 70 })}
                              className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-semibold text-white mb-2">Activity & Goal</h2>
                      <p className="text-zinc-400 text-sm">Select what best matches your current lifestyle and target.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Activity Level */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Activity Level</label>
                        <div className="grid gap-2 max-h-[180px] overflow-y-auto pr-1">
                          {(Object.keys(activityLabels) as ActivityLevel[]).map((lvl) => (
                            <button
                              type="button"
                              key={lvl}
                              onClick={() => setFormData({ ...formData, activityLevel: lvl })}
                              className={`flex items-center gap-3 p-3 text-left border rounded-xl transition-all ${formData.activityLevel === lvl ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-emerald-500/5' : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white'}`}
                            >
                              <Activity className={`w-5 h-5 shrink-0 ${formData.activityLevel === lvl ? 'text-emerald-400' : 'text-zinc-600'}`} />
                              <div>
                                <h4 className="font-semibold text-sm">{activityLabels[lvl].title}</h4>
                                <p className="text-xs text-zinc-500 line-clamp-1">{activityLabels[lvl].desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Health Goal */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Your Goal</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.keys(goalLabels) as HealthGoal[]).map((g) => (
                            <button
                              type="button"
                              key={g}
                              onClick={() => setFormData({ ...formData, goal: g })}
                              className={`p-3 text-center border rounded-xl text-sm font-semibold transition-all ${formData.goal === g ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700'}`}
                            >
                              {goalLabels[g]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-semibold text-white mb-2">Dietary Preferences</h2>
                      <p className="text-zinc-400 text-sm">Select your diet pattern to help personalize recipe generation and meal suggestions.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Select Your Diet</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {dietLabels.map((pref) => (
                            <button
                              type="button"
                              key={pref}
                              onClick={() => setFormData({ ...formData, dietaryPreference: pref })}
                              className={`p-3 text-center border rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 justify-center ${formData.dietaryPreference === pref ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700'}`}
                            >
                              <Utensils className="w-4 h-4 text-emerald-400/80 mb-1" />
                              {pref}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-xl flex items-start gap-3 mt-4">
                        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-300 leading-relaxed">
                          Your profile is fully configured! NutriTrack AI has generated standard schedules with optimized targets. You can modify these meal times and edit macro targets anytime inside the settings page.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-zinc-800/80 mt-8">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white font-semibold text-sm transition-colors py-2 px-3 rounded-lg hover:bg-zinc-900"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-emerald-500 text-zinc-950 py-2.5 px-5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 py-3 px-6 rounded-xl font-black text-sm shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    Get Started <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Calculator Preview Panel */}
        <div className="md:col-span-5 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

          {preview ? (
            <div className="space-y-6 relative z-10">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Calculated Targets</h3>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" /> Real-time Calculation
                </h2>
              </div>

              {/* BMI widget */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs text-zinc-400 font-medium">BMI Score</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-white">{preview.bmi}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      preview.bmiCategory === 'Normal' ? 'bg-emerald-500/10 text-emerald-400' :
                      preview.bmiCategory === 'Underweight' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>{preview.bmiCategory}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-950">
                  <span className="text-xs font-bold text-zinc-400">BMI</span>
                </div>
              </div>

              {/* BMR & TDEE */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">BMR</span>
                  <p className="text-lg font-bold text-white mt-0.5">{preview.bmr} <span className="text-xs font-normal text-zinc-500">kcal</span></p>
                </div>
                <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">TDEE</span>
                  <p className="text-lg font-bold text-white mt-0.5">{preview.tdee} <span className="text-xs font-normal text-zinc-500">kcal</span></p>
                </div>
              </div>

              {/* Recommended Calories */}
              <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 rounded-full bg-emerald-400/5 blur-xl pointer-events-none" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Recommended Calories</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-white">{preview.recommendedCalories}</span>
                  <span className="text-sm text-zinc-400">kcal / day</span>
                </div>
              </div>

              {/* Recommended Macros */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">Macronutrient Budget</span>
                
                {/* Protein */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Protein (30%)</span>
                    <span className="text-emerald-400 font-bold">{preview.recommendedProtein}g</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>

                {/* Carbs */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Carbohydrates (45%)</span>
                    <span className="text-amber-400 font-bold">{preview.recommendedCarbs}g</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                {/* Fats */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Fats (25%)</span>
                    <span className="text-rose-400 font-bold">{preview.recommendedFat}g</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 relative z-10">
              <Sparkles className="w-8 h-8 text-zinc-600 mb-4 animate-pulse" />
              <p className="text-sm text-zinc-400 font-medium">Fill in your name, height, and weight to see your customized caloric target.</p>
            </div>
          )}

          <div className="text-[10px] text-zinc-600 border-t border-zinc-900/80 pt-4 mt-6 text-center">
            NutriTrack AI formulas are based on the MSJ equation & standard nutritional guidelines.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
