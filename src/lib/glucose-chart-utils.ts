import type { DiabetesType } from '../types';
import type { DailyHistoryEntry, DexcomReading, MealRecord } from './api';
import { glucoseDisplayNumber, glucoseTargetRange, glucoseZoneThresholds, synthesizeReadings, type GlucoseUnit } from './glucose-units';

export const CHART_WIDTH = 640;
export const CHART_HEIGHT = 200;
export const CHART_PAD = { top: 16, right: 12, bottom: 28, left: 44 };

export type GlucoseChartLayout = {
  linePoints: string;
  targetLowY: number;
  targetHighY: number;
  minDisplay: number;
  maxDisplay: number;
  plotWidth: number;
  plotHeight: number;
  timeInRangePct: number;
  yTicks: number[];
};

export type MealChartMarker = {
  id: string;
  x: number;
  y: number;
  label: string;
  carbs: number;
};

const hashSeed = (value: string) =>
  value.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

export const buildGlucoseChartLayout = (
  readings: DexcomReading[],
  unit: GlucoseUnit,
  diabetesType: DiabetesType,
): GlucoseChartLayout => {
  const zones = glucoseZoneThresholds(diabetesType);
  const minDisplay = unit === 'mmol/L' ? 2.5 : 45;
  const maxDisplay = unit === 'mmol/L' ? 14 : 250;
  const plotWidth = CHART_WIDTH - CHART_PAD.left - CHART_PAD.right;
  const plotHeight = CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom;

  const yForValue = (value: number) =>
    CHART_PAD.top + plotHeight - ((value - minDisplay) / (maxDisplay - minDisplay)) * plotHeight;

  const targetLowY = yForValue(glucoseDisplayNumber(zones.targetLow, unit) ?? zones.targetLow);
  const targetHighY = yForValue(glucoseDisplayNumber(zones.targetHigh, unit) ?? zones.targetHigh);

  const linePoints = readings
    .map((reading, index) => {
      const x = CHART_PAD.left + (index / Math.max(readings.length - 1, 1)) * plotWidth;
      const y = yForValue(glucoseDisplayNumber(reading.glucose, unit) ?? minDisplay);
      return `${x},${y}`;
    })
    .join(' ');

  const inRangeCount = readings.filter(
    (reading) => reading.glucose >= zones.targetLow && reading.glucose <= zones.targetHigh,
  ).length;
  const timeInRangePct = readings.length ? Math.round((inRangeCount / readings.length) * 100) : 0;

  return {
    linePoints,
    targetLowY,
    targetHighY,
    minDisplay,
    maxDisplay,
    plotWidth,
    plotHeight,
    timeInRangePct,
    yTicks: unit === 'mmol/L' ? [3, 5, 7, 9, 11, 13] : [54, 90, 126, 162, 198, 234],
  };
};

export const synthesizeSessionGlucoseSeries = (
  entry: DailyHistoryEntry,
  diabetesType: DiabetesType,
  pointCount = 16,
): DexcomReading[] => {
  const seed = hashSeed(entry.id);
  const target = glucoseTargetRange(diabetesType);
  const center = diabetesType === 'type2' ? 128 : 102;
  const swing = Math.min(45, 12 + entry.alertsCount * 9 + entry.escalationCount * 14);
  const now = Date.now() - 1000 * 60 * 60 * 8;

  return Array.from({ length: pointCount }, (_, index) => {
    const wave = Math.sin((index + seed % 7) * 0.9) * swing * 0.45;
    const drift = index > pointCount * 0.55 ? (entry.escalationCount > 0 ? -14 : 6) : 0;
    const glucose = Math.max(48, Math.min(280, Math.round(center + wave + drift + ((seed + index * 11) % 9) - 4)));
    return {
      id: `${entry.id}-${index}`,
      timestamp: new Date(now + index * 30 * 60 * 1000).toISOString(),
      glucose,
      trend: glucose < target.low ? 'down' : glucose > target.high ? 'up' : 'flat',
    };
  });
};

export const estimateSessionTimeInRange = (readings: DexcomReading[], diabetesType: DiabetesType) => {
  const zones = glucoseTargetRange(diabetesType);
  if (!readings.length) return 0;
  const inRange = readings.filter((reading) => reading.glucose >= zones.low && reading.glucose <= zones.high).length;
  return Math.round((inRange / readings.length) * 100);
};

export const mealMarkersForReadings = (
  meals: MealRecord[],
  readings: DexcomReading[],
  unit: GlucoseUnit,
  chart: Pick<GlucoseChartLayout, 'minDisplay' | 'maxDisplay' | 'plotWidth' | 'plotHeight'>,
): MealChartMarker[] => {
  if (!meals.length || !readings.length) return [];

  const start = Date.parse(readings[0].timestamp);
  const end = Date.parse(readings[readings.length - 1].timestamp);
  const span = Math.max(end - start, 1);

  return meals
    .map((meal) => {
      const mealTime = Date.parse(meal.createdAt);
      if (!Number.isFinite(mealTime)) return null;
      const ratio = Math.max(0, Math.min(1, (mealTime - start) / span));
      const x = CHART_PAD.left + ratio * chart.plotWidth;
      const nearest = readings.reduce((best, reading) => {
        const distance = Math.abs(Date.parse(reading.timestamp) - mealTime);
        return distance < best.distance ? { reading, distance } : best;
      }, { reading: readings[readings.length - 1], distance: Number.POSITIVE_INFINITY }).reading;
      const display = glucoseDisplayNumber(nearest.glucose, unit) ?? chart.minDisplay;
      const y =
        CHART_PAD.top +
        chart.plotHeight -
        ((display - chart.minDisplay) / (chart.maxDisplay - chart.minDisplay)) * chart.plotHeight;
      return {
        id: meal.id,
        x,
        y: Math.max(CHART_PAD.top + 8, y - 18),
        label: meal.label || meal.timeLabel,
        carbs: meal.macros.carbs,
      };
    })
    .filter((marker): marker is MealChartMarker => marker != null)
    .slice(0, 4);
};

export const resolveChartReadings = (
  dexcomReadings: DexcomReading[] | undefined,
  latestMgDl: number | null | undefined,
  trend: DexcomReading['trend'],
): DexcomReading[] => {
  if (dexcomReadings && dexcomReadings.length > 0) return dexcomReadings;
  if (!Number.isFinite(latestMgDl)) return [];
  return synthesizeReadings(latestMgDl as number, trend).map((reading, index) => ({
    id: `synthetic-${index}`,
    ...reading,
  }));
};
