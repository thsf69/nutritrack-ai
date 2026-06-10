import { UserProfile, UserGoalCalculations, MealSchedule, BmiCategory } from '../types';

// Converts string "HH:MM AM/PM" to decimal hours (e.g., "08:30 AM" -> 8.5)
export function parseTimeToDecimal(timeStr: string): number {
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return 8.0; // fallback to 8:00 AM
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  
  return hours + minutes / 60;
}

// Converts decimal hours back to "HH:MM AM/PM" (e.g., 13.5 -> "01:30 PM")
export function decimalToTimeString(decimalHours: number): string {
  // Bound to 0-24
  let normalizedHours = (decimalHours + 24) % 24;
  
  let hours24 = Math.floor(normalizedHours);
  const minutes = Math.round((normalizedHours - hours24) * 60);
  
  // Adjust for rounding up to 60 minutes
  if (minutes === 60) {
    hours24 = (hours24 + 1) % 24;
  }
  
  const displayMinutes = minutes === 60 ? 0 : minutes;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  
  const hourStr = hours12.toString().padStart(2, '0');
  const minStr = displayMinutes.toString().padStart(2, '0');
  
  return `${hourStr}:${minStr} ${period}`;
}

export function calculateGoals(profile: UserProfile): UserGoalCalculations {
  const { age, gender, height, weight, activityLevel, goal } = profile;

  // 1. BMI Calculation
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  let bmiCategory: BmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Normal';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  // 2. BMR Calculation (Mifflin-St Jeor Equation)
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 3. TDEE Calculation
  let activityMultiplier = 1.2;
  switch (activityLevel) {
    case 'sedentary': activityMultiplier = 1.2; break;
    case 'lightly_active': activityMultiplier = 1.375; break;
    case 'moderately_active': activityMultiplier = 1.55; break;
    case 'very_active': activityMultiplier = 1.725; break;
    case 'extra_active': activityMultiplier = 1.9; break;
  }
  const tdee = bmr * activityMultiplier;

  // 4. Goal-based Calories adjustment
  let recommendedCalories = tdee;
  switch (goal) {
    case 'weight_loss':
      recommendedCalories = tdee - 500;
      break;
    case 'fat_loss':
      recommendedCalories = tdee - 400;
      break;
    case 'weight_gain':
      recommendedCalories = tdee + 500;
      break;
    case 'muscle_building':
    case 'lean_bulking':
      recommendedCalories = tdee + 300;
      break;
    case 'weight_maintenance':
      recommendedCalories = tdee;
      break;
  }
  // Enforce sensible floor
  recommendedCalories = Math.max(1200, Math.round(recommendedCalories));

  // 5. Macronutrient Splits
  // Protein (grams per kg body weight)
  let proteinPerKg = 1.6;
  switch (goal) {
    case 'weight_loss':
    case 'fat_loss':
      proteinPerKg = 2.0;
      break;
    case 'muscle_building':
    case 'lean_bulking':
    case 'weight_gain':
      proteinPerKg = 2.2;
      break;
    case 'weight_maintenance':
      proteinPerKg = 1.6;
      break;
  }
  let recommendedProtein = Math.round(weight * proteinPerKg);
  // Ensure protein doesn't exceed 40% of calories, floor at 10%
  const maxProteinGrams = (recommendedCalories * 0.4) / 4;
  const minProteinGrams = (recommendedCalories * 0.15) / 4;
  recommendedProtein = Math.round(Math.min(maxProteinGrams, Math.max(minProteinGrams, recommendedProtein)));

  // Fat (25% of daily calories)
  const recommendedFat = Math.round((recommendedCalories * 0.25) / 9);

  // Carbs (Remaining calories)
  const proteinKcal = recommendedProtein * 4;
  const fatKcal = recommendedFat * 9;
  const carbKcal = Math.max(0, recommendedCalories - (proteinKcal + fatKcal));
  const recommendedCarbs = Math.round(carbKcal / 4);

  return {
    bmi: parseFloat(bmi.toFixed(1)),
    bmiCategory,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    recommendedCalories,
    recommendedProtein,
    recommendedCarbs,
    recommendedFat,
  };
}

export function generateMealSchedules(
  wakeUp: string,
  sleep: string,
  breakfast: string,
  mealsPerDay: number,
  totalCalories: number,
  macros: { protein: number; carbs: number; fat: number }
): MealSchedule[] {
  const wakeDec = parseTimeToDecimal(wakeUp);
  const sleepDec = parseTimeToDecimal(sleep);
  const breakfastDec = parseTimeToDecimal(breakfast);

  // Adjusted sleep boundary (1.5 hours before sleep time)
  let targetEndDec = sleepDec - 1.5;
  if (targetEndDec < breakfastDec) {
    // If sleep boundary crosses midnight or is less than breakfast, handle wrap around
    targetEndDec += 24;
  }

  const durationHours = targetEndDec - breakfastDec;
  const mealGapHours = mealsPerDay > 1 ? durationHours / (mealsPerDay - 1) : 3.0;

  // Meal Names and Calorie Distributions
  let mealNames: string[] = [];
  let distributions: number[] = [];

  if (mealsPerDay === 3) {
    mealNames = ['Breakfast', 'Lunch', 'Dinner'];
    distributions = [30, 40, 30];
  } else if (mealsPerDay === 4) {
    mealNames = ['Breakfast', 'Lunch', 'Afternoon Snack', 'Dinner'];
    distributions = [25, 35, 15, 25];
  } else if (mealsPerDay === 5) {
    mealNames = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner'];
    distributions = [20, 10, 30, 15, 25];
  } else if (mealsPerDay === 6) {
    mealNames = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Night Snack'];
    distributions = [20, 10, 30, 10, 25, 5];
  } else {
    // Custom counts
    for (let i = 1; i <= mealsPerDay; i++) {
      mealNames.push(`Meal ${i}`);
      distributions.push(Math.round(100 / mealsPerDay));
    }
    // Normalize sum to 100
    const sum = distributions.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      distributions[distributions.length - 1] += (100 - sum);
    }
  }

  const schedules: MealSchedule[] = [];

  for (let i = 0; i < mealsPerDay; i++) {
    const mealDec = breakfastDec + i * mealGapHours;
    const timeStr = decimalToTimeString(mealDec);
    const weightFactor = distributions[i] / 100;

    const targetCalories = Math.round(totalCalories * weightFactor);
    const targetProtein = Math.round(macros.protein * weightFactor);
    const targetCarbs = Math.round(macros.carbs * weightFactor);
    const targetFat = Math.round(macros.fat * weightFactor);

    schedules.push({
      id: `meal-${i}`,
      mealName: mealNames[i] || `Meal ${i + 1}`,
      timeStr,
      targetCaloriePercent: distributions[i],
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      consumedCalories: 0,
      consumedProtein: 0,
      consumedCarbs: 0,
      consumedFat: 0,
      remainingCalories: targetCalories,
    });
  }

  return schedules;
}
