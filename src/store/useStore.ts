import { create } from 'zustand';
import { 
  UserProfile, 
  UserGoalCalculations, 
  MealSchedule, 
  FoodEntry, 
  WeightLog, 
  WaterLog, 
  Achievement, 
  Streak, 
  ChatMessage,
  DietaryPreference,
  HealthGoal,
  FoodDatabaseItem
} from '../types';
import { calculateGoals, generateMealSchedules, parseTimeToDecimal, decimalToTimeString } from '../lib/nutritionEngine';
import { askCoachQuestion } from '../lib/aiEngine';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AppState {
  profile: UserProfile | null;
  goals: UserGoalCalculations | null;
  mealSchedules: MealSchedule[];
  foodEntries: FoodEntry[];
  weightLogs: WeightLog[];
  waterLogs: WaterLog[];
  achievements: Achievement[];
  streak: Streak;
  chatMessages: ChatMessage[];
  wakeUpTime: string;
  sleepTime: string;
  breakfastTime: string;
  mealsPerDay: number;
  activeTab: string;
  waterGoal: number; // in ml
  isHydrated: boolean;
  
  // Theme & Auth & Custom Foods
  theme: 'light' | 'dark';
  userSession: { email: string; id: string } | null;
  customFoods: FoodDatabaseItem[];
  aiCredits: number;
  adState: { type: 'interstitial' | 'rewarded' | null; onDismiss?: () => void; onReward?: () => void } | null;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateOnboarding: (profile: Partial<UserProfile>) => void;
  setMealTimingPreferences: (wakeUp: string, sleep: string, breakfast: string, count: number) => void;
  updateMealTime: (id: string, newTimeStr: string) => void;
  addFoodEntry: (mealScheduleId: string, entry: Omit<FoodEntry, 'id' | 'loggedAt' | 'mealScheduleId'>) => void;
  deleteFoodEntry: (id: string) => void;
  addWater: (ml: number) => void;
  addWeight: (weight: number) => void;
  sendChatMessage: (text: string) => Promise<void>;
  setActiveTab: (tab: string) => void;
  resetApp: () => void;
  unlockAchievement: (id: string) => void;
  consumeCredit: () => boolean;
  addCredits: (amount: number) => void;
  triggerAd: (type: 'interstitial' | 'rewarded', onDismiss: () => void, onReward?: () => void) => void;
  closeAd: () => void;
  
  // New actions
  toggleTheme: () => void;
  addCustomFood: (food: Omit<FoodDatabaseItem, 'id'>) => void;
  loginUser: (email: string, isSocial?: boolean) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  setSession: (session: { email: string; id: string } | null) => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', title: 'First Steps', description: 'Complete your onboarding and set your goals.', iconName: 'Flag', unlockedAt: null },
  { id: 'ach-2', title: 'Hydration Hero', description: 'Log water intake for the first time.', iconName: 'Droplet', unlockedAt: null },
  { id: 'ach-3', title: 'Perfect Balance', description: 'Log a food entry to complete a meal target.', iconName: 'CheckCircle', unlockedAt: null },
  { id: 'ach-4', title: 'Dedicated Tracker', description: 'Reach a 3-day food logging streak.', iconName: 'Flame', unlockedAt: null },
  { id: 'ach-5', title: 'Goal Crusher', description: 'Log weight and update your BMI progress.', iconName: 'Target', unlockedAt: null }
];

