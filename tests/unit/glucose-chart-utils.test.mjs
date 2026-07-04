import { describe, expect, it } from 'vitest';
import {
  buildGlucoseChartLayout,
  estimateSessionTimeInRange,
  mealMarkersForReadings,
  synthesizeSessionGlucoseSeries,
} from '../../src/lib/glucose-chart-utils.ts';

describe('glucose-chart-utils', () => {
  it('builds chart layout with time in range', () => {
    const readings = [
      { id: '1', timestamp: new Date().toISOString(), glucose: 100, trend: 'flat' },
      { id: '2', timestamp: new Date(Date.now() + 60000).toISOString(), glucose: 140, trend: 'up' },
      { id: '3', timestamp: new Date(Date.now() + 120000).toISOString(), glucose: 90, trend: 'down' },
    ];
    const layout = buildGlucoseChartLayout(readings, 'mg/dL', 'type1');
    expect(layout.linePoints.split(' ').length).toBe(3);
    expect(layout.timeInRangePct).toBeGreaterThanOrEqual(0);
    expect(layout.timeInRangePct).toBeLessThanOrEqual(100);
  });

  it('synthesizes stable session series from history entry', () => {
    const entry = {
      id: 'session-demo-1',
      alertsCount: 1,
      escalationCount: 0,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      stage: 'recovery_watch',
      responders: [],
      timeline: [],
    };
    const series = synthesizeSessionGlucoseSeries(entry, 'type2', 8);
    expect(series).toHaveLength(8);
    expect(series.every((point) => point.glucose >= 48 && point.glucose <= 280)).toBe(true);
  });

  it('places meal markers inside reading window', () => {
    const start = Date.now() - 1000 * 60 * 60;
    const readings = Array.from({ length: 6 }, (_, index) => ({
      id: `r-${index}`,
      timestamp: new Date(start + index * 15 * 60 * 1000).toISOString(),
      glucose: 110 + index * 4,
      trend: 'flat',
    }));
    const chart = buildGlucoseChartLayout(readings, 'mg/dL', 'type1');
    const markers = mealMarkersForReadings(
      [
        {
          id: 'meal-1',
          createdAt: new Date(start + 45 * 60 * 1000).toISOString(),
          label: 'Lunch',
          timeLabel: '12:30',
          macros: { carbs: 42, protein: 10, fat: 8, calories: 320 },
        },
      ],
      readings,
      'mg/dL',
      chart,
    );
    expect(markers).toHaveLength(1);
    expect(markers[0].carbs).toBe(42);
    expect(markers[0].x).toBeGreaterThan(0);
  });

  it('estimates session time in range', () => {
    const readings = [
      { id: '1', timestamp: new Date().toISOString(), glucose: 100, trend: 'flat' },
      { id: '2', timestamp: new Date().toISOString(), glucose: 200, trend: 'up' },
    ];
    expect(estimateSessionTimeInRange(readings, 'type1')).toBe(50);
  });
});
