import React from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from 'lucide-react';
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
  const fieldLabelClass = t1dSoftLabel(theme);
  const glucoseMgDl = currentState.glucose ?? dexcom?.latestGlucose ?? null;
  const trend = currentState.trend || dexcom?.latestTrend || 'unknown';
  const TrendIcon = trendIcon(trend);
  const displayValue = formatGlucoseValue(glucoseMgDl, glucoseUnit);
  const statusCopy = zoneStatusCopy(lang, currentState.level, glucoseMgDl, diabetesType);
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
  const modeLabel = currentState.mode === 'night' ? modeLabels.night : modeLabels.day;

  return (
    <div className={`t1d-glucose-dashboard ${glucoseDashboardTypeClass(diabetesType)} ${theme === 'dark' ? 't1d-glucose-dashboard--dark' : 't1d-glucose-dashboard--light'} ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className={`t1d-glucose-hero ${zoneTone(currentState.level)}`}>
        <div className={`flex flex-wrap items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <div className={`flex items-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className="t1d-glucose-hero__value">{displayValue}</p>
              <p className="t1d-glucose-hero__unit">{glucoseUnit}</p>
            </div>
            <p className="mt-2 text-base font-semibold">{statusCopy}</p>
          </div>
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-base font-semibold">{stateLabel} · {modeLabel}</p>
            <div className={`mt-2 flex items-center gap-2 text-base font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
              <TrendIcon size={16} aria-hidden="true" />
              <span>{trendLabel}</span>
            </div>
          </div>
        </div>
        <p className="mt-5 text-xl font-black tracking-tight">{headline}</p>
        <p className="mt-3 text-base leading-relaxed">{recommendation}</p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className={`t1d-glucose-panel ${theme === 'dark' ? 't1d-glucose-panel--dark' : 't1d-glucose-panel--light'}`}>
          <div className="mt-1 overflow-x-auto">
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
        </div>

        <div className="grid gap-4">
          <div className={`t1d-glucose-panel ${theme === 'dark' ? 't1d-glucose-panel--dark' : 't1d-glucose-panel--light'}`}>
            <div className="t1d-glucose-gauge mt-2">
              <div className="t1d-glucose-gauge__track">
                <div
                  className="t1d-glucose-gauge__target"
                  style={{ left: `${targetStartPct}%`, width: `${Math.max(targetEndPct - targetStartPct, 4)}%` }}
                />
                <div className="t1d-glucose-gauge__marker" style={{ left: `${gaugePct}%` }} />
              </div>
              <div className={`mt-3 flex justify-between text-sm font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{copy.lowZone}</span>
                <span>{copy.targetBand}</span>
                <span>{copy.highZone}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { label: copy.timeInRange, value: `${chart.timeInRangePct}%` },
              { label: dataFieldLabel, value: dataStatusLabel },
              { label: responderLabel, value: currentState.responder },
            ].map((stat) => (
              <div key={stat.label} className={`t1d-glucose-stat ${theme === 'dark' ? 't1d-glucose-stat--dark' : ''}`}>
                <p className={fieldLabelClass}>{stat.label}</p>
                <p className="t1d-glucose-stat__value t1d-glucose-stat__value--sm">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
