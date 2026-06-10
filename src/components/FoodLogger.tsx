'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { estimateNutrientsOffline } from '../lib/aiEngine';
import { 
  Plus, PlusCircle, Check, Sparkles, Mic, Camera, Trash2, 
  RefreshCw, Utensils, Zap, HelpCircle, Save, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showInterstitialAd } from '../lib/admob';

interface DraftFoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'pieces' | 'grams' | 'ml' | 'cups' | 'tablespoons' | 'teaspoons';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  isCalculated: boolean;
  isFromPhoto?: boolean;
}

// Converts user units (cups, tablespoons, teaspoons) to g or ml for offline database scaling
function getConvertedUnitAndQty(name: string, quantity: number, unit: string) {
  const cleanName = name.toLowerCase().trim();
  let convertedQty = quantity;
  let convertedUnit = unit;

  if (unit === 'cups') {
    const isLiquid = cleanName.includes('milk') || cleanName.includes('curd') || cleanName.includes('dahi') || cleanName.includes('water') || cleanName.includes('tea') || cleanName.includes('coffee') || cleanName.includes('juice') || cleanName.includes('shake') || cleanName.includes('lassi') || cleanName.includes('chaas');
    if (isLiquid) {
      convertedQty = quantity * 200; // 200ml per cup
      convertedUnit = 'ml';
    } else {
      convertedQty = quantity * 150; // 150g per cup
      convertedUnit = 'g';
    }
  } else if (unit === 'tablespoons') {
    const isLiquid = cleanName.includes('oil') || cleanName.includes('ghee') || cleanName.includes('butter') || cleanName.includes('water') || cleanName.includes('honey');
    if (isLiquid) {
      convertedQty = quantity * 15; // 15ml
      convertedUnit = 'ml';
    } else {
      convertedQty = quantity * 15; // 15g
      convertedUnit = 'g';
    }
  } else if (unit === 'teaspoons') {
    const isLiquid = cleanName.includes('oil') || cleanName.includes('ghee') || cleanName.includes('butter') || cleanName.includes('water');
    if (isLiquid) {
      convertedQty = quantity * 5; // 5ml
      convertedUnit = 'ml';
    } else {
      convertedQty = quantity * 5; // 5g
      convertedUnit = 'g';
    }
  } else if (unit === 'grams') {
    convertedUnit = 'g';
  }

  return { quantity: convertedQty, unit: convertedUnit };
}

