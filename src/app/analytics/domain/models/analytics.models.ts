export interface KpiMetrics {
  occupancy: { value: number; trend: number; activeSpots: number; totalSpots: number };
  revenue: { value: number; trend: number; projected: number };
  stayDuration: { hours: number; minutes: number; trend: number; peakTime: string };
  systemHealth: { uptime: number; status: string; lastScan: string };
}

export interface TrendEntry {
  day: string;
  value: number;
}

export interface ZoneDensity {
  name: string;
  occupancyPercent: number;
  status: 'critical' | 'normal';
}

export interface ActivityEvent {
  eventId: string;
  timestamp: string;
  location: string;
  plateOrId: string;
  action: string;
  status: 'GRANTED' | 'LOGGED' | 'COMPLETE' | 'BLOCKED';
}

export interface AnalyticsData {
  kpis: KpiMetrics;
  trends: TrendEntry[];
  zones: ZoneDensity[];
  recentEvents: ActivityEvent[];
}
