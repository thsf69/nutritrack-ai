import { FoodEntry, ChatMessage, HealthGoal, DietaryPreference, FoodDatabaseItem } from '../types';
import { FOOD_DATABASE } from './foodData';

// Helper to extract numeric quantity and unit/name from text (e.g., "2 eggs" -> [2, "eggs"], "150g chicken" -> [150, "g chicken"])
export function parseQuantityAndName(line: string): { quantity: number; name: string; unit: string } {
  const cleanLine = line.trim().toLowerCase();
  
  // Regex 1: Matches "150g chicken", "200ml milk", "60g bread"
  const quantityUnitRegex = /^(\d+(?:\.\d+)?)\s*(g|ml|scoop|scoops|cup|cups|slice|slices|piece|pieces|bowl|bowls|tbsp|tsp)\s+(.+)$/i;
  let match = cleanLine.match(quantityUnitRegex);
  if (match) {
    return {
      quantity: parseFloat(match[1]),
      unit: match[2],
      name: match[3].trim()
    };
  }

  // Regex 2: Matches "2 eggs", "1 banana"
  const simpleQuantityRegex = /^(\d+(?:\.\d+)?)\s+(.+)$/i;
  match = cleanLine.match(simpleQuantityRegex);
  if (match) {
    return {
      quantity: parseFloat(match[1]),
      unit: 'pieces',
      name: match[2].trim()
    };
  }

  // Regex 3: Matches "bread 60g", "rice 200g", "milk 100ml" (quantity at the end!)
  const trailingQuantityRegex = /^(.+?)\s+(\d+(?:\.\d+)?)\s*(g|ml|scoop|scoops|cup|cups|slice|slices|piece|pieces|bowl|bowls|tbsp|tsp)$/i;
  match = cleanLine.match(trailingQuantityRegex);
  if (match) {
    return {
      quantity: parseFloat(match[2]),
      unit: match[3],
      name: match[1].trim()
    };
  }

  // Fallback: Default to 1 piece
  return {
    quantity: 1,
    unit: 'pieces',
    name: cleanLine
  };
}

