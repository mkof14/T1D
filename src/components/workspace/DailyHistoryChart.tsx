import React from 'react';
import type { DiabetesType, Language } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { t1dSoftLabel } from '../../lib/t1d-ui';
import type { DailyHistoryEntry } from '../../lib/api';
import { WORKSPACE_VISUAL_COPY } from '../../content/workspace-visual-copy';
import { GLUCOSE_DISPLAY_COPY } from '../../content/glucose-display-copy';
import {
  CHART_HEIGHT,
  CHART_PAD,
  CHART_WIDTH,
  buildGlucoseChartLayout,
  estimateSessionTimeInRange,
  synthesizeSessionGlucoseSeries,
} from '../../lib/glucose-chart-utils';
import { formatGlucoseValue, glucoseDisplayNumber, type GlucoseUnit } from '../../lib/glucose-units';

type DailyHistoryChartProps = {
  lang: Language;
  theme: T1DTheme;
  isRTL?: boolean;
  diabetesType: DiabetesType;
  glucoseUnit: GlucoseUnit;
  entry: DailyHistoryEntry;
};

export const DailyHistoryChart: React.FC<DailyHistoryChartProps> = ({
  lang,
  theme,
  isRTL = false,
  diabetesType,
  glucoseUnit,
  entry,
}) => {
  const copy = WORKSPACE_VISUAL_COPY[lang];
  const glucoseCopy = GLUCOSE_DISPLAY_COPY[lang];
  const softLabelClass = t1dSoftLabel(theme);
  const readings = synthesizeSessionGlucoseSeries(entry, diabetesType);
  const chart = buildGlucoseChartLayout(readings, glucoseUnit, diabetesType);
  const timeInRange = estimateSessionTimeInRange(readings, diabetesType);
  const average = readings.length
    ? Math.round(readings.reduce((sum, reading) => sum + reading.glucose, 0) / readings.length)
    : null;

  return (
    <div className={`t1d-history-chart ${theme === 'dark' ? 't1d-history-chart--dark' : 't1d-history-chart--light'} ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className={`flex flex-wrap items-end justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <p className={softLabelClass}>{copy.dayChart}</p>
          <p className="mt-1 text-sm font-semibold">
            {diabetesType === 'type2' ? glucoseCopy.type2Target : glucoseCopy.type1Target}
          </p>
        </div>
        <div className={`flex flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <p className={softLabelClass}>{copy.timeInRange}</p>
            <p className="t1d-history-chart__stat">{timeInRange}%</p>
          </div>
          <div>
            <p className={softLabelClass}>{copy.avgGlucose}</p>
            <p className="t1d-history-chart__stat">{average == null ? '—' : formatGlucoseValue(average, glucoseUnit)}</p>
          </div>
          <div>
            <p className={softLabelClass}>{copy.alertsShort}</p>
            <p className="t1d-history-chart__stat">{entry.alertsCount}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="t1d-glucose-chart" role="img" aria-label={copy.dayChart}>
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
                return <circle key={reading.id || index} cx={x} cy={y} r={3.5} className="t1d-glucose-chart__dot" />;
              })}
            </>
          ) : null}
        </svg>
      </div>
    </div>
  );
};