export const useStore = create<AppState>((set, get) => {
  const safeGetLocalStorage = (key: string, fallback: any) => {
    if (typeof window === 'undefined') return fallback;
    const item = localStorage.getItem(key);
    try {
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const safeSetLocalStorage = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  // Check and update streaks
  const checkStreaks = (currentStreak: Streak): Streak => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = currentStreak.lastLoggedDate;
    
    if (!lastDate) {
      return {
        ...currentStreak,
        currentLoggingStreak: 1,
        maxLoggingStreak: Math.max(1, currentStreak.maxLoggingStreak),
        lastLoggedDate: today
      };
    }

    if (lastDate === today) {
      return currentStreak;
    }

    const prevDate = new Date();
    prevDate.setDate(prevDate.getDate() - 1);
    const yesterday = prevDate.toISOString().split('T')[0];

    if (lastDate === yesterday) {
      const newStreak = currentStreak.currentLoggingStreak + 1;
      return {
        ...currentStreak,
        currentLoggingStreak: newStreak,
        maxLoggingStreak: Math.max(newStreak, currentStreak.maxLoggingStreak),
        lastLoggedDate: today
      };
    }

    // Streak broken
    return {
      ...currentStreak,
      currentLoggingStreak: 1,
      lastLoggedDate: today
    };
  };

  // Sync state to Supabase helper
  const syncToSupabase = async (table: string, data: any) => {
    if (!isSupabaseConfigured || !get().userSession) return;
    try {
      const { id: profile_id } = get().userSession!;
      await supabase.from(table).upsert({
        profile_id,
        ...data
      });
    } catch (err) {
      console.error(`Failed to sync to Supabase table ${table}:`, err);
    }
  };

  return {
    profile: null,
    goals: null,
    mealSchedules: [],
    foodEntries: [],
    weightLogs: [],
    waterLogs: [],
    achievements: INITIAL_ACHIEVEMENTS,
    streak: { currentLoggingStreak: 0, maxLoggingStreak: 0, waterStreak: 0, mealCompletionStreak: 0, lastLoggedDate: null },
    chatMessages: [{ id: 'welcome', sender: 'coach', text: "Hello! I am your AI Nutrition Coach. Ask me anything about diet, weight loss, or high-protein meals!", timestamp: new Date().toISOString() }],
    wakeUpTime: '07:00 AM',
    sleepTime: '11:00 PM',
    breakfastTime: '08:00 AM',
    mealsPerDay: 4,
    activeTab: 'dashboard',
    waterGoal: 2500,
    isHydrated: false,
    
    // Theme & Auth & Custom Foods
    theme: 'dark',
    userSession: null,
    customFoods: [],
    aiCredits: 3,
    adState: null,

    consumeCredit: () => {
      const profile = get().profile;
      const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
      if (isAdmin) return true;

      const current = get().aiCredits;
      if (current <= 0) return false;
      const next = current - 1;
      set({ aiCredits: next });
      if (typeof window !== 'undefined') {
        localStorage.setItem('nt_ai_credits', String(next));
      }
      return true;
    },

    addCredits: (amount: number) => {
      const next = get().aiCredits + amount;
      set({ aiCredits: next });
      if (typeof window !== 'undefined') {
        localStorage.setItem('nt_ai_credits', String(next));
      }
    },

    triggerAd: (type, onDismiss, onReward) => {
      set({ adState: { type, onDismiss, onReward } });
    },

    closeAd: () => {
      const state = get().adState;
      set({ adState: null });
      if (state?.onDismiss) state.onDismiss();
    },

    setSession: (session) => {
      set({ userSession: session });
      safeSetLocalStorage('nt_session', session);
    },

    loginUser: async (email: string, isSocial = false) => {
      const dummySession = { email, id: `usr-${Date.now()}` };
      
      if (isSupabaseConfigured && !isSocial) {
        try {
          // If Supabase is active, handle user signup/login
          const { data, error } = await supabase.auth.signInWithOtp({ email });
          if (error) throw error;
        } catch (err) {
          console.error('Supabase otp authentication error:', err);
        }
      }

      const isSystemAdmin = email.toLowerCase().includes('admin');
      set((state) => {
        let nextGoals = state.goals;
        const nextProfile = state.profile ? {
          ...state.profile,
          role: isSystemAdmin ? 'admin' : (state.profile.role || 'user')
        } as UserProfile : (isSystemAdmin ? {
          name: 'System Admin',
          age: 30,
          gender: 'male',
          height: 175,
          weight: 70,
          activityLevel: 'moderately_active',
          goal: 'weight_maintenance',
          dietaryPreference: 'Veg',
          role: 'admin'
        } as UserProfile : null);

        if (nextProfile) {
          safeSetLocalStorage('nt_profile', nextProfile);
        }

        if (isSystemAdmin && !state.profile && nextProfile) {
          nextGoals = calculateGoals(nextProfile);
          safeSetLocalStorage('nt_goals', nextGoals);
        }

        return {
          userSession: dummySession,
          activeTab: 'dashboard',
          profile: nextProfile,
          goals: nextGoals
        };
      });

      safeSetLocalStorage('nt_session', dummySession);
      return true;
    },

    logoutUser: async () => {
      if (isSupabaseConfigured) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Supabase signout error:', err);
        }
      }
      get().resetApp();
    },

    toggleTheme: () => {
      set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof window !== 'undefined') {
          if (nextTheme === 'light') {
            document.documentElement.classList.add('light-theme');
          } else {
            document.documentElement.classList.remove('light-theme');
          }
        }
        safeSetLocalStorage('nt_theme', nextTheme);
        return { theme: nextTheme };
      });
    },

    addCustomFood: (food) => {
      const newFood: FoodDatabaseItem = {
        ...food,
        id: `custom-food-${Date.now()}`
      };
      set((state) => {
        const updated = [newFood, ...state.customFoods];
        safeSetLocalStorage('nt_custom_foods', updated);
        
        // Push to database if Supabase configured
        syncToSupabase('food_database', {
          name: newFood.name,
          category: newFood.category,
          serving_size: newFood.servingSize,
          calories: newFood.calories,
          protein: newFood.protein,
          carbs: newFood.carbs,
          fat: newFood.fat,
          fiber: newFood.fiber
        });

        return { customFoods: updated };
      });
    },

    setProfile: (profile: UserProfile) => {
      const session = get().userSession;
      const isSystemAdmin = session?.email.toLowerCase().includes('admin');
      const profileWithRole = {
        ...profile,
        role: isSystemAdmin ? 'admin' : (profile.role || 'user')
      } as UserProfile;

      const goals = calculateGoals(profileWithRole);
      const rawSchedules = generateMealSchedules(
        get().wakeUpTime,
        get().sleepTime,
        get().breakfastTime,
        get().mealsPerDay,
        goals.recommendedCalories,
        { protein: goals.recommendedProtein, carbs: goals.recommendedCarbs, fat: goals.recommendedFat }
      );

      const today = new Date().toISOString();
      const weightLog: WeightLog = {
        id: `wt-${Date.now()}`,
        weight: profileWithRole.weight,
        bmi: goals.bmi,
        loggedAt: today
      };

      set((state) => {
        // Map any existing logged foods to the new schedules so we do not lose tracked progress
        const schedules = rawSchedules.map(sched => {
          const loggedForMeal = state.foodEntries.filter(
            entry => entry.mealScheduleId === sched.id
          );
          const calories = loggedForMeal.reduce((sum, f) => sum + f.calories, 0);
          const protein = loggedForMeal.reduce((sum, f) => sum + f.protein, 0);
          const carbs = loggedForMeal.reduce((sum, f) => sum + f.carbs, 0);
          const fat = loggedForMeal.reduce((sum, f) => sum + f.fat, 0);

          return {
            ...sched,
            consumedCalories: calories,
            consumedProtein: protein,
            consumedCarbs: carbs,
            consumedFat: fat,
            remainingCalories: Math.max(0, sched.targetCalories - calories)
          };
        });

        const updatedAchievements = [...state.achievements];
        const achIndex = updatedAchievements.findIndex(a => a.id === 'ach-1');
        if (achIndex !== -1 && !updatedAchievements[achIndex].unlockedAt) {
          updatedAchievements[achIndex] = { ...updatedAchievements[achIndex], unlockedAt: today };
        }

        // Maintain full weight history, updating today's entry if it already exists
        const todayDateStr = today.split('T')[0];
        const existingWeightLogs = state.weightLogs || [];
        const hasTodayWeight = existingWeightLogs.some(
          w => w.loggedAt.split('T')[0] === todayDateStr
        );
        
        let newWeightLogs;
        if (hasTodayWeight) {
          newWeightLogs = existingWeightLogs.map(w => 
            w.loggedAt.split('T')[0] === todayDateStr ? { ...w, weight: profileWithRole.weight, bmi: goals.bmi } : w
          );
        } else {
          newWeightLogs = [weightLog, ...existingWeightLogs];
        }

        safeSetLocalStorage('nt_profile', profileWithRole);
        safeSetLocalStorage('nt_goals', goals);
        safeSetLocalStorage('nt_schedules', schedules);
        safeSetLocalStorage('nt_weight', newWeightLogs);
        safeSetLocalStorage('nt_achievements', updatedAchievements);

        // Sync values to cloud
        syncToSupabase('profiles', {
          name: profileWithRole.name,
          age: profileWithRole.age,
          gender: profileWithRole.gender,
          height: profileWithRole.height,
          weight: profileWithRole.weight,
          activity_level: profileWithRole.activityLevel,
          goal: profileWithRole.goal,
          dietary_preference: profileWithRole.dietaryPreference
        });

        syncToSupabase('user_goals', {
          bmi: goals.bmi,
          bmi_category: goals.bmiCategory,
          bmr: goals.bmr,
          tdee: goals.tdee,
          recommended_calories: goals.recommendedCalories,
          recommended_protein: goals.recommendedProtein,
          recommended_carbs: goals.recommendedCarbs,
          recommended_fat: goals.recommendedFat
        });

        return {
          profile: profileWithRole,
          goals,
          mealSchedules: schedules,
          weightLogs: newWeightLogs,
          achievements: updatedAchievements,
          activeTab: state.activeTab === 'onboarding' ? 'dashboard' : state.activeTab
        };
      });
    },

    updateOnboarding: (updatedFields: Partial<UserProfile>) => {
      const currentProfile = get().profile;
      if (!currentProfile) return;
      const merged = { ...currentProfile, ...updatedFields } as UserProfile;
      get().setProfile(merged);
    },

    setMealTimingPreferences: (wakeUp: string, sleep: string, breakfast: string, count: number) => {
      const goals = get().goals;
      if (!goals) return;

      const schedules = generateMealSchedules(
        wakeUp,
        sleep,
        breakfast,
        count,
        goals.recommendedCalories,
        { protein: goals.recommendedProtein, carbs: goals.recommendedCarbs, fat: goals.recommendedFat }
      );

      const updatedSchedules = schedules.map(sched => {
        const loggedForMeal = get().foodEntries.filter(
          entry => entry.mealScheduleId === sched.id
        );
        const calories = loggedForMeal.reduce((sum, f) => sum + f.calories, 0);
        const protein = loggedForMeal.reduce((sum, f) => sum + f.protein, 0);
        const carbs = loggedForMeal.reduce((sum, f) => sum + f.carbs, 0);
        const fat = loggedForMeal.reduce((sum, f) => sum + f.fat, 0);

        return {
          ...sched,
          consumedCalories: calories,
          consumedProtein: protein,
          consumedCarbs: carbs,
          consumedFat: fat,
          remainingCalories: Math.max(0, sched.targetCalories - calories)
        };
      });

      set({
        wakeUpTime: wakeUp,
        sleepTime: sleep,
        breakfastTime: breakfast,
        mealsPerDay: count,
        mealSchedules: updatedSchedules
      });

      safeSetLocalStorage('nt_wakeup', wakeUp);
      safeSetLocalStorage('nt_sleep', sleep);
      safeSetLocalStorage('nt_breakfast', breakfast);
      safeSetLocalStorage('nt_mealcount', count);
      safeSetLocalStorage('nt_schedules', updatedSchedules);

      // Cloud upsert for schedules
      for (const sched of updatedSchedules) {
        syncToSupabase('meal_schedules', {
          meal_name: sched.mealName,
          time_str: sched.timeStr,
          target_calorie_percent: sched.targetCaloriePercent,
          target_calories: sched.targetCalories,
          target_protein: sched.targetProtein,
          target_carbs: sched.targetCarbs,
          target_fat: sched.targetFat,
          consumed_calories: sched.consumedCalories,
          consumed_protein: sched.consumedProtein,
          consumed_carbs: sched.consumedCarbs,
          consumed_fat: sched.consumedFat,
          remaining_calories: sched.remainingCalories
        });
      }
    },

    updateMealTime: (id: string, newTimeStr: string) => {
      const schedules = [...get().mealSchedules];
      const mealIndex = schedules.findIndex(s => s.id === id);
      if (mealIndex === -1) return;

      schedules[mealIndex].timeStr = newTimeStr;

      const sleepDec = parseTimeToDecimal(get().sleepTime);
      const bedLimitDec = sleepDec - 1.5;

      const currentDec = parseTimeToDecimal(newTimeStr);
      const remainingMeals = schedules.length - 1 - mealIndex;

      if (remainingMeals > 0) {
        const availableTime = bedLimitDec - currentDec;
        const step = availableTime / remainingMeals;
        
        for (let i = mealIndex + 1; i < schedules.length; i++) {
          const shiftDec = currentDec + (i - mealIndex) * step;
          schedules[i].timeStr = decimalToTimeString(shiftDec);
        }
      }

      set({ mealSchedules: schedules });
      safeSetLocalStorage('nt_schedules', schedules);

      for (const sched of schedules) {
        syncToSupabase('meal_schedules', {
          meal_name: sched.mealName,
          time_str: sched.timeStr,
          target_calorie_percent: sched.targetCaloriePercent,
          target_calories: sched.targetCalories,
          target_protein: sched.targetProtein,
          target_carbs: sched.targetCarbs,
          target_fat: sched.targetFat,
          consumed_calories: sched.consumedCalories,
          consumed_protein: sched.consumedProtein,
          consumed_carbs: sched.consumedCarbs,
          consumed_fat: sched.consumedFat,
          remaining_calories: sched.remainingCalories
        });
      }
    },

    addFoodEntry: (mealScheduleId: string, food: Omit<FoodEntry, 'id' | 'loggedAt' | 'mealScheduleId'>) => {
      const today = new Date().toISOString();
      const newEntry: FoodEntry = {
        ...food,
        id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        loggedAt: today,
        mealScheduleId
      };

      const updatedEntries = [newEntry, ...get().foodEntries];
      
      const updatedSchedules = get().mealSchedules.map(sched => {
        if (sched.id === mealScheduleId) {
          const calories = sched.consumedCalories + food.calories;
          const protein = sched.consumedProtein + food.protein;
          const carbs = sched.consumedCarbs + food.carbs;
          const fat = sched.consumedFat + food.fat;
          return {
            ...sched,
            consumedCalories: calories,
            consumedProtein: protein,
            consumedCarbs: carbs,
            consumedFat: fat,
            remainingCalories: Math.max(0, sched.targetCalories - calories)
          };
        }
        return sched;
      });

      const updatedStreak = checkStreaks(get().streak);
      const updatedAchievements = [...get().achievements];
      
      if (updatedStreak.currentLoggingStreak >= 3) {
        const trackerIndex = updatedAchievements.findIndex(a => a.id === 'ach-4');
        if (trackerIndex !== -1 && !updatedAchievements[trackerIndex].unlockedAt) {
          updatedAchievements[trackerIndex] = { ...updatedAchievements[trackerIndex], unlockedAt: today };
        }
      }

      const targetSched = updatedSchedules.find(s => s.id === mealScheduleId);
      if (targetSched && Math.abs(targetSched.consumedCalories - targetSched.targetCalories) <= 50) {
        const balanceIndex = updatedAchievements.findIndex(a => a.id === 'ach-3');
        if (balanceIndex !== -1 && !updatedAchievements[balanceIndex].unlockedAt) {
          updatedAchievements[balanceIndex] = { ...updatedAchievements[balanceIndex], unlockedAt: today };
        }
      }

      set({
        foodEntries: updatedEntries,
        mealSchedules: updatedSchedules,
        streak: updatedStreak,
        achievements: updatedAchievements
      });

      safeSetLocalStorage('nt_entries', updatedEntries);
      safeSetLocalStorage('nt_schedules', updatedSchedules);
      safeSetLocalStorage('nt_streak', updatedStreak);
      safeSetLocalStorage('nt_achievements', updatedAchievements);

      syncToSupabase('food_entries', {
        name: newEntry.name,
        serving_size: newEntry.servingSize,
        calories: newEntry.calories,
        protein: newEntry.protein,
        carbs: newEntry.carbs,
        fat: newEntry.fat,
        fiber: newEntry.fiber,
        logged_at: newEntry.loggedAt
      });
    },

    deleteFoodEntry: (id: string) => {
      const entryToDelete = get().foodEntries.find(e => e.id === id);
      if (!entryToDelete) return;

      const updatedEntries = get().foodEntries.filter(e => e.id !== id);

      const updatedSchedules = get().mealSchedules.map(sched => {
        if (sched.id === entryToDelete.mealScheduleId) {
          const calories = Math.max(0, sched.consumedCalories - entryToDelete.calories);
          const protein = Math.max(0, sched.consumedProtein - entryToDelete.protein);
          const carbs = Math.max(0, sched.consumedCarbs - entryToDelete.carbs);
          const fat = Math.max(0, sched.consumedFat - entryToDelete.fat);
          return {
            ...sched,
            consumedCalories: calories,
            consumedProtein: protein,
            consumedCarbs: carbs,
            consumedFat: fat,
            remainingCalories: Math.max(0, sched.targetCalories - calories)
          };
        }
        return sched;
      });

      set({
        foodEntries: updatedEntries,
        mealSchedules: updatedSchedules
      });

      safeSetLocalStorage('nt_entries', updatedEntries);
      safeSetLocalStorage('nt_schedules', updatedSchedules);

      if (isSupabaseConfigured && get().userSession) {
        // delete from supabase if needed
        supabase.from('food_entries').delete().match({ id }).then();
      }
    },

    addWater: (ml: number) => {
      const today = new Date().toISOString();
      const newWater: WaterLog = {
        id: `wt-${Date.now()}`,
        amountMl: ml,
        loggedAt: today
      };

      const updatedLogs = [newWater, ...get().waterLogs];

      const updatedAchievements = [...get().achievements];
      const hydroIndex = updatedAchievements.findIndex(a => a.id === 'ach-2');
      if (hydroIndex !== -1 && !updatedAchievements[hydroIndex].unlockedAt) {
        updatedAchievements[hydroIndex] = { ...updatedAchievements[hydroIndex], unlockedAt: today };
      }

      set({
        waterLogs: updatedLogs,
        achievements: updatedAchievements
      });

      safeSetLocalStorage('nt_water', updatedLogs);
      safeSetLocalStorage('nt_achievements', updatedAchievements);

      syncToSupabase('water_logs', {
        amount_ml: newWater.amountMl,
        logged_at: newWater.loggedAt
      });
    },

    addWeight: (weight: number) => {
      const profile = get().profile;
      if (!profile) return;

      const today = new Date().toISOString();
      const newProfile = { ...profile, weight };
      const goals = calculateGoals(newProfile);

      const newWeightLog: WeightLog = {
        id: `wt-${Date.now()}`,
        weight,
        bmi: goals.bmi,
        loggedAt: today
      };

      const updatedLogs = [newWeightLog, ...get().weightLogs];

      const updatedAchievements = [...get().achievements];
      const goalIndex = updatedAchievements.findIndex(a => a.id === 'ach-5');
      if (goalIndex !== -1 && !updatedAchievements[goalIndex].unlockedAt) {
        updatedAchievements[goalIndex] = { ...updatedAchievements[goalIndex], unlockedAt: today };
      }

      set({
        profile: newProfile,
        goals,
        weightLogs: updatedLogs,
        achievements: updatedAchievements
      });

      safeSetLocalStorage('nt_profile', newProfile);
      safeSetLocalStorage('nt_goals', goals);
      safeSetLocalStorage('nt_weight', updatedLogs);
      safeSetLocalStorage('nt_achievements', updatedAchievements);

      syncToSupabase('weight_logs', {
        weight,
        bmi: goals.bmi,
        logged_at: newWeightLog.loggedAt
      });
    },

    sendChatMessage: async (text: string) => {
      const hasCredit = get().consumeCredit();
      if (!hasCredit) return;

      const today = new Date().toISOString();
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        sender: 'user',
        text,
        timestamp: today
      };

      set(state => ({
        chatMessages: [...state.chatMessages, userMessage]
      }));

      // Call route AI if configured, otherwise use locally simulated logic
      let coachText = '';
      const isMobile = typeof window !== 'undefined' && (window.location.protocol === 'file:' || (window as any).Capacitor);
      if (!isMobile) {
        try {
          const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'ask-coach',
              messages: get().chatMessages,
              question: text
            })
          });
          const resData = await response.json();
          coachText = resData.answer || '';
        } catch (err) {
          console.error('Failed API coach call, falling back to local simulation:', err);
        }
      }

      if (!coachText) {
        coachText = await askCoachQuestion(get().chatMessages, text);
      }

      const coachMessage: ChatMessage = {
        id: `msg-${Date.now()}-coach`,
        sender: 'coach',
        text: coachText,
        timestamp: new Date().toISOString()
      };

      set(state => {
        const newMessages = [...state.chatMessages, coachMessage];
        safeSetLocalStorage('nt_chat', newMessages);
        return { chatMessages: newMessages };
      });
    },

    setActiveTab: (tab: string) => set({ activeTab: tab }),

    unlockAchievement: (id: string) => {
      const today = new Date().toISOString();
      const updatedAchievements = get().achievements.map(a => 
        a.id === id ? { ...a, unlockedAt: today } : a
      );
      set({ achievements: updatedAchievements });
      safeSetLocalStorage('nt_achievements', updatedAchievements);

      const target = updatedAchievements.find(a => a.id === id);
      if (target) {
        syncToSupabase('achievements', {
          title: target.title,
          description: target.description,
          icon_name: target.iconName,
          unlocked_at: target.unlockedAt
        });
      }
    },

    resetApp: () => {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      set({
        profile: null,
        goals: null,
        mealSchedules: [],
        foodEntries: [],
        weightLogs: [],
        waterLogs: [],
        achievements: INITIAL_ACHIEVEMENTS,
        streak: { currentLoggingStreak: 0, maxLoggingStreak: 0, waterStreak: 0, mealCompletionStreak: 0, lastLoggedDate: null },
        chatMessages: [{ id: 'welcome', sender: 'coach', text: "Hello! I am your AI Nutrition Coach. Ask me anything about diet, weight loss, or high-protein meals!", timestamp: new Date().toISOString() }],
        wakeUpTime: '07:00 AM',
        sleepTime: '11:00 PM',
        breakfastTime: '08:00 AM',
        mealsPerDay: 4,
        activeTab: 'dashboard',
        theme: 'dark',
        userSession: null,
        customFoods: [],
        aiCredits: 3,
        adState: null,
      });
      if (typeof window !== 'undefined') {
        document.documentElement.classList.remove('light-theme');
      }
    }
  };
});

