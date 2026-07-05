/** Normalize Dexcom/mock reading into immutable-shaped record. */
export const normalizeReading = (reading, source = 'dexcom') => {
  if (!reading || !Number.isFinite(Number(reading.glucose))) return null;
  const timestamp = reading.timestamp || reading.latestTimestamp || new Date().toISOString();
  return {
    id: String(reading.id || `${source}-${timestamp}`),
    source,
    timestamp,
    glucoseMgDl: Number(reading.glucose),
    trend: String(reading.trend || 'unknown'),
    receivedAt: new Date().toISOString(),
  };
};

export const dedupeReadings = (readings) => {
  const seen = new Set();
  return readings.filter((reading) => {
    const key = `${reading.timestamp}:${reading.glucoseMgDl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const sortReadingsAsc = (readings) =>
  [...readings].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