export default function FoodLogger() {
  const { 
    mealSchedules, addFoodEntry, profile, goals 
  } = useStore();

  const [selectedMealName, setSelectedMealName] = useState('Breakfast');
  const [draftFoods, setDraftFoods] = useState<DraftFoodItem[]>([]);
  
  // Input fields
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<'pieces' | 'grams' | 'ml' | 'cups' | 'tablespoons' | 'teaspoons'>('pieces');

  // Page Action states
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Simulated Voice / Photo States
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [photoActive, setPhotoActive] = useState(false);
  const [photoStatus, setPhotoStatus] = useState('');

  // Auto-select initial meal name
  useEffect(() => {
    if (mealSchedules.length > 0) {
      const activeNames = mealSchedules.map(m => m.mealName);
      if (activeNames.includes('Breakfast')) {
        setSelectedMealName('Breakfast');
      } else {
        setSelectedMealName(mealSchedules[0].mealName);
      }
    }
  }, [mealSchedules]);

  if (!profile || !goals || mealSchedules.length === 0) return null;

  // Meal mapping to active schedules or custom percentage fallback
  const getMealMapping = (mealName: string) => {
    let schedule = mealSchedules.find(s => s.mealName.toLowerCase() === mealName.toLowerCase());
    
    // Map Evening Snack alias to Afternoon Snack
    if (!schedule && mealName === 'Evening Snack') {
      schedule = mealSchedules.find(s => s.mealName.toLowerCase() === 'afternoon snack');
    }

    if (schedule) {
      return {
        id: schedule.id,
        mealName: schedule.mealName,
        targetCalories: schedule.targetCalories,
        consumedCalories: schedule.consumedCalories,
        remainingCalories: schedule.remainingCalories,
        timeStr: schedule.timeStr
      };
    }

    // Default fallbacks for meals missing from active schedule
    const dailyCals = goals.recommendedCalories;
    let percent = 15;
    if (mealName === 'Breakfast') percent = 25;
    else if (mealName === 'Lunch') percent = 35;
    else if (mealName === 'Dinner') percent = 25;
    else if (mealName === 'Night Snack') percent = 5;
    else if (mealName === 'Morning Snack') percent = 10;
    else if (mealName === 'Evening Snack') percent = 15;

    const targetCalories = Math.round(dailyCals * (percent / 100));
    return {
      id: mealSchedules[0].id, // fallback ID
      mealName: mealName,
      targetCalories,
      consumedCalories: 0,
      remainingCalories: targetCalories,
      timeStr: 'Flexible'
    };
  };

  const activeMealInfo = getMealMapping(selectedMealName);

  // Add food to draft list
  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !quantity) return;

    const newItem: DraftFoodItem = {
      id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
      quantity: parseFloat(quantity) || 1,
      unit: unit,
      isCalculated: false
    };

    setDraftFoods([...draftFoods, newItem]);
    setFoodName('');
    setQuantity('1');
    setUnit('pieces');
    setIsCalculated(false); // require recalculation
  };

  // Run AI Calculations
  const handleCalculate = () => {
    if (draftFoods.length === 0) return;
    setIsCalculating(true);

    setTimeout(() => {
      const updated = draftFoods.map(item => {
        const norm = getConvertedUnitAndQty(item.name, item.quantity, item.unit);
        const est = estimateNutrientsOffline(item.name, norm.quantity, norm.unit);
        return {
          ...item,
          calories: est.calories,
          protein: est.protein,
          carbs: est.carbs,
          fat: est.fat,
          fiber: est.fiber,
          isCalculated: true
        };
      });

      setDraftFoods(updated);
      setIsCalculating(false);
      setIsCalculated(true);
    }, 1000);
  };

  // Remove food from draft
  const handleRemoveDraft = (id: string) => {
    setDraftFoods(draftFoods.filter(f => f.id !== id));
    setIsCalculated(false); // require recalculation
  };

  // Commit draft foods to store
  const handleSaveMeal = () => {
    if (draftFoods.length === 0 || !isCalculated) return;

    showInterstitialAd(() => {
      for (const item of draftFoods) {
        addFoodEntry(activeMealInfo.id, {
          name: item.name,
          servingSize: `${item.quantity} ${item.unit}`,
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          fiber: item.fiber || 0
        });
      }

      setDraftFoods([]);
      setIsCalculated(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    });
  };

  // Voice recognition simulation
  const handleVoiceEntry = () => {
    setVoiceActive(true);
    setVoiceStatus('Listening to your voice...');
    
    setTimeout(() => {
      setVoiceStatus('Processing: "I ate 2 eggs and 2 bread slices"...');
    }, 1500);

    setTimeout(() => {
      const parsedItems: DraftFoodItem[] = [
        {
          id: `draft-voice-1-${Date.now()}`,
          name: 'Egg',
          quantity: 2,
          unit: 'pieces',
          isCalculated: false
        },
        {
          id: `draft-voice-2-${Date.now()}`,
          name: 'Bread',
          quantity: 2,
          unit: 'pieces',
          isCalculated: false
        }
      ];

      setDraftFoods([...draftFoods, ...parsedItems]);
      setVoiceActive(false);
      
      // Auto trigger calculation
      setIsCalculating(true);
      setTimeout(() => {
        const updated = [...draftFoods, ...parsedItems].map(item => {
          const norm = getConvertedUnitAndQty(item.name, item.quantity, item.unit);
          const est = estimateNutrientsOffline(item.name, norm.quantity, norm.unit);
          return {
            ...item,
            calories: est.calories,
            protein: est.protein,
            carbs: est.carbs,
            fat: est.fat,
            fiber: est.fiber,
            isCalculated: true
          };
        });
        setDraftFoods(updated);
        setIsCalculating(false);
        setIsCalculated(true);
      }, 1000);

    }, 3000);
  };

  // Photo scanning simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoActive(true);
    setPhotoStatus('Scanning plate image with AI...');

    setTimeout(() => {
      setPhotoStatus('Detecting foods...');
    }, 1500);

    setTimeout(() => {
      const detected: DraftFoodItem[] = [
        {
          id: `draft-photo-1-${Date.now()}`,
          name: 'Chicken Breast',
          quantity: 150,
          unit: 'grams',
          calories: 248, // pre-calculated estimates
          protein: 46.5,
          carbs: 0,
          fat: 5.4,
          fiber: 0,
          isCalculated: true,
          isFromPhoto: true
        },
        {
          id: `draft-photo-2-${Date.now()}`,
          name: 'Rice',
          quantity: 200,
          unit: 'grams',
          calories: 260,
          protein: 5.4,
          carbs: 56.0,
          fat: 0.6,
          fiber: 0.8,
          isCalculated: true,
          isFromPhoto: true
        }
      ];

      setDraftFoods([...draftFoods, ...detected]);
      setPhotoActive(false);
      setIsCalculated(true); // they are pre-calculated
    }, 3000);
  };

  // Suggestions Completion Logic
  const getAiSuggestions = (remCal: number) => {
    if (remCal <= 0) return [];
    
    const isGain = profile.goal.includes('gain') || profile.goal.includes('building') || profile.goal.includes('bulking');
    
    if (isGain) {
      // High protein recommendations
      return [
        { name: 'Egg', quantity: 1, unit: 'pieces', calories: 78, protein: 6.3 },
        { name: 'Milk', quantity: 100, unit: 'ml', calories: 58, protein: 3.2 },
        { name: 'Whey Protein', quantity: 1, unit: 'pieces', calories: 120, protein: 25.0 }
      ];
    } else {
      // Lower calorie high fiber recommendations
      return [
        { name: 'Banana', quantity: 1, unit: 'pieces', calories: 89, protein: 1.1 },
        { name: 'Apple', quantity: 1, unit: 'pieces', calories: 52, protein: 0.3 },
        { name: 'Buttermilk / Chaas', quantity: 200, unit: 'ml', calories: 45, protein: 2.0 }
      ];
    }
  };

  // Sum stats of draft foods
  const draftTotalCalories = draftFoods.reduce((sum, item) => sum + (item.calories || 0), 0);
  const draftTotalProtein = draftFoods.reduce((sum, item) => sum + (item.protein || 0), 0);
  const draftTotalCarbs = draftFoods.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const draftTotalFat = draftFoods.reduce((sum, item) => sum + (item.fat || 0), 0);
  const draftTotalFiber = draftFoods.reduce((sum, item) => sum + (item.fiber || 0), 0);

  const displayTarget = activeMealInfo.targetCalories;
  const displayConsumed = activeMealInfo.consumedCalories + (isCalculated ? draftTotalCalories : 0);
  const displayRemaining = Math.max(0, displayTarget - displayConsumed);

  const aiSuggestions = getAiSuggestions(displayRemaining);

  // Add suggestion to draft
  const handleAddSuggestion = (sug: any) => {
    const newItem: DraftFoodItem = {
      id: `draft-sug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: sug.name,
      quantity: sug.quantity,
      unit: sug.unit,
      isCalculated: false
    };
    setDraftFoods([...draftFoods, newItem]);
    setIsCalculated(false);
  };

  return (
    <div className="grid md:grid-cols-12 gap-6 relative">
      
      {/* Top Banner: Dropdown and Meal stats */}
      <div className="md:col-span-12 glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">Select target meal</span>
          <div className="flex items-center gap-3">
            <select
              value={selectedMealName}
              onChange={(e) => {
                setSelectedMealName(e.target.value);
                setDraftFoods([]);
                setIsCalculated(false);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Morning Snack">Morning Snack</option>
              <option value="Lunch">Lunch</option>
              <option value="Evening Snack">Evening Snack</option>
              <option value="Dinner">Dinner</option>
              <option value="Night Snack">Night Snack</option>
            </select>
            <span className="text-xs text-zinc-500 font-medium">({activeMealInfo.timeStr})</span>
          </div>
        </div>

        {/* Selected Meal targets */}
        <div className="grid grid-cols-3 gap-6 md:gap-10 border-t md:border-t-0 md:border-l border-zinc-900/60 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
          <div>
            <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Target Budget</span>
            <span className="text-base font-black text-zinc-300">{displayTarget} kcal</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Consumed</span>
            <span className="text-base font-black text-emerald-400">{displayConsumed} kcal</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Remaining</span>
            <span className={`text-base font-black ${displayRemaining > 0 ? 'text-amber-500' : 'text-zinc-500'}`}>{displayRemaining} kcal</span>
          </div>
        </div>
      </div>

      {/* Main Form and Meal table */}
      <div className="md:col-span-8 flex flex-col gap-6">
        
        {/* Quick Log AI Entry Card */}
        <div className="glass-card p-4 rounded-xl flex gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400 glow-emerald" />
            <div>
              <h3 className="text-xs font-bold text-white">AI Quick Logging</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Use voice or photo to scan and auto-estimate entries.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleVoiceEntry}
              className="bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-zinc-300 text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-400" /> Voice Input
            </button>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <button
                className="bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-zinc-300 text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400" /> Photo Scan
              </button>
            </div>
          </div>
        </div>

        {/* Manual Food Entry Card */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Manual Food Entry</h3>
            <p className="text-xs text-zinc-400">Log entries manually below and let the AI compute nutritional stats.</p>
          </div>

          <form onSubmit={handleAddFood} className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-5">
              <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Food Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Bread, Egg, Milk, Oats"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="col-span-3">
              <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Quantity</label>
              <input
                type="number"
                step="0.1"
                required
                min="0.1"
                placeholder="e.g. 2, 150"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="col-span-4">
              <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Unit</label>
              <select
                value={unit}
                onChange={(e: any) => setUnit(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="pieces">Pieces</option>
                <option value="grams">Grams (g)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="cups">Cups</option>
                <option value="tablespoons">Tablespoons</option>
                <option value="teaspoons">Teaspoons</option>
              </select>
            </div>

            <div className="col-span-12 flex justify-end pt-1">
              <button
                type="submit"
                className="bg-zinc-900 border border-zinc-850 hover:border-emerald-500/35 text-emerald-400 hover:text-white hover:bg-emerald-500/10 py-2.5 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Add Food
              </button>
            </div>
          </form>
        </div>

        {/* Meal Journal Table */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Meal Journal Table</h3>
              <p className="text-xs text-zinc-500 mt-0.5">List of items waiting for AI nutritional calculation.</p>
            </div>
            {draftFoods.length > 0 && (
              <button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-2 px-4 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/10 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {isCalculating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <><Sparkles className="w-3.5 h-3.5" /> Calculate Nutrition</>
                )}
              </button>
            )}
          </div>

          <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/20 text-zinc-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5 pl-4">Food</th>
                  <th className="p-3.5 text-center">Quantity</th>
                  <th className="p-3.5 text-right">Calories</th>
                  <th className="p-3.5 text-right pr-4">Protein</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {draftFoods.length > 0 ? (
                  draftFoods.map(food => (
                    <tr key={food.id} className={`hover:bg-zinc-900/10 transition-colors ${food.isFromPhoto ? 'bg-blue-950/5' : ''}`}>
                      <td className="p-3.5 pl-4 font-bold text-white flex items-center gap-1.5">
                        {food.name}
                        {food.isFromPhoto && (
                          <span className="bg-blue-500/10 text-blue-400 text-[9px] font-extrabold px-1 rounded">Camera</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-medium text-zinc-300">
                        {food.quantity} {food.unit}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-zinc-400">
                        {food.isCalculated ? `${food.calories} kcal` : (
                          <span className="text-zinc-600 italic flex items-center justify-end gap-1">
                            <Info className="w-3 h-3 text-zinc-650" /> Pending AI
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-zinc-400 pr-4">
                        {food.isCalculated ? `${food.protein}g` : <span className="text-zinc-600 italic">-</span>}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleRemoveDraft(food.id)}
                          className="text-zinc-600 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-zinc-500 font-medium">
                      No foods added to this meal draft yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Side Stats & Completion Cards */}
      <div className="md:col-span-4 space-y-6">
        
        {/* Meal Summary Card */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Meal Summary Card</h3>
            <p className="text-[10px] text-zinc-400 mt-1">AI calculated macro splits for current meal draft.</p>
          </div>

          <div className="space-y-4 border-b border-zinc-900 pb-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-zinc-400">Total Draft Calories:</span>
              <span className={`text-xl font-black ${isCalculated ? 'text-emerald-400' : 'text-zinc-600'}`}>
                {isCalculated ? `${draftTotalCalories} kcal` : '0 kcal'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 block">Meal Target:</span>
                <span className="font-bold text-white">{displayTarget} kcal</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block">Remaining:</span>
                <span className="font-bold text-white">{displayRemaining} kcal</span>
              </div>
            </div>
          </div>

          {/* Macro details */}
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Protein:</span>
              <strong className={isCalculated ? 'text-emerald-400' : 'text-zinc-600'}>
                {isCalculated ? `${draftTotalProtein.toFixed(1)}g` : '0.0g'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Carbohydrates:</span>
              <strong className={isCalculated ? 'text-amber-500' : 'text-zinc-600'}>
                {isCalculated ? `${draftTotalCarbs.toFixed(1)}g` : '0.0g'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Fat:</span>
              <strong className={isCalculated ? 'text-rose-500' : 'text-zinc-600'}>
                {isCalculated ? `${draftTotalFat.toFixed(1)}g` : '0.0g'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Fiber:</span>
              <strong className={isCalculated ? 'text-teal-400' : 'text-zinc-600'}>
                {isCalculated ? `${draftTotalFiber.toFixed(1)}g` : '0.0g'}
              </strong>
            </div>
          </div>

          {/* Save Meal Button */}
          <button
            onClick={handleSaveMeal}
            disabled={!isCalculated || draftFoods.length === 0}
            className={`w-full py-3 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-1.5 ${
              isCalculated && draftFoods.length > 0
                ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 cursor-pointer'
                : 'bg-zinc-900 border border-zinc-850 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" /> Save Meal to Journal
          </button>
        </div>

        {/* AI Completion Card */}
        <AnimatePresence>
          {isCalculated && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 rounded-2xl space-y-4 border border-emerald-500/15"
            >
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400/20" /> AI Completion Suggestions
                </h3>
                <p className="text-[10px] text-zinc-400 mt-1">Suggestions to hit remaining {displayRemaining} kcal.</p>
              </div>

              <div className="space-y-3 bg-zinc-950/30 p-4 border border-zinc-900 rounded-xl text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">{selectedMealName} Goal:</span>
                  <span className="font-bold text-white">{displayTarget} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Consumed:</span>
                  <span className="font-bold text-white">{displayConsumed} kcal</span>
                </div>
                <div className="flex justify-between border-t border-zinc-900 pt-2 font-bold">
                  <span className="text-emerald-400">Remaining Budget:</span>
                  <span className="text-emerald-400">{displayRemaining} kcal</span>
                </div>
              </div>

              {displayRemaining > 15 ? (
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Recommended additions</span>
                  {aiSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddSuggestion(sug)}
                      className="w-full flex items-center justify-between p-3 bg-zinc-900/40 border border-zinc-900 hover:border-emerald-500/25 rounded-xl text-left transition-all hover:-translate-y-0.5 group"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{sug.name}</h4>
                        <span className="text-[9px] text-zinc-500">Qty: {sug.quantity} {sug.unit} • P: {sug.protein}g</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-300">{sug.calories} kcal</span>
                        <Plus className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-zinc-500 font-medium">
                  {displayRemaining === 0 ? 'Meal targets completed / exceeded!' : 'Almost completed! No additions needed.'}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Voice Processing Simulated Overlay */}
      <AnimatePresence>
        {voiceActive && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-sm w-full p-8 rounded-2xl text-center space-y-6 border border-emerald-500/20"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto pulse-primary-ring relative">
                <Mic className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>

              <div>
                <h4 className="text-sm font-black text-white">AI Voice Journal</h4>
                <p className="text-xs text-zinc-500 mt-2 min-h-[40px] px-2">{voiceStatus}</p>
              </div>

              <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                Hold closer to microphone for best results
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Processing Simulated Overlay */}
      <AnimatePresence>
        {photoActive && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-sm w-full p-8 rounded-2xl text-center space-y-6 border border-blue-500/20"
            >
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-[bounce_2s_infinite]" />
                <Camera className="w-10 h-10 text-blue-400 animate-pulse" />
              </div>

              <div>
                <h4 className="text-sm font-black text-white">AI Plate Scanner</h4>
                <p className="text-xs text-zinc-500 mt-2 min-h-[40px] px-2">{photoStatus}</p>
              </div>

              <div className="text-[10px] text-zinc-650 font-bold uppercase tracking-wider">
                Supported formats: PNG, JPG, JPEG
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Success Banner */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-emerald-500 text-zinc-950 font-black text-xs py-4 px-6 rounded-xl shadow-xl flex items-center gap-2 z-50"
          >
            <Check className="w-4 h-4 shrink-0 stroke-[3px]" />
            Meal successfully saved to your Daily Journal!
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