export function hydrateStore() {
  if (typeof window === 'undefined') return;

  const session = localStorage.getItem('nt_session');
  if (!session) {
    useStore.setState({ activeTab: 'dashboard', isHydrated: true });
    return;
  }

  try {
    const parse = (key: string, fb: any) => {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fb;
    };

    const themeSetting = parse('nt_theme', 'dark');
    if (themeSetting === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }

    const sessionData = parse('nt_session', null);
    let profileData = parse('nt_profile', null);
    let goalsData = parse('nt_goals', null);
    const creditsSetting = parse('nt_ai_credits', 3);
    if (sessionData) {
      const isSystemAdmin = sessionData.email.toLowerCase().includes('admin');
      if (isSystemAdmin) {
        profileData = profileData ? {
          ...profileData,
          role: 'admin'
        } : {
          name: 'System Admin',
          age: 30,
          gender: 'male',
          height: 175,
          weight: 70,
          activityLevel: 'moderately_active',
          goal: 'weight_maintenance',
          dietaryPreference: 'Veg',
          role: 'admin'
        };
        if (!goalsData && profileData) {
          goalsData = calculateGoals(profileData);
          localStorage.setItem('nt_goals', JSON.stringify(goalsData));
        }
      } else if (profileData) {
        profileData = {
          ...profileData,
          role: profileData.role || 'user'
        };
      }
    }

    useStore.setState({
      profile: profileData,
      goals: goalsData || parse('nt_goals', null),
      mealSchedules: parse('nt_schedules', []),
      foodEntries: parse('nt_entries', []),
      weightLogs: parse('nt_weight', []),
      waterLogs: parse('nt_water', []),
      achievements: parse('nt_achievements', INITIAL_ACHIEVEMENTS),
      streak: parse('nt_streak', { currentLoggingStreak: 0, maxLoggingStreak: 0, waterStreak: 0, mealCompletionStreak: 0, lastLoggedDate: null }),
      chatMessages: parse('nt_chat', [{ id: 'welcome', sender: 'coach', text: "Hello! I am your AI Nutrition Coach. Ask me anything about diet, weight loss, or high-protein meals!", timestamp: new Date().toISOString() }]),
      wakeUpTime: parse('nt_wakeup', '07:00 AM'),
      sleepTime: parse('nt_sleep', '11:00 PM'),
      breakfastTime: parse('nt_breakfast', '08:00 AM'),
      mealsPerDay: parse('nt_mealcount', 4),
      userSession: sessionData,
      customFoods: parse('nt_custom_foods', []),
      theme: themeSetting,
      activeTab: profileData ? 'dashboard' : 'onboarding',
      aiCredits: creditsSetting,
      isHydrated: true
    });
  } catch (e) {
    console.error('Failed to hydrate store', e);
    useStore.setState({ activeTab: 'dashboard', isHydrated: true });
  }
}
