-- Database Schema for NutriTrack AI

-- Create Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
  height NUMERIC NOT NULL, -- in cm
  weight NUMERIC NOT NULL, -- in kg
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')) NOT NULL,
  goal TEXT NOT NULL,
  dietary_preference TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create User Goals Table
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  bmi NUMERIC NOT NULL,
  bmi_category TEXT NOT NULL,
  bmr NUMERIC NOT NULL,
  tdee NUMERIC NOT NULL,
  recommended_calories NUMERIC NOT NULL,
  recommended_protein NUMERIC NOT NULL,
  recommended_carbs NUMERIC NOT NULL,
  recommended_fat NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Meal Schedules Table
CREATE TABLE IF NOT EXISTS public.meal_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  meal_name TEXT NOT NULL,
  time_str TEXT NOT NULL,
  target_calorie_percent NUMERIC NOT NULL,
  target_calories NUMERIC NOT NULL,
  target_protein NUMERIC NOT NULL,
  target_carbs NUMERIC NOT NULL,
  target_fat NUMERIC NOT NULL,
  consumed_calories NUMERIC DEFAULT 0 NOT NULL,
  consumed_protein NUMERIC DEFAULT 0 NOT NULL,
  consumed_carbs NUMERIC DEFAULT 0 NOT NULL,
  consumed_fat NUMERIC DEFAULT 0 NOT NULL,
  remaining_calories NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Food Entries Table
CREATE TABLE IF NOT EXISTS public.food_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  meal_schedule_id UUID REFERENCES public.meal_schedules(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Weight Logs Table
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC NOT NULL,
  bmi NUMERIC NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Water Logs Table
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create Food Database Table
CREATE TABLE IF NOT EXISTS public.food_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for Profiles
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Setup RLS Policies for User Goals
CREATE POLICY "Users can read own goals" ON public.user_goals
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can modify own goals" ON public.user_goals
  FOR ALL USING (auth.uid() = profile_id);

-- Setup RLS Policies for Meal Schedules
CREATE POLICY "Users can read own schedules" ON public.meal_schedules
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can modify own schedules" ON public.meal_schedules
  FOR ALL USING (auth.uid() = profile_id);

-- Setup RLS Policies for Food Entries
CREATE POLICY "Users can read own food entries" ON public.food_entries
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can modify own food entries" ON public.food_entries
  FOR ALL USING (auth.uid() = profile_id);

-- Setup RLS Policies for Weight Logs
CREATE POLICY "Users can read own weight logs" ON public.weight_logs
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can modify own weight logs" ON public.weight_logs
  FOR ALL USING (auth.uid() = profile_id);

-- Setup RLS Policies for Water Logs
CREATE POLICY "Users can read own water logs" ON public.water_logs
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can modify own water logs" ON public.water_logs
  FOR ALL USING (auth.uid() = profile_id);

-- Setup RLS Policies for Achievements
CREATE POLICY "Users can read own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = profile_id);

-- Setup RLS Policies for Food Database (Public read-only)
CREATE POLICY "Everyone can read food database" ON public.food_database
  FOR SELECT TO authenticated USING (true);