export const INGREDIENT_MACROS: Record<string, { calories: number; protein: number; carbs: number; fat: number; fiber: number; unitType: 'g' | 'ml' | 'piece'; defaultServing: number }> = {
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, unitType: 'g', defaultServing: 150 },
  'roti': { calories: 260, protein: 9, carbs: 55, fat: 1.5, fiber: 7.0, unitType: 'g', defaultServing: 30 },
  'chapati': { calories: 260, protein: 9, carbs: 55, fat: 1.5, fiber: 7.0, unitType: 'g', defaultServing: 30 },
  'bread': { calories: 250, protein: 8, carbs: 49, fat: 3, fiber: 4.0, unitType: 'g', defaultServing: 30 },
  'egg': { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0, unitType: 'g', defaultServing: 50 },
  'egg white': { calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0, unitType: 'g', defaultServing: 33 },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, unitType: 'g', defaultServing: 100 },
  'chicken': { calories: 200, protein: 25, carbs: 0, fat: 11, fiber: 0, unitType: 'g', defaultServing: 150 },
  'dal': { calories: 100, protein: 6, carbs: 17, fat: 2, fiber: 4.5, unitType: 'g', defaultServing: 150 },
  'paneer': { calories: 265, protein: 18, carbs: 1.2, fat: 20.8, fiber: 0, unitType: 'g', defaultServing: 100 },
  'milk': { calories: 58, protein: 3.2, carbs: 4.8, fat: 3.0, fiber: 0, unitType: 'ml', defaultServing: 200 },
  'curd': { calories: 60, protein: 3.3, carbs: 4.7, fat: 3.0, fiber: 0, unitType: 'g', defaultServing: 150 },
  'dahi': { calories: 60, protein: 3.3, carbs: 4.7, fat: 3.0, fiber: 0, unitType: 'g', defaultServing: 150 },
  'banana': { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, unitType: 'piece', defaultServing: 1 },
  'apple': { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, unitType: 'piece', defaultServing: 1 },
  'peanut butter': { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6.0, unitType: 'g', defaultServing: 16 },
  'oats': { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6, unitType: 'g', defaultServing: 40 },
  'whey': { calories: 364, protein: 75, carbs: 9, fat: 3, fiber: 0, unitType: 'g', defaultServing: 33 },
  'protein': { calories: 364, protein: 75, carbs: 9, fat: 3, fiber: 0, unitType: 'g', defaultServing: 33 },
  'fish': { calories: 110, protein: 20, carbs: 0, fat: 3, fiber: 0, unitType: 'g', defaultServing: 150 },
  'mutton': { calories: 290, protein: 25, carbs: 0, fat: 21, fiber: 0, unitType: 'g', defaultServing: 150 },
  'oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, unitType: 'g', defaultServing: 5 },
  'ghee': { calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0, unitType: 'g', defaultServing: 5 },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, unitType: 'g', defaultServing: 5 },
  'samosa': { calories: 300, protein: 5, carbs: 36, fat: 15, fiber: 2.0, unitType: 'piece', defaultServing: 1 },
  'idli': { calories: 60, protein: 1.5, carbs: 13, fat: 0.25, fiber: 0.8, unitType: 'piece', defaultServing: 1 },
  'dosa': { calories: 180, protein: 4, carbs: 32, fat: 4, fiber: 1.2, unitType: 'piece', defaultServing: 1 },
  'vada': { calories: 97, protein: 2.2, carbs: 10, fat: 5.5, fiber: 1.0, unitType: 'piece', defaultServing: 1 },
  'dhokla': { calories: 60, protein: 2, carbs: 11, fat: 1, fiber: 0.8, unitType: 'piece', defaultServing: 1 },
  'shawarma': { calories: 260, protein: 15, carbs: 23, fat: 12, fiber: 1.5, unitType: 'g', defaultServing: 150 },
  'faham': { calories: 190, protein: 16, carbs: 1, fat: 13.5, fiber: 0, unitType: 'g', defaultServing: 200 },
  'alfaham': { calories: 190, protein: 16, carbs: 1, fat: 13.5, fiber: 0, unitType: 'g', defaultServing: 200 }
};

export interface EstimatedNutrients {
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function estimateNutrientsOffline(foodName: string, quantity: number, unit: string): EstimatedNutrients {
  const cleanName = foodName.toLowerCase().trim();
  
  // Find matching ingredient key
  let matchKey = '';
  for (const key of Object.keys(INGREDIENT_MACROS)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      matchKey = key;
      break;
    }
  }

  const macros = matchKey ? INGREDIENT_MACROS[matchKey] : {
    calories: 150,
    protein: 4,
    carbs: 20,
    fat: 5,
    fiber: 1.5,
    unitType: (unit === 'ml' ? 'ml' : (unit === 'pieces' || unit === 'piece' ? 'piece' : 'g')) as 'g' | 'ml' | 'piece',
    defaultServing: 100
  };

  let factor = 1;
  let displayUnit = unit;

  if (macros.unitType === 'g') {
    if (unit === 'g') {
      factor = quantity / 100;
    } else if (unit === 'kg') {
      factor = (quantity * 1000) / 100;
      displayUnit = 'g';
      quantity = quantity * 1000;
    } else {
      factor = quantity * (macros.defaultServing / 100);
    }
  } else if (macros.unitType === 'ml') {
    if (unit === 'ml') {
      factor = quantity / 100;
    } else if (unit === 'l') {
      factor = (quantity * 1000) / 100;
      displayUnit = 'ml';
      quantity = quantity * 1000;
    } else {
      factor = quantity * (macros.defaultServing / 100);
    }
  } else {
    // piece-based
    if (unit === 'pieces' || unit === 'piece' || unit === 'serving' || unit === 'portion') {
      factor = quantity;
    } else {
      factor = quantity / (macros.defaultServing || 1);
    }
  }

  const capitalizedName = foodName.charAt(0).toUpperCase() + foodName.slice(1);

  return {
    name: capitalizedName,
    servingSize: `${quantity}${displayUnit}`,
    calories: Math.round(macros.calories * factor),
    protein: parseFloat((macros.protein * factor).toFixed(1)),
    carbs: parseFloat((macros.carbs * factor).toFixed(1)),
    fat: parseFloat((macros.fat * factor).toFixed(1)),
    fiber: parseFloat((macros.fiber * factor).toFixed(1))
  };
}

