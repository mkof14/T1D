import React from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus, Moon, Sun } from 'lucide-react';
import type { Language, DiabetesType } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { t1dSoftLabel } from '../../lib/t1d-ui';
import type { CurrentStatePayload, DexcomConnectionPayload, MealRecord } from '../../lib/api';
import { GLUCOSE_DISPLAY_COPY } from '../../content/glucose-display-copy';
import { WORKSPACE_VISUAL_COPY } from '../../content/workspace-visual-copy';
import { glucoseDashboardTypeClass } from '../../lib/diabetes-type-theme';
import {
  CHART_HEIGHT,
  CHART_PAD,
  CHART_WIDTH,
  buildGlucoseChartLayout,
  mealMarkersForReadings,
  resolveChartReadings,
} from '../../lib/glucose-chart-utils';
import {
  formatGlucoseValue,
  glucoseDisplayNumber,
  glucoseTargetRange,
  type GlucoseUnit,
} from '../../lib/glucose-units';

type GlucoseNowDashboardProps = {
  lang: Language;
  theme: T1DTheme;
  isRTL?: boolean;
  diabetesType: DiabetesType;
  glucoseUnit: GlucoseUnit;
  currentState: CurrentStatePayload;
  dexcom: DexcomConnectionPayload | null;
  recentMeals?: MealRecord[];
  trendLabel: string;
  dataFieldLabel: string;
  dataStatusLabel: string;
  responderLabel: string;
  stateLabel: string;
  modeLabels: { day: string; night: string };
  headline: string;
  recommendation: string;
};

const trendIcon = (trend: CurrentStatePayload['trend']) => {
  if (trend === 'up') return ArrowUpRight;
  if (trend === 'down') return ArrowDownRight;
  if (trend === 'flat') return ArrowRight;
  return Minus;
};

const zoneTone = (level: CurrentStatePayload['level']) => {
  if (level === 'ok' || level === 'recovery') return 't1d-glucose-hero--stable';
  if (level === 'watch') return 't1d-glucose-hero--watch';
  return 't1d-glucose-hero--risk';
};

const zoneStatusCopy = (
  lang: Language,
  level: CurrentStatePayload['level'],
  glucoseMgDl: number | null | undefined,
  diabetesType: DiabetesType,
) => {
  const copy = GLUCOSE_DISPLAY_COPY[lang];
  const target = glucoseTargetRange(diabetesType);
  if (!Number.isFinite(glucoseMgDl)) return copy.noData;
  const value = glucoseMgDl as number;
  if (value < target.low) return copy.belowTarget;
  if (value > target.high) return copy.aboveTarget;
  if (level === 'ok' || level === 'recovery') return copy.inTarget;
  if (level === 'watch') return copy.belowTarget;
  return copy.aboveTarget;
};

