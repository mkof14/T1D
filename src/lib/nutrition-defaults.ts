import type { NutritionPayload } from './api';

export const createEmptyNutritionPayload = (scanHint?: string): NutritionPayload => ({
  lastMeal: null,
  recentMeals: [],
  dailyTotals: null,
  insight: null,
  scanHint:
    scanHint ||
    'Point your camera at the plate or describe the meal — carbs, calories, and glucose impact appear here.',
});