// offline parser for text entries using database matching & smart rules
export function parseFoodNaturalTextOffline(text: string): FoodEntry[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const entries: FoodEntry[] = [];

  for (const line of lines) {
    const { quantity, unit, name } = parseQuantityAndName(line);
    const est = estimateNutrientsOffline(name, quantity, unit);

    entries.push({
      id: `food-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: est.name,
      servingSize: est.servingSize,
      calories: est.calories,
      protein: est.protein,
      carbs: est.carbs,
      fat: est.fat,
      fiber: est.fiber,
      loggedAt: new Date().toISOString(),
      mealScheduleId: ''
    });
  }

  return entries;
}

// AI Meal Completion Engine
export function recommendMealCompletion(
  remainingCalories: number,
  goal: HealthGoal,
  preference: DietaryPreference
): FoodDatabaseItem[] {
  if (remainingCalories <= 10) return [];

  // Filter food database based on Veg / Non-Veg preference
  let filtered = FOOD_DATABASE.filter(food => {
    const name = food.name.toLowerCase();

    // Veg filters: no chicken, fish, egg, tikka (except Paneer Tikka), bhurji (unless Paneer Tikka)
    if (preference === 'Veg') {
      if (
        (name.includes('chicken') ||
        name.includes('fish') ||
        name.includes('egg') ||
        name.includes('tikka') ||
        name.includes('anda') ||
        name.includes('bhurji')) && !name.includes('paneer')
      ) {
        return false;
      }
    }

    return true;
  });

  // Goal filters
  if (goal === 'weight_loss' || goal === 'fat_loss') {
    filtered = filtered.filter(food => food.calories < 200);
  } else if (goal === 'muscle_building' || goal === 'lean_bulking' || goal === 'weight_gain') {
    filtered = filtered.filter(food => food.protein >= 3 || food.calories >= 100);
  }

  // Sort based on how close calories are to remaining
  const matches = filtered.filter(food => food.calories <= remainingCalories + 50);

  // Return top 4 choices
  return matches.sort((a, b) => {
    if (goal === 'muscle_building') {
      return (b.protein / b.calories) - (a.protein / a.calories);
    }
    return Math.abs(a.calories - remainingCalories) - Math.abs(b.calories - remainingCalories);
  }).slice(0, 4);
}

// AI Meal Planner (generates meal plans, recipes, grocery lists)
export interface MealPlanDay {
  day: string;
  meals: {
    name: string;
    items: string[];
    calories: number;
    macros: { p: number; c: number; f: number };
  }[];
  totalCalories: number;
  macros: { p: number; c: number; f: number };
  recipe: { title: string; ingredients: string[]; steps: string[] };
  groceryList: string[];
}

export function generateMealPlans(
  preference: DietaryPreference,
  goal: HealthGoal,
  calories: number,
  mealsCount: number = 4
): MealPlanDay[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Sample templates depending on preferences (100% Indian Calories)
  const templates: Record<string, { breakfast: string[]; snack1: string[]; lunch: string[]; snack2: string[]; dinner: string[]; recipe: any; groceries: string[] }> = {
    'Veg': {
      breakfast: ['2 Idli with Sambar', '2 tbsp Coconut Chutney'],
      snack1: ['1 Handful Roasted Chana', '1 Glass Buttermilk / Chaas'],
      lunch: ['1 Cup Basmati Rice', '1 Bowl Dal Tadka', '100g Paneer Tikka (Grilled)'],
      snack2: ['1 Cup Masala Chai', '2 pieces Dhokla'],
      dinner: ['2 Chapati / Roti', '1 Bowl Mixed Vegetable Curry', '1 Cup Dahi / Curd'],
      recipe: {
        title: 'High Protein Paneer & Dal Rice Bowl',
        ingredients: ['100g Paneer cubes', '1 cup Basmati rice', '1/2 cup Toor dal', '1 Onion', '1 Tomato', 'Spices (Turmeric, Cumin, Garam Masala)'],
        steps: [
          'Wash and cook rice and dal separately.',
          'Sauté chopped onion and tomato in a teaspoon of ghee with cumin and spices.',
          'Add cooked dal to the pan and let it simmer for 5 minutes.',
          'Grill paneer cubes on a non-stick pan with a pinch of turmeric and salt.',
          'Assemble the bowl: rice at the bottom, dal poured over, topped with grilled paneer.'
        ]
      },
      groceries: ['Paneer (500g)', 'Basmati Rice (1kg)', 'Toor Dal (1kg)', 'Tomatoes', 'Onions', 'Roasted Chana', 'Dahi']
    },
    'Non-Veg': {
      breakfast: ['Egg Bhurji (Scrambled Eggs)', '2 Roti / Chapati'],
      snack1: ['2 Boiled Eggs (Anda)', '1 Glass Buttermilk / Chaas'],
      lunch: ['1 Plate Chicken Biryani', '1 Cup Salad / Cucumber'],
      snack2: ['1 Scoop Whey Protein', '1 Handful Roasted Chana'],
      dinner: ['Tandoori Chicken (1 piece)', '2 Chapati', '1 Bowl Dal Tadka'],
      recipe: {
        title: 'Tandoori Grilled Chicken & Roti Dinner',
        ingredients: ['120g Chicken breast piece', '2 wheat rotis', 'Lemon juice', 'Ginger-garlic paste', 'Yogurt & Indian Tandoori Masala'],
        steps: [
          'Marinate chicken piece with yogurt, lemon juice, ginger-garlic paste, and tandoori masala.',
          'Let it sit for 30 minutes in the refrigerator.',
          'Grill on a non-stick pan or oven until fully cooked and slightly charred.',
          'Serve hot with warm wheat rotis and fresh onion rings.'
        ]
      },
      groceries: ['Chicken Breast (1kg)', 'Eggs (1 dozen)', 'Wheat flour (2kg)', 'Yogurt (500g)', 'Tandoori Masala', 'Basmati Rice (1kg)']
    }
  };

  const template = templates[preference] || templates['Veg'];

  // Resolve meal names and distributions matching nutritionEngine.ts
  let mealNames: string[] = [];
  let distributions: number[] = [];

  if (mealsCount === 3) {
    mealNames = ['Breakfast', 'Lunch', 'Dinner'];
    distributions = [30, 40, 30];
  } else if (mealsCount === 4) {
    mealNames = ['Breakfast', 'Lunch', 'Afternoon Snack', 'Dinner'];
    distributions = [25, 35, 15, 25];
  } else if (mealsCount === 5) {
    mealNames = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner'];
    distributions = [20, 10, 30, 15, 25];
  } else if (mealsCount === 6) {
    mealNames = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Night Snack'];
    distributions = [20, 10, 30, 10, 25, 5];
  } else {
    for (let i = 1; i <= mealsCount; i++) {
      mealNames.push(`Meal ${i}`);
      distributions.push(Math.round(100 / mealsCount));
    }
    const sum = distributions.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      distributions[distributions.length - 1] += (100 - sum);
    }
  }

  const getMealItems = (name: string, index: number): string[] => {
    switch (name) {
      case 'Breakfast': return template.breakfast;
      case 'Morning Snack': return template.snack1;
      case 'Lunch': return template.lunch;
      case 'Afternoon Snack': return template.snack2;
      case 'Dinner': return template.dinner;
      case 'Night Snack': return ['1 Glass Haldi Doodh (Warm Turmeric Milk)', '4 Soaked Almonds'];
      default: {
        const fallbackItems = [
          template.breakfast,
          template.snack1,
          template.lunch,
          template.snack2,
          template.dinner
        ];
        return fallbackItems[index % fallbackItems.length];
      }
    }
  };

  const targetP = Math.round(calories * 0.3 / 4); // 30% Protein
  const targetC = Math.round(calories * 0.45 / 4); // 45% Carbs
  const targetF = Math.round(calories * 0.25 / 9); // 25% Fat

  return days.map((day, index) => {
    // Add minor variation per day
    const cVar = Math.round(calories + (index % 3 - 1) * 60);
    const pVar = Math.round(targetP + (index % 3 - 1) * 8);
    const fVar = Math.round(targetF + (index % 2 - 1) * 4);
    const carbVar = Math.round((cVar - (pVar * 4) - (fVar * 9)) / 4);

    const generatedMeals = mealNames.map((name, idx) => {
      const weightFactor = distributions[idx] / 100;
      return {
        name,
        items: getMealItems(name, idx),
        calories: Math.round(cVar * weightFactor),
        macros: {
          p: Math.round(pVar * weightFactor),
          c: Math.round(carbVar * weightFactor),
          f: Math.round(fVar * weightFactor)
        }
      };
    });

    return {
      day,
      meals: generatedMeals,
      totalCalories: cVar,
      macros: { p: pVar, c: carbVar, f: fVar },
      recipe: template.recipe,
      groceryList: template.groceries
    };
  });
}

// AI Nutrition Coach conversational support
export async function askCoachQuestion(
  chatHistory: ChatMessage[],
  question: string
): Promise<string> {
  const q = question.toLowerCase();

  // Simulated AI response rules matching common Indian nutrition queries
  if (q.includes('increase protein') || q.includes('more protein')) {
    return "To increase your protein intake with Indian meals, incorporate these options:\n\n1. **Vegetarian Sources:** Paneer (cottage cheese - 18g protein per 100g), Sattu (roasted chickpea flour), Tofu, Greek Yogurt / hung curd, and Tempeh.\n2. **Dal & Legumes:** Rajma, Chole (chickpeas), and double-boiled lentils (Dal) are good but must be paired with rice/roti for a complete amino acid profile.\n3. **Non-Vegetarian Sources:** Boiled egg whites, Tandoori chicken (breast piece), and grilled fish curries.\n4. **Supplements:** 1 scoop of Whey protein mixed in water adds 25g of high-quality protein easily.\n\nTry adding Paneer, Eggs, or Dal to *every* meal to hit your daily requirement!";
  }
  
  if (q.includes('after gym') || q.includes('post workout') || q.includes('after workout')) {
    return "Post-workout nutrition in an Indian diet should combine **fast-digesting protein** and **carb replenishment**:\n\n* **Option 1 (Fitness Snack):** 1 scoop Whey Protein in water + 1 medium banana (220 kcal, 25g protein, 30g carbs).\n* **Option 2 (Whole Food Non-Veg):** 3 Boiled Egg Whites + 2 slices of whole wheat bread.\n* **Option 3 (Whole Food Veg):** 100g Grilled Paneer Tikka + 1 cup Cooked Basmati Rice.\n\nAim to consume this within 45 to 90 minutes after your workout!";
  }

  if (q.includes('200 calorie snack') || q.includes('200 calories')) {
    return "Here are a few quick Indian snack ideas around **200 calories**:\n\n1. **Roasted Chana:** 50g of roasted chickpeas (180 kcal, 10g protein, high fiber).\n2. **Dahi & Cucumber:** 150g curd mixed with cucumber, onions, and dry jeera powder (90 kcal).\n3. **Boiled Anda:** 2 whole hard-boiled eggs with black pepper (156 kcal, 13g protein).\n4. **Dhokla:** 2 pieces of steamed khaman dhokla (120 kcal, 4g protein).";
  }

  if (q.includes('weight loss') || q.includes('lose weight')) {
    return "To lose weight sustainably on an Indian diet, focus on a consistent **calorie deficit** (consuming 300-500 kcal less than your TDEE). Other key strategies:\n\n* Swap simple carbs (white rice, maida) with complex carbs (roti, brown rice, millets).\n* Control portion sizes of high-calorie fats (use ghee/oil sparingly, max 2-3 tsp daily).\n* Prioritize protein (Paneer, Dal, Sattu, Eggs) to protect muscle mass.\n* Stay hydrated—drink 3L+ of water daily.\n* Track your daily calories accurately (every teaspoon of oil counts!).";
  }

  if (q.includes('diabetic') || q.includes('sugar') || q.includes('diabetes')) {
    return "For a diabetic-friendly Indian nutrition profile, focus on **low glycemic index (GI)** foods that prevent blood sugar spikes:\n\n* Replace white rice with millets (Ragi, Jowar, Bajra) or whole wheat rotis.\n* Always pair carbs with fiber (Indian salad, cucumber) and protein (Dal, Paneer, Tofu) to slow down glucose absorption.\n* Limit sweets (Gulab Jamun, Kheer) and deep-fried snacks (Samosas, Bhaturas).\n* Avoid sweetened milk teas or packaged juices.";
  }

  // General default coach response
  return "That is a great nutrition question! To give you the best advice, make sure your profile (age, weight, height, goal) is up to date. Keep logging your daily meals and water intake. Is there a specific recipe or food swap you would like me to analyze?";
}

// Food Photo OCR Recognition Engine Mockup
export async function analyzeFoodPhoto(
  imageSrc: string
): Promise<{ 
  detectedFoods: { name: string; serving: string; calories: number; protein: number; carbs: number; fat: number; fiber: number }[];
  summary: { calories: number; protein: number; carbs: number; fat: number; fiber: number }
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const name = imageSrc.toLowerCase();

  // Pure Indian food detections
  let detectedFoods = [
    { name: 'Roti / Chapati', serving: '2 pieces (60g)', calories: 170, protein: 6, carbs: 36, fat: 1, fiber: 4.2 },
    { name: 'Dal Tadka', serving: '1 bowl (150g)', calories: 150, protein: 7, carbs: 22, fat: 4, fiber: 6.8 },
    { name: 'Mixed Vegetable Curry', serving: '1 cup (150g)', calories: 110, protein: 3, carbs: 16, fat: 4.5, fiber: 3.5 }
  ];

  if (name.includes('egg') || name.includes('breakfast')) {
    detectedFoods = [
      { name: 'Egg Bhurji (Scrambled Eggs)', serving: '1 plate (120g)', calories: 190, protein: 13, carbs: 4, fat: 14, fiber: 0 },
      { name: 'Roti / Chapati', serving: '2 pieces (60g)', calories: 170, protein: 6, carbs: 36, fat: 1, fiber: 4.2 },
      { name: 'Buttermilk / Chaas', serving: '1 glass (200ml)', calories: 45, protein: 2, carbs: 4, fat: 2.2, fiber: 0 }
    ];
  } else if (name.includes('chicken') || name.includes('gym') || name.includes('protein')) {
    detectedFoods = [
      { name: 'Tandoori Chicken', serving: '1 piece (120g)', calories: 180, protein: 24, carbs: 3, fat: 8, fiber: 0 },
      { name: 'Basmati Rice (Cooked)', serving: '1 cup (150g)', calories: 195, protein: 4.5, carbs: 42, fat: 0.5, fiber: 0.6 },
      { name: 'Indian Salad (Cucumber & Tomato)', serving: '1 plate (150g)', calories: 35, protein: 1.2, carbs: 7.5, fat: 0.2, fiber: 1.8 }
    ];
  } else if (name.includes('dosa') || name.includes('south')) {
    detectedFoods = [
      { name: 'Masala Dosa', serving: '1 piece (150g)', calories: 310, protein: 6, carbs: 52, fat: 9, fiber: 2.1 },
      { name: 'Sambar', serving: '1 bowl (150g)', calories: 95, protein: 3, carbs: 14, fat: 3, fiber: 3.0 },
      { name: 'Coconut Chutney', serving: '2 tbsp (30g)', calories: 70, protein: 1, carbs: 3, fat: 6, fiber: 1.2 }
    ];
  }

  const summary = detectedFoods.reduce((acc, food) => {
    acc.calories += food.calories;
    acc.protein += food.protein;
    acc.carbs += food.carbs;
    acc.fat += food.fat;
    acc.fiber += food.fiber || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  // Round decimals
  summary.calories = Math.round(summary.calories);
  summary.protein = parseFloat(summary.protein.toFixed(1));
  summary.carbs = parseFloat(summary.carbs.toFixed(1));
  summary.fat = parseFloat(summary.fat.toFixed(1));
  summary.fiber = parseFloat(summary.fiber.toFixed(1));

  return {
    detectedFoods,
    summary
  };
}
