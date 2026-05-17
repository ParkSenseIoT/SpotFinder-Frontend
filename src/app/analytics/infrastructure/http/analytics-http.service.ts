import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AnalyticsQueryParams,
  HeatmapEntryResource,
  OccupancyMetricsResource,
  PeakHoursResource,
  RevenueMetricsResource,
} from '../../domain/models/analytics.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsHttpService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}${environment.apiPrefix}/analytics`;

  getOccupancy(params: AnalyticsQueryParams = {}): Observable<OccupancyMetricsResource> {
    return this.http.get<OccupancyMetricsResource>(`${this.apiUrl}/occupancy`, {
      params: this.buildParams(params),
    });
  }

  getRevenue(params: AnalyticsQueryParams = {}): Observable<RevenueMetricsResource> {
    return this.http.get<RevenueMetricsResource>(`${this.apiUrl}/revenue`, {
      params: this.buildParams(params),
    });
  }

  getHeatmap(params: AnalyticsQueryParams = {}): Observable<HeatmapEntryResource[]> {
    return this.http.get<HeatmapEntryResource[]>(`${this.apiUrl}/heatmap`, {
      params: this.buildParams(params),
    });
  }

  getPeakHours(params: AnalyticsQueryParams = {}): Observable<PeakHoursResource> {
    return this.http.get<PeakHoursResource>(`${this.apiUrl}/peak-hours`, {
      params: this.buildParams(params),
    });
  }

  private buildParams(params: AnalyticsQueryParams): HttpParams {
    let httpParams = new HttpParams();
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.facilityId !== undefined) {
      httpParams = httpParams.set('facilityId', params.facilityId.toString());
    }
    return httpParams;
  }
}
