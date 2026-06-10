// Simple Node script to test store behavior
const { create } = require('zustand');

// Mock of lib/nutritionEngine
const calculateGoals = (profile) => ({
  recommendedCalories: 2000,
  recommendedProtein: 150,
  recommendedCarbs: 200,
  recommendedFat: 60,
  bmi: 22.5,
  bmiCategory: 'Normal',
  bmr: 1500,
  tdee: 2200
});

const generateMealSchedules = () => [];

// Mock Zustand store implementation matching useStore.ts
const useStoreMock = create((set, get) => {
  return {
    profile: null,
    goals: null,
    mealSchedules: [],
    wakeUpTime: '07:00 AM',
    sleepTime: '11:00 PM',
    breakfastTime: '08:00 AM',
    mealsPerDay: 4,
    activeTab: 'onboarding', // initialized as onboarding if no profile
    
    setProfile: (profile) => {
      const goals = calculateGoals(profile);
      const schedules = generateMealSchedules();
      
      set((state) => {
        return {
          profile,
          goals,
          mealSchedules: schedules,
          activeTab: state.activeTab === 'onboarding' ? 'dashboard' : state.activeTab
        };
      });
    },

    updateOnboarding: (updatedFields) => {
      const currentProfile = get().profile;
      if (!currentProfile) return;
      const merged = { ...currentProfile, ...updatedFields };
      get().setProfile(merged);
    },

    setActiveTab: (tab) => set({ activeTab: tab })
  };
});

// Run Simulation
console.log('Initial activeTab:', useStoreMock.getState().activeTab);

// 1. Submit onboarding profile
console.log('\n--- Submitting Onboarding ---');
useStoreMock.getState().setProfile({
  name: 'John',
  age: 25,
  gender: 'male',
  height: 170,
  weight: 70,
  activityLevel: 'moderately_active',
  goal: 'weight_loss',
  dietaryPreference: 'Veg'
});
console.log('Profile is set:', useStoreMock.getState().profile !== null);
console.log('ActiveTab after onboarding:', useStoreMock.getState().activeTab);

// 2. Navigate to Meal Planner ('meals')
console.log('\n--- Navigating to meals tab ---');
useStoreMock.getState().setActiveTab('meals');
console.log('ActiveTab after navigation:', useStoreMock.getState().activeTab);

// 3. Change Dietary Preference
console.log('\n--- Changing Dietary Preference to Non-Veg ---');
useStoreMock.getState().updateOnboarding({ dietaryPreference: 'Non-Veg' });
console.log('Profile dietaryPreference:', useStoreMock.getState().profile.dietaryPreference);
console.log('ActiveTab after changing preference:', useStoreMock.getState().activeTab);
