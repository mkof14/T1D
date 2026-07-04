import { describe, expect, it } from 'vitest';
import { analyzeMealInput, buildNutritionPayload, ensureNutritionState } from '../../server/nutrition-service.mjs';

describe('nutrition-service', () => {
  it('analyzes meal from note keywords', () => {
    const meal = analyzeMealInput({
      note: 'pizza slice for lunch',
      diabetesType: 'type1',
      currentGlucose: 110,
      trend: 'flat',
    });
    expect(meal.label.toLowerCase()).toContain('pizza');
    expect(meal.macros.carbs).toBeGreaterThan(40);
    expect(meal.combinedInsight).toContain('110');
  });

  it('builds nutrition payload with scan hint by diabetes type', () => {
    const household = { diabetesType: 'type2', nutritionState: { meals: [] } };
    const payload = buildNutritionPayload(household, { glucose: 180 });
    expect(payload.scanHint).toMatch(/post-meal|glucose impact/i);
    expect(ensureNutritionState(household).meals).toEqual([]);
  });
});
