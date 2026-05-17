import {
  AnalyticsData,
  HeatmapEntryResource,
  OccupancyMetricsResource,
  PeakHoursResource,
  RevenueMetricsResource,
  TrendEntry,
  ZoneDensity,
} from '../../domain/models/analytics.models';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const HOUR_LABELS = Array.from({ length: 24 }, (_, h) =>
  `${h.toString().padStart(2, '0')}:00`
);

export function buildAnalyticsData(
  occupancy: OccupancyMetricsResource,
  revenue: RevenueMetricsResource,
  heatmap: HeatmapEntryResource[],
  peakHours: PeakHoursResource
): AnalyticsData {
  const occupancyRate = clampRate(occupancy.averageOccupancyRate);
  const totalSlots = occupancy.totalSlots ?? 0;
  const occupiedSlots = Math.round((occupancyRate / 100) * totalSlots);

  const trends = buildTrendSeries(revenue, peakHours);
  const zones = buildZoneDensity(heatmap);

  const peakTimeLabel = peakHours.peakHours?.length
    ? `${formatHour(peakHours.peakHours[0])} - ${formatHour(
        peakHours.peakHours[peakHours.peakHours.length - 1] + 1
      )}`
    : '—';

  const averageStayMinutes = computeAverageStayMinutes(heatmap);

  return {
    kpis: {
      occupancy: {
        value: round2(occupancyRate),
        trend: 0,
        activeSpots: occupiedSlots,
        totalSpots: totalSlots,
      },
      revenue: {
        value: numberFromAny(revenue.totalRevenue),
        trend: 0,
        projected: projectEndOfDay(revenue),
      },
      stayDuration: {
        hours: Math.floor(averageStayMinutes / 60),
        minutes: Math.round(averageStayMinutes % 60),
        trend: 0,
        peakTime: peakTimeLabel,
      },
      systemHealth: {
        uptime: 100,
        status: 'ALL NODES ONLINE',
        lastScan: 'just now',
      },
    },
    trends,
    zones,
    recentEvents: [],
    currency: revenue.currency ?? 'PEN',
  };
}

function buildTrendSeries(
  revenue: RevenueMetricsResource,
  peakHours: PeakHoursResource
): TrendEntry[] {
  const byDayKeys = Object.keys(revenue.dataByDay ?? {}).sort();
  if (byDayKeys.length > 0) {
    return byDayKeys.slice(-7).map((dateKey) => {
      const value = numberFromAny(revenue.dataByDay[dateKey]);
      const dayLabel = DAY_LABELS[new Date(dateKey).getDay()] ?? dateKey;
      return { day: dayLabel, value: round2(value) };
    });
  }

  const occupancyByHour = peakHours.occupancyByHour ?? {};
  return Object.entries(occupancyByHour)
    .sort(([a], [b]) => Number(a) - Number(b))
    .slice(0, 7)
    .map(([hour, value]) => ({
      day: `${hour}h`,
      value: round2(numberFromAny(value)),
    }));
}

function buildZoneDensity(heatmap: HeatmapEntryResource[]): ZoneDensity[] {
  if (!heatmap?.length) return [];

  const byZone = new Map<string, { total: number; count: number }>();
  for (const entry of heatmap) {
    const zone = extractZone(entry.slotCode);
    const cur = byZone.get(zone) ?? { total: 0, count: 0 };
    cur.total += entry.usageCount;
    cur.count += 1;
    byZone.set(zone, cur);
  }

  const max = Math.max(...[...byZone.values()].map((z) => z.total / z.count), 1);
  return [...byZone.entries()].map(([name, { total, count }]) => {
    const usage = total / count;
    const percent = Math.round((usage / max) * 100);
    return {
      name: `ZONE ${name}`,
      occupancyPercent: percent,
      status: percent >= 80 ? ('critical' as const) : ('normal' as const),
    };
  });
}

function extractZone(slotCode: string | undefined): string {
  if (!slotCode) return '—';
  const letter = slotCode.charAt(0).toUpperCase();
  return letter || '—';
}

function projectEndOfDay(revenue: RevenueMetricsResource): number {
  const total = numberFromAny(revenue.totalRevenue);
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  if (hours <= 0) return total;
  const projected = (total / hours) * 24;
  return Math.round(projected * 100) / 100;
}

function computeAverageStayMinutes(heatmap: HeatmapEntryResource[]): number {
  if (!heatmap?.length) return 0;
  const total = heatmap.reduce((sum, e) => sum + (e.averageDurationMinutes ?? 0), 0);
  return total / heatmap.length;
}

function clampRate(value: number): number {
  const num = numberFromAny(value);
  if (num <= 1) return num * 100;
  return Math.min(num, 100);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function numberFromAny(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatHour(hour: number): string {
  if (hour < 0 || hour > 24) return `${hour}:00`;
  return HOUR_LABELS[hour % 24];
}
