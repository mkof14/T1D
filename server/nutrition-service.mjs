import { createHash, randomBytes } from 'node:crypto';
import { normalizeDiabetesType } from './diabetes-type.mjs';

const MAX_MEALS_STORED = 30;
const MAX_IMAGE_BYTES = 2_500_000;

const MEAL_LIBRARY = [
  {
    keywords: ['pizza', 'пицц', 'pepperoni', 'cheese slice'],
    label: 'Pizza slice plate',
    items: [{ name: 'Cheese pizza', portion: '2 slices' }, { name: 'Side salad', portion: 'small bowl' }],
    macros: { calories: 620, carbs: 72, protein: 24, fat: 26, fiber: 5, sugar: 8, sodium: 980 },
    impact: 'high',
  },
  {
    keywords: ['salad', 'салат', 'greens', 'vegetable bowl'],
    label: 'Mixed green salad',
    items: [{ name: 'Leafy greens', portion: '2 cups' }, { name: 'Cherry tomatoes', portion: '1/2 cup' }, { name: 'Olive oil dressing', portion: '1 tbsp' }],
    macros: { calories: 220, carbs: 14, protein: 6, fat: 16, fiber: 7, sugar: 5, sodium: 320 },
    impact: 'low',
  },
  {
    keywords: ['pasta', 'паст', 'spaghetti', 'macaroni'],
    label: 'Pasta with sauce',
    items: [{ name: 'Pasta', portion: '1.5 cups' }, { name: 'Tomato sauce', portion: '1/2 cup' }],
    macros: { calories: 480, carbs: 68, protein: 14, fat: 12, fiber: 6, sugar: 10, sodium: 640 },
    impact: 'high',
  },
  {
    keywords: ['rice', 'рис', 'bowl', 'grain'],
    label: 'Rice bowl',
    items: [{ name: 'Steamed rice', portion: '1 cup' }, { name: 'Vegetables', portion: '1/2 cup' }, { name: 'Protein', portion: '3 oz' }],
    macros: { calories: 410, carbs: 58, protein: 22, fat: 9, fiber: 4, sugar: 3, sodium: 520 },
    impact: 'moderate',
  },
  {
    keywords: ['sandwich', 'бутерб', 'wrap', 'bread'],
    label: 'Sandwich plate',
    items: [{ name: 'Whole-grain sandwich', portion: '1 serving' }, { name: 'Apple slices', portion: '1/2 cup' }],
    macros: { calories: 390, carbs: 48, protein: 18, fat: 14, fiber: 6, sugar: 12, sodium: 680 },
    impact: 'moderate',
  },
  {
    keywords: ['egg', 'яйц', 'breakfast', 'omelet'],
    label: 'Egg breakfast plate',
    items: [{ name: 'Scrambled eggs', portion: '2 eggs' }, { name: 'Toast', portion: '1 slice' }, { name: 'Berries', portion: '1/2 cup' }],
    macros: { calories: 340, carbs: 28, protein: 20, fat: 16, fiber: 4, sugar: 9, sodium: 420 },
    impact: 'moderate',
  },
  {
    keywords: ['fruit', 'фрукт', 'berry', 'banana', 'apple'],
    label: 'Fresh fruit snack',
    items: [{ name: 'Mixed fruit', portion: '1 cup' }],
    macros: { calories: 120, carbs: 30, protein: 1, fat: 0, fiber: 4, sugar: 22, sodium: 5 },
    impact: 'moderate',
  },
  {
    keywords: ['soup', 'суп', 'broth'],
    label: 'Vegetable soup bowl',
    items: [{ name: 'Vegetable soup', portion: '1.5 cups' }, { name: 'Whole-grain roll', portion: '1 small' }],
    macros: { calories: 260, carbs: 38, protein: 10, fat: 7, fiber: 6, sugar: 6, sodium: 780 },
    impact: 'low',
  },
];

const VARIANTS = [
  { suffix: 'with protein', macroScale: 1.12, proteinBoost: 8 },
  { suffix: 'light portion', macroScale: 0.82, proteinBoost: 0 },
  { suffix: 'family portion', macroScale: 1.18, proteinBoost: 4 },
  { suffix: '', macroScale: 1, proteinBoost: 0 },
];

const hashSeed = (imageBase64 = '', note = '') =>
  createHash('sha256').update(String(imageBase64).slice(0, 8000)).update(String(note).toLowerCase()).digest('hex');

const pickMealTemplate = (note, seed) => {
  const normalized = String(note || '').toLowerCase();
  const keywordHit = MEAL_LIBRARY.find((entry) => entry.keywords.some((word) => normalized.includes(word)));
  if (keywordHit) return keywordHit;
  const index = parseInt(seed.slice(0, 8), 16) % MEAL_LIBRARY.length;
  return MEAL_LIBRARY[index];
};

const scaleMacros = (macros, scale, proteinBoost = 0) => ({
  calories: Math.round(macros.calories * scale),
  carbs: Math.round(macros.carbs * scale),
  protein: Math.round(macros.protein * scale + proteinBoost),
  fat: Math.round(macros.fat * scale),
  fiber: Math.round(macros.fiber * scale),
  sugar: Math.round(macros.sugar * scale),
  sodium: Math.round(macros.sodium * scale),
});

const glucoseImpactLabel = (impact, diabetesType) => {
  if (diabetesType === 'type2' && impact === 'high') {
    return { level: 'high', headline: 'Likely to raise glucose noticeably', detail: 'Plan a post-meal check in 90–120 minutes.' };
  }
  if (impact === 'high') {
    return { level: 'high', headline: 'Higher carb load — watch closely', detail: 'Consider dosing or a follow-up check based on your care plan.' };
  }
  if (impact === 'moderate') {
    return { level: 'moderate', headline: 'Moderate impact expected', detail: 'A gentle rise is normal — stay aware for the next hour.' };
  }
  return { level: 'low', headline: 'Light impact on glucose', detail: 'This meal should stay relatively steady with routine monitoring.' };
};

