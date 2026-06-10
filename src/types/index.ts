export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';

export type HealthGoal = 'weight_loss' | 'weight_maintenance' | 'weight_gain' | 'muscle_building' | 'lean_bulking' | 'fat_loss';

export type BmiCategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

export type DietaryPreference = 'Veg' | 'Non-Veg';


export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: number; // in cm
  weight: number; // in kg
  activityLevel: ActivityLevel;
  goal: HealthGoal;
  dietaryPreference: DietaryPreference;
  role?: 'user' | 'admin' | 'super_admin';
}

export interface UserGoalCalculations {
  bmi: number;
  bmiCategory: BmiCategory;
  bmr: number;
  tdee: number;
  recommendedCalories: number;
  recommendedProtein: number; // grams
  recommendedCarbs: number;   // grams
  recommendedFat: number;     // grams
}

export interface MealSchedule {
  id: string;
  mealName: string;
  timeStr: string; // e.g. "08:00 AM"
  targetCaloriePercent: number; // e.g. 20 for 20%
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  remainingCalories: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  servingSize: string; // e.g. "2 eggs", "150g"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number; // fiber in grams
  loggedAt: string; // ISO String
  mealScheduleId: string; // links to a meal in the schedule
}

export interface WeightLog {
  id: string;
  weight: number;
  bmi: number;
  loggedAt: string; // ISO String
}

export interface WaterLog {
  id: string;
  amountMl: number;
  loggedAt: string; // ISO String
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon identifier
  unlockedAt: string | null; // ISO String
}

export interface Streak {
  currentLoggingStreak: number;
  maxLoggingStreak: number;
  waterStreak: number;
  mealCompletionStreak: number;
  lastLoggedDate: string | null; // YYYY-MM-DD
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string; // ISO String
}

export interface FoodDatabaseItem {
  id: string;
  name: string;
  category: string; // 'Indian' | 'South Indian' | 'North Indian' | 'International' | 'Packaged' | etc.
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number; // fiber in grams
}
