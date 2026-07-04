export type GlucoseUnit = 'mg/dL' | 'mmol/L';

export const GLUCOSE_UNITS: GlucoseUnit[] = ['mg/dL', 'mmol/L'];

export const MG_DL_TO_MMOL = 1 / 18.0182;

export const mgDlToMmol = (mgDl: number): number => Number((mgDl * MG_DL_TO_MMOL).toFixed(1));

export const mmolToMgDl = (mmol: number): number => Math.round(mmol / MG_DL_TO_MMOL);

export const normalizeGlucoseUnit = (value: unknown): GlucoseUnit =>
  value === 'mmol/L' ? 'mmol/L' : 'mg/dL';

export const formatGlucoseValue = (mgDl: number | null | undefined, unit: GlucoseUnit): string => {
  if (!Number.isFinite(mgDl)) return '—';
  if (unit === 'mmol/L') return mgDlToMmol(mgDl as number).toFixed(1);
  return String(Math.round(mgDl as number));
};

export const formatGlucose = (mgDl: number | null | undefined, unit: GlucoseUnit): string => {
  const value = formatGlucoseValue(mgDl, unit);
  if (value === '—') return value;
  return `${value} ${unit}`;
};

export const glucoseDisplayNumber = (mgDl: number | null | undefined, unit: GlucoseUnit): number | null => {
  if (!Number.isFinite(mgDl)) return null;
  if (unit === 'mmol/L') return mgDlToMmol(mgDl as number);
  return Math.round(mgDl as number);
};

export const glucoseAxisTicks = (unit: GlucoseUnit): number[] =>
  unit === 'mmol/L' ? [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [54, 72, 90, 108, 126, 144, 162, 180, 198, 216];

export const glucoseTargetRange = (diabetesType: 'type1' | 'type2'): { low: number; high: number } =>
  diabetesType === 'type2' ? { low: 80, high: 180 } : { low: 70, high: 180 };

export const glucoseZoneThresholds = (diabetesType: 'type1' | 'type2') => {
  const target = glucoseTargetRange(diabetesType);
  return {
    criticalLow: diabetesType === 'type2' ? 54 : 54,
    watchLow: diabetesType === 'type2' ? 70 : 70,
    targetLow: target.low,
    targetHigh: target.high,
    watchHigh: 250,
    criticalHigh: 300,
  };
};

export const synthesizeReadings = (
  latestMgDl: number,
  trend: 'up' | 'down' | 'flat' | 'unknown',
  count = 12,
): Array<{ glucose: number; timestamp: string; trend: 'up' | 'down' | 'flat' | 'unknown' }> => {
  const step = trend === 'up' ? 3 : trend === 'down' ? -3 : trend === 'flat' ? 0 : -1;
  const now = Date.now();
  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;
    return {
      glucose: Math.max(40, Math.min(400, latestMgDl - step * offset)),
      timestamp: new Date(now - offset * 5 * 60 * 1000).toISOString(),
      trend,
    };
  });
};