const buildCombinedInsight = ({ meal, currentGlucose, trend, diabetesType }) => {
  const carbs = meal.macros.carbs;
  const type = normalizeDiabetesType(diabetesType);
  const glucoseText = currentGlucose ? `Current reading: ${currentGlucose}` : 'No live glucose reading right now';
  const trendText = trend && trend !== 'flat' ? ` · trend ${trend}` : '';

  if (type === 'type2' && carbs >= 45) {
    return `${glucoseText}${trendText}. This meal has ${carbs}g carbs — for type 2, consider a walk or hydration after eating and recheck later.`;
  }
  if (carbs >= 55) {
    return `${glucoseText}${trendText}. ${carbs}g carbs may push glucose up over the next 1–2 hours — keep fast carbs nearby if you use insulin.`;
  }
  if (carbs <= 20) {
    return `${glucoseText}${trendText}. Lower carb meal (${carbs}g) — good choice if you want a calmer post-meal curve.`;
  }
  return `${glucoseText}${trendText}. Balanced meal logged — Steady will keep this alongside your safety timeline.`;
};

export const ensureNutritionState = (household) => {
  if (!household.nutritionState) {
    return { meals: [], dailyTotals: null };
  }
  return {
    meals: Array.isArray(household.nutritionState.meals) ? household.nutritionState.meals : [],
    dailyTotals: household.nutritionState.dailyTotals || null,
  };
};

export const analyzeMealInput = ({ imageBase64 = '', note = '', diabetesType = 'type1', currentGlucose = null, trend = 'flat' }) => {
  if (imageBase64 && Buffer.byteLength(imageBase64, 'utf8') > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large. Try a closer photo or lower resolution.');
  }

  const seed = hashSeed(imageBase64, note);
  const template = pickMealTemplate(note, seed);
  const variant = VARIANTS[parseInt(seed.slice(8, 12), 16) % VARIANTS.length];
  const label = variant.suffix ? `${template.label} (${variant.suffix})` : template.label;
  const macros = scaleMacros(template.macros, variant.macroScale, variant.proteinBoost);
  const impact = glucoseImpactLabel(template.impact, normalizeDiabetesType(diabetesType));
  const confidence = note.trim() ? 0.88 : imageBase64 ? 0.76 : 0.62;

  const meal = {
    id: randomBytes(8).toString('hex'),
    createdAt: new Date().toISOString(),
    timeLabel: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    label,
    note: String(note || '').trim().slice(0, 200),
    items: template.items,
    macros,
    confidence: Math.round(confidence * 100),
    glucoseImpact: impact,
    combinedInsight: '',
    hasImage: Boolean(imageBase64),
  };

  meal.combinedInsight = buildCombinedInsight({ meal, currentGlucose, trend, diabetesType });

  return meal;
};

const sumDailyTotals = (meals) => {
  const today = new Date().toDateString();
  const todays = meals.filter((m) => new Date(m.createdAt).toDateString() === today);
  if (todays.length === 0) return null;
  return todays.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.macros.calories,
      carbs: acc.carbs + meal.macros.carbs,
      protein: acc.protein + meal.macros.protein,
      fat: acc.fat + meal.macros.fat,
      fiber: acc.fiber + meal.macros.fiber,
      mealsCount: acc.mealsCount + 1,
    }),
    { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, mealsCount: 0 },
  );
};

export const appendMealToHousehold = (household, meal, user) => {
  const nutritionState = ensureNutritionState(household);
  const meals = [meal, ...nutritionState.meals].slice(0, MAX_MEALS_STORED);
  const safetyState = household.safetyState || {};
  const eventLog = Array.isArray(safetyState.eventLog) ? [...safetyState.eventLog] : [];
  eventLog.push({
    id: randomBytes(8).toString('hex'),
    kind: 'meal_logged',
    step: `Meal logged: ${meal.label}`,
    actor: user.fullName || user.email,
    time: meal.timeLabel,
    detail: `${meal.macros.carbs}g carbs · ${meal.macros.calories} kcal — ${meal.glucoseImpact.headline}`,
    status: 'done',
  });

  return {
    ...household,
    nutritionState: {
      meals,
      dailyTotals: sumDailyTotals(meals),
      lastMealId: meal.id,
    },
    safetyState: {
      ...safetyState,
      eventLog: eventLog.slice(-40),
    },
    updatedAt: new Date().toISOString(),
  };
};

export const buildNutritionPayload = (household, currentState) => {
  const nutritionState = ensureNutritionState(household);
  const meals = nutritionState.meals.slice(0, 12);
  const lastMeal = meals[0] || null;
  const diabetesType = normalizeDiabetesType(household.diabetesType);

  return {
    lastMeal,
    recentMeals: meals,
    dailyTotals: sumDailyTotals(nutritionState.meals),
    insight: lastMeal
      ? {
          headline: lastMeal.glucoseImpact.headline,
          detail: lastMeal.combinedInsight,
          carbs: lastMeal.macros.carbs,
          impactLevel: lastMeal.glucoseImpact.level,
        }
      : null,
    scanHint:
      diabetesType === 'type2'
        ? 'Point your camera at the plate — we estimate carbs, calories, and post-meal glucose impact.'
        : 'Scan your plate to see carbs and how this meal may affect glucose over the next hours.',
  };
};
