import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { AnalyticsData } from '../../domain/models/analytics.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsMockService {

  getAnalyticsData(): Observable<AnalyticsData> {
    const mockData: AnalyticsData = {
      kpis: {
        occupancy: { value: 87.4, trend: 2.1, activeSpots: 2185, totalSpots: 2500 },
        revenue: { value: 14290, trend: 12.5, projected: 16500 },
        stayDuration: { hours: 2, minutes: 15, trend: -4.2, peakTime: '14:00 - 16:30' },
        systemHealth: { uptime: 99.9, status: 'ALL NODES ONLINE', lastScan: '2s ago' }
      },
      trends: [
        { day: 'MON', value: 35 }, { day: 'TUE', value: 55 },
        { day: 'WED', value: 65 }, { day: 'THU', value: 80 },
        { day: 'FRI', value: 75 }, { day: 'SAT', value: 50 },
        { day: 'SUN', value: 85 }
      ],
      zones: [
        { name: 'ZONE A', occupancyPercent: 98, status: 'critical' },
        { name: 'ZONE B', occupancyPercent: 42, status: 'normal' }
      ],
      recentEvents: [
        { eventId: '#EV-90211', timestamp: '14:22:04', location: 'North Gate - L1', plateOrId: 'CA-8XF92', action: 'Entry Authorization', status: 'GRANTED' },
        { eventId: '#EV-90212', timestamp: '14:22:15', location: 'Zone C - P142', plateOrId: 'NY-442KK', action: 'Space Occupied', status: 'LOGGED' },
        { eventId: '#EV-90213', timestamp: '14:23:01', location: 'Exit Gate - L2', plateOrId: 'TX-190LL', action: 'Payment Processed', status: 'COMPLETE' },
        { eventId: '#EV-90214', timestamp: '14:23:45', location: 'South Gate - L1', plateOrId: 'UNKNOWN', action: 'Unauthorized Entry', status: 'BLOCKED' }
      ]
    };

    return of(mockData).pipe(delay(500));
  }
}