export const GlucoseNowDashboard: React.FC<GlucoseNowDashboardProps> = ({
  lang,
  theme,
  isRTL = false,
  diabetesType,
  glucoseUnit,
  currentState,
  dexcom,
  recentMeals = [],
  trendLabel,
  dataFieldLabel,
  dataStatusLabel,
  responderLabel,
  stateLabel,
  modeLabels,
  headline,
  recommendation,
}) => {
  const copy = GLUCOSE_DISPLAY_COPY[lang];
  const visualCopy = WORKSPACE_VISUAL_COPY[lang];
  const softLabelClass = t1dSoftLabel(theme);
  const glucoseMgDl = currentState.glucose ?? dexcom?.latestGlucose ?? null;
  const trend = currentState.trend || dexcom?.latestTrend || 'unknown';
  const TrendIcon = trendIcon(trend);
  const displayValue = formatGlucoseValue(glucoseMgDl, glucoseUnit);
  const statusCopy = zoneStatusCopy(lang, currentState.level, glucoseMgDl, diabetesType);
  const targetCopy = diabetesType === 'type2' ? copy.type2Target : copy.type1Target;
  const readings = resolveChartReadings(dexcom?.readings, glucoseMgDl, trend);
  const chart = buildGlucoseChartLayout(readings, glucoseUnit, diabetesType);
  const mealMarkers = mealMarkersForReadings(recentMeals, readings, glucoseUnit, chart);

  const gaugeMin = glucoseUnit === 'mmol/L' ? 2 : 40;
  const gaugeMax = glucoseUnit === 'mmol/L' ? 14 : 250;
  const gaugeValue = glucoseDisplayNumber(glucoseMgDl, glucoseUnit);
  const gaugePct = gaugeValue == null ? 0 : Math.max(0, Math.min(100, ((gaugeValue - gaugeMin) / (gaugeMax - gaugeMin)) * 100));
  const target = glucoseTargetRange(diabetesType);
  const targetStartPct = ((glucoseDisplayNumber(target.low, glucoseUnit) ?? target.low) - gaugeMin) / (gaugeMax - gaugeMin) * 100;
  const targetEndPct = ((glucoseDisplayNumber(target.high, glucoseUnit) ?? target.high) - gaugeMin) / (gaugeMax - gaugeMin) * 100;

  return (
    <div className={`t1d-glucose-dashboard ${glucoseDashboardTypeClass(diabetesType)} ${theme === 'dark' ? 't1d-glucose-dashboard--dark' : 't1d-glucose-dashboard--light'} ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className={`t1d-glucose-hero ${zoneTone(currentState.level)}`}>
        <div className={`flex flex-wrap items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <p className={softLabelClass}>{copy.currentReading}</p>
            <div className={`mt-2 flex items-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className="t1d-glucose-hero__value">{displayValue}</p>
              <p className="t1d-glucose-hero__unit">{glucoseUnit}</p>
            </div>
            <p className="mt-3 text-sm font-semibold opacity-90">{statusCopy}</p>
          </div>
          <div className={`t1d-glucose-hero__badge ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide">{stateLabel}</span>
              <span className={`t1d-mode-chip ${currentState.mode === 'night' ? 't1d-mode-chip--night' : 't1d-mode-chip--day'}`}>
                {currentState.mode === 'night' ? <Moon size={12} /> : <Sun size={12} />}
                {currentState.mode === 'night' ? modeLabels.night : modeLabels.day}
              </span>
            </div>
            <div className={`mt-3 flex items-center gap-2 text-base font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
              <TrendIcon size={22} aria-hidden="true" />
              <span>{trendLabel}</span>
            </div>
          </div>
        </div>
        <p className="mt-5 text-lg font-black tracking-tight">{headline}</p>
        <p className="mt-2 text-sm leading-relaxed opacity-85">{recommendation}</p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className={`t1d-glucose-panel ${theme === 'dark' ? 't1d-glucose-panel--dark' : 't1d-glucose-panel--light'}`}>
          <div className={`flex flex-wrap items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <p className={softLabelClass}>{copy.trendChart}</p>
            <p className="text-xs font-semibold opacity-70">{copy.lastReadings}</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="t1d-glucose-chart" role="img" aria-label={copy.trendChart}>
              <rect
                x={CHART_PAD.left}
                y={Math.min(chart.targetLowY, chart.targetHighY)}
                width={chart.plotWidth}
                height={Math.abs(chart.targetHighY - chart.targetLowY)}
                className="t1d-glucose-chart__target-band"
              />
              {chart.yTicks.map((tick) => {
                const y =
                  CHART_PAD.top +
                  chart.plotHeight -
                  ((tick - chart.minDisplay) / (chart.maxDisplay - chart.minDisplay)) * chart.plotHeight;
                return (
                  <g key={tick}>
                    <line x1={CHART_PAD.left} x2={CHART_WIDTH - CHART_PAD.right} y1={y} y2={y} className="t1d-glucose-chart__grid" />
                    <text x={CHART_PAD.left - 8} y={y + 4} textAnchor="end" className="t1d-glucose-chart__axis">
                      {tick}
                    </text>
                  </g>
                );
              })}
              {chart.linePoints ? (
                <>
                  <polyline points={chart.linePoints} className="t1d-glucose-chart__line" fill="none" />
                  {readings.map((reading, index) => {
                    const x = CHART_PAD.left + (index / Math.max(readings.length - 1, 1)) * chart.plotWidth;
                    const y =
                      CHART_PAD.top +
                      chart.plotHeight -
                      (((glucoseDisplayNumber(reading.glucose, glucoseUnit) ?? chart.minDisplay) - chart.minDisplay) /
                        (chart.maxDisplay - chart.minDisplay)) *
                        chart.plotHeight;
                    return <circle key={reading.id || index} cx={x} cy={y} r={4.5} className="t1d-glucose-chart__dot" />;
                  })}
                  {mealMarkers.map((marker) => (
                    <g key={marker.id}>
                      <line x1={marker.x} x2={marker.x} y1={marker.y + 8} y2={CHART_HEIGHT - CHART_PAD.bottom} className="t1d-meal-marker__line" />
                      <circle cx={marker.x} cy={marker.y} r={7} className="t1d-meal-marker__dot" />
                      <text x={marker.x} y={marker.y - 10} textAnchor="middle" className="t1d-meal-marker__label">
                        {visualCopy.mealMarker}
                      </text>
                    </g>
                  ))}
                </>
              ) : null}
            </svg>
          </div>
          {mealMarkers.length > 0 ? (
            <div className={`mt-3 flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {mealMarkers.map((marker) => (
                <span key={marker.id} className="t1d-meal-marker-chip">
                  {marker.label} · {marker.carbs} g
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-3 text-xs font-semibold opacity-75">{targetCopy}</p>
        </div>

        <div className="grid gap-4">
          <div className={`t1d-glucose-panel ${theme === 'dark' ? 't1d-glucose-panel--dark' : 't1d-glucose-panel--light'}`}>
            <p className={softLabelClass}>{copy.rangeGauge}</p>
            <div className="t1d-glucose-gauge mt-4">
              <div className="t1d-glucose-gauge__track">
                <div
                  className="t1d-glucose-gauge__target"
                  style={{ left: `${targetStartPct}%`, width: `${Math.max(targetEndPct - targetStartPct, 4)}%` }}
                />
                <div className="t1d-glucose-gauge__marker" style={{ left: `${gaugePct}%` }} />
              </div>
              <div className={`mt-3 flex justify-between text-xs font-bold opacity-75 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{copy.lowZone}</span>
                <span>{copy.targetBand}</span>
                <span>{copy.highZone}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`t1d-glucose-stat ${theme === 'dark' ? 't1d-glucose-stat--dark' : 't1d-glucose-stat--light'}`}>
              <p className={softLabelClass}>{copy.timeInRange}</p>
              <p className="t1d-glucose-stat__value">{chart.timeInRangePct}%</p>
            </div>
            <div className={`t1d-glucose-stat ${theme === 'dark' ? 't1d-glucose-stat--dark' : 't1d-glucose-stat--light'}`}>
              <p className={softLabelClass}>{dataFieldLabel}</p>
              <p className="t1d-glucose-stat__value t1d-glucose-stat__value--sm">{dataStatusLabel}</p>
            </div>
            <div className={`t1d-glucose-stat col-span-2 ${theme === 'dark' ? 't1d-glucose-stat--dark' : 't1d-glucose-stat--light'}`}>
              <p className={softLabelClass}>{responderLabel}</p>
              <p className="t1d-glucose-stat__value t1d-glucose-stat__value--sm">{currentState.responder}</p>
              <p className="mt-1 text-xs opacity-70">{currentState.acknowledgedAt}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
