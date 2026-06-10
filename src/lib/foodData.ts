import { FoodDatabaseItem } from '../types';

export const FOOD_DATABASE: FoodDatabaseItem[] = [
  // --- Indian Main Breads & Rices ---
  { id: 'f-1', name: 'Roti / Chapati', category: 'Indian', servingSize: '1 medium (30g)', calories: 85, protein: 3, carbs: 18, fat: 0.5 },
  { id: 'f-2', name: 'Aloo Paratha', category: 'North Indian', servingSize: '1 large (100g)', calories: 290, protein: 6, carbs: 45, fat: 10 },
  { id: 'f-3', name: 'Paneer Paratha', category: 'North Indian', servingSize: '1 large (100g)', calories: 320, protein: 12, carbs: 40, fat: 12 },
  { id: 'f-4', name: 'Butter Naan', category: 'North Indian', servingSize: '1 piece (80g)', calories: 260, protein: 6.5, carbs: 40, fat: 8.5 },
  { id: 'f-5', name: 'Tandoori Roti', category: 'North Indian', servingSize: '1 piece (40g)', calories: 110, protein: 4, carbs: 22, fat: 0.5 },
  { id: 'f-6', name: 'Bhatura', category: 'North Indian', servingSize: '1 piece (60g)', calories: 220, protein: 4.5, carbs: 30, fat: 9 },
  { id: 'f-7', name: 'Basmati Rice (Cooked)', category: 'Indian', servingSize: '1 cup (150g)', calories: 195, protein: 4.5, carbs: 42, fat: 0.5 },
  { id: 'f-8', name: 'Jeera Rice', category: 'Indian', servingSize: '1 cup (150g)', calories: 210, protein: 4, carbs: 44, fat: 2 },
  
  // --- Indian Curries & Gravies ---
  { id: 'f-9', name: 'Dal Tadka', category: 'Indian', servingSize: '1 bowl (150g)', calories: 150, protein: 7, carbs: 22, fat: 4 },
  { id: 'f-10', name: 'Dal Makhani', category: 'North Indian', servingSize: '1 bowl (150g)', calories: 250, protein: 8.5, carbs: 24, fat: 14 },
  { id: 'f-11', name: 'Paneer Butter Masala', category: 'North Indian', servingSize: '1 cup (200g)', calories: 340, protein: 12, carbs: 14, fat: 26 },
  { id: 'f-12', name: 'Palak Paneer', category: 'North Indian', servingSize: '1 cup (200g)', calories: 250, protein: 11, carbs: 8, fat: 19 },
  { id: 'f-13', name: 'Kadai Paneer', category: 'North Indian', servingSize: '1 cup (200g)', calories: 290, protein: 13, carbs: 10, fat: 22 },
  { id: 'f-14', name: 'Chole (Chickpea Curry)', category: 'North Indian', servingSize: '1 bowl (150g)', calories: 180, protein: 8, carbs: 28, fat: 4.5 },
  { id: 'f-15', name: 'Rajma (Kidney Beans Curry)', category: 'North Indian', servingSize: '1 bowl (150g)', calories: 180, protein: 8, carbs: 29, fat: 4 },
  { id: 'f-16', name: 'Mixed Vegetable Curry', category: 'Indian', servingSize: '1 cup (150g)', calories: 110, protein: 3, carbs: 16, fat: 4.5 },
  { id: 'f-17', name: 'Aloo Gobi', category: 'North Indian', servingSize: '1 cup (150g)', calories: 130, protein: 3, carbs: 18, fat: 5 },
  
  // --- South Indian Specialties ---
  { id: 'f-18', name: 'Masala Dosa', category: 'South Indian', servingSize: '1 piece (150g)', calories: 310, protein: 6, carbs: 52, fat: 9 },
  { id: 'f-19', name: 'Plain Dosa', category: 'South Indian', servingSize: '1 piece (80g)', calories: 180, protein: 4, carbs: 32, fat: 4 },
  { id: 'f-20', name: 'Idli', category: 'South Indian', servingSize: '2 pieces (80g)', calories: 120, protein: 3.5, carbs: 26, fat: 0.5 },
  { id: 'f-21', name: 'Medu Vada', category: 'South Indian', servingSize: '2 pieces (80g)', calories: 195, protein: 4.5, carbs: 20, fat: 11 },
  { id: 'f-22', name: 'Sambar', category: 'South Indian', servingSize: '1 bowl (150g)', calories: 95, protein: 3, carbs: 14, fat: 3 },
  { id: 'f-23', name: 'Coconut Chutney', category: 'South Indian', servingSize: '2 tbsp (30g)', calories: 70, protein: 1, carbs: 3, fat: 6 },
  { id: 'f-24', name: 'Upma', category: 'South Indian', servingSize: '1 cup (150g)', calories: 210, protein: 5, carbs: 36, fat: 5 },
  { id: 'f-25', name: 'Poha', category: 'Indian', servingSize: '1 cup (150g)', calories: 180, protein: 3, carbs: 35, fat: 3 },

  // --- Indian Biryanis & Meat Curries ---
  { id: 'f-26', name: 'Chicken Biryani', category: 'Indian', servingSize: '1 plate (350g)', calories: 520, protein: 26, carbs: 64, fat: 16 },
  { id: 'f-27', name: 'Veg Biryani', category: 'Indian', servingSize: '1 plate (350g)', calories: 390, protein: 8, carbs: 58, fat: 12 },
  { id: 'f-28', name: 'Egg Biryani', category: 'Indian', servingSize: '1 plate (350g)', calories: 440, protein: 16, carbs: 60, fat: 14 },
  { id: 'f-29', name: 'Tandoori Chicken', category: 'Indian', servingSize: '1 piece (120g)', calories: 180, protein: 24, carbs: 3, fat: 8 },
  { id: 'f-30', name: 'Chicken Curry (Indian Style)', category: 'Indian', servingSize: '1 bowl (200g)', calories: 280, protein: 22, carbs: 8, fat: 18 },
  { id: 'f-31', name: 'Fish Curry (Indian style)', category: 'Indian', servingSize: '1 bowl (200g)', calories: 220, protein: 18, carbs: 6, fat: 14 },
  { id: 'f-32', name: 'Paneer Tikka (Grilled)', category: 'Indian', servingSize: '1 plate (6 pieces, 150g)', calories: 280, protein: 16, carbs: 8, fat: 20 },
  { id: 'f-33', name: 'Chicken Tikka (Grilled)', category: 'Indian', servingSize: '1 plate (6 pieces, 150g)', calories: 240, protein: 32, carbs: 4, fat: 10 },

  // --- Indian Proteins & Dairy ---
  { id: 'f-34', name: 'Egg Bhurji (Scrambled Eggs)', category: 'Indian', servingSize: '1 plate (120g)', calories: 190, protein: 13, carbs: 4, fat: 14 },
  { id: 'f-35', name: 'Boiled Egg (Anda)', category: 'Indian', servingSize: '1 large (50g)', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { id: 'f-36', name: 'Egg White (Anda White)', category: 'Indian', servingSize: '1 large (33g)', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1 },
  { id: 'f-37', name: 'Paneer (Cottage Cheese)', category: 'Indian', servingSize: '100g', calories: 265, protein: 18, carbs: 1.2, fat: 20.8 },
  { id: 'f-38', name: 'Dahi / Curd', category: 'Indian', servingSize: '1 cup (150g)', calories: 90, protein: 5, carbs: 7, fat: 4.5 },
  { id: 'f-39', name: 'Toned Milk', category: 'Indian', servingSize: '200ml', calories: 116, protein: 6.4, carbs: 9.6, fat: 6.0 },
  { id: 'f-40', name: 'Ghee (Clarified Butter)', category: 'Indian', servingSize: '1 tsp (5ml)', calories: 45, protein: 0, carbs: 0, fat: 5 },
  { id: 'f-41', name: 'Amul Butter', category: 'Indian', servingSize: '1 pat (5g)', calories: 36, protein: 0, carbs: 0, fat: 4 },
  
  // --- Indian Snacks & Street Foods ---
  { id: 'f-42', name: 'Samosa', category: 'Indian', servingSize: '1 piece (50g)', calories: 150, protein: 2.5, carbs: 18, fat: 7.5 },
  { id: 'f-43', name: 'Dhokla', category: 'Indian', servingSize: '2 pieces (80g)', calories: 120, protein: 4, carbs: 22, fat: 2 },
  { id: 'f-44', name: 'Pav Bhaji', category: 'Indian', servingSize: '1 plate (200g)', calories: 400, protein: 9, carbs: 58, fat: 14 },
  { id: 'f-45', name: 'Roasted Chana', category: 'Indian', servingSize: '1 handful (30g)', calories: 110, protein: 6, carbs: 18, fat: 1.5 },
  { id: 'f-46', name: 'Indian Salad (Cucumber & Tomato)', category: 'Indian', servingSize: '1 plate (150g)', calories: 35, protein: 1.2, carbs: 7.5, fat: 0.2 },

  // --- Indian Drinks & Sweets ---
  { id: 'f-47', name: 'Masala Chai (with milk & sugar)', category: 'Indian', servingSize: '1 cup (150ml)', calories: 90, protein: 2, carbs: 14, fat: 3 },
  { id: 'f-48', name: 'Filter Coffee', category: 'Indian', servingSize: '1 cup (150ml)', calories: 80, protein: 2, carbs: 12, fat: 2.5 },
  { id: 'f-49', name: 'Sweet Lassi', category: 'Indian', servingSize: '1 glass (200ml)', calories: 180, protein: 5, carbs: 28, fat: 5 },
  { id: 'f-50', name: 'Buttermilk / Chaas', category: 'Indian', servingSize: '1 glass (200ml)', calories: 45, protein: 2, carbs: 4, fat: 2.2 },
  { id: 'f-51', name: 'Gulab Jamun', category: 'Indian', servingSize: '1 piece (50g)', calories: 150, protein: 2, carbs: 28, fat: 4 },
  { id: 'f-52', name: 'Kheer / Payasam', category: 'Indian', servingSize: '1 cup (150g)', calories: 220, protein: 5, carbs: 32, fat: 8 },
  
  // --- Fitness Essentials ---
  { id: 'f-53', name: 'Whey Protein', category: 'Packaged', servingSize: '1 scoop (33g)', calories: 120, protein: 25, carbs: 3, fat: 1 },
  { id: 'f-54', name: 'Banana (Fruit)', category: 'Indian', servingSize: '1 medium (120g)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { id: 'f-55', name: 'Peanut Butter', category: 'Packaged', servingSize: '1 tbsp (16g)', calories: 94, protein: 4, carbs: 3, fat: 8 },

  // --- Popular Restaurant & Street Foods (Outside) ---
  { id: 'f-56', name: 'Al Faham Grilled Chicken (Outside)', category: 'Outside', servingSize: 'Quarter piece (200g)', calories: 380, protein: 32, carbs: 2, fat: 27 },
  { id: 'f-57', name: 'Chicken Shawarma Roll (Outside)', category: 'Outside', servingSize: '1 roll (150g)', calories: 390, protein: 22, carbs: 35, fat: 18 },
  { id: 'f-58', name: 'Chicken Tandoori (Restaurant Style)', category: 'Outside', servingSize: '1 double-piece (180g)', calories: 280, protein: 36, carbs: 4, fat: 14 },
  { id: 'f-59', name: 'Butter Chicken (Restaurant Style)', category: 'Outside', servingSize: '1 bowl (200g)', calories: 420, protein: 24, carbs: 12, fat: 32 },
  { id: 'f-60', name: 'Kolkata Chicken Roll (Street)', category: 'Outside', servingSize: '1 roll (180g)', calories: 450, protein: 18, carbs: 48, fat: 20 },
  { id: 'f-61', name: 'Gobi Manchurian (Street Style)', category: 'Outside', servingSize: '1 plate (150g)', calories: 290, protein: 4, carbs: 38, fat: 14 }
];

export function searchFoodItems(query: string): FoodDatabaseItem[] {
  if (!query) return [];
  const cleanQuery = query.toLowerCase().trim();
  return FOOD_DATABASE.filter(item => 
    item.name.toLowerCase().includes(cleanQuery) || 
    item.category.toLowerCase().includes(cleanQuery)
  );
}

export function getFoodDetailsById(id: string): FoodDatabaseItem | undefined {
  return FOOD_DATABASE.find(item => item.id === id);
}
