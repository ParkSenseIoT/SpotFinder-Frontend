import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AnalyticsReport,
  GenerateReportPayload,
  ReportResource,
  ReportStatus,
  ReportType,
} from '../../domain/models/report.models';

@Injectable({ providedIn: 'root' })
export class ReportsHttpService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.apiPrefix}/reports`;

  /** GET /api/v1/reports?facilityId= */
  list(facilityId?: number): Observable<AnalyticsReport[]> {
    let params = new HttpParams();
    if (facilityId !== undefined) {
      params = params.set('facilityId', facilityId.toString());
    }
    return this.http
      .get<ReportResource[]>(this.baseUrl, { params })
      .pipe(map((rows) => rows.map((r) => toReport(r, this.baseUrl))));
  }

  /** GET /api/v1/reports/{id} */
  getById(id: number): Observable<AnalyticsReport> {
    return this.http
      .get<ReportResource>(`${this.baseUrl}/${id}`)
      .pipe(map((r) => toReport(r, this.baseUrl)));
  }

  /** POST /api/v1/reports */
  generate(payload: GenerateReportPayload): Observable<AnalyticsReport> {
    return this.http
      .post<ReportResource>(this.baseUrl, payload)
      .pipe(map((r) => toReport(r, this.baseUrl)));
  }

  /** GET /api/v1/reports/{id}/download */
  download(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob',
    });
  }
}

function toReport(resource: ReportResource, baseUrl: string): AnalyticsReport {
  const status = mapStatus(resource.status, resource.fileUrl);
  return {
    id: resource.id,
    reportType: parseEnum<ReportType>(resource.reportType, 'OCCUPANCY'),
    periodStart: resource.periodStart,
    periodEnd: resource.periodEnd,
    generatedAt: resource.generatedAt,
    status,
    fileUrl: resource.fileUrl,
    facilityId: resource.facilityId,
    downloadUrl: status === 'READY' ? `${baseUrl}/${resource.id}/download` : null,
  };
}

function mapStatus(status: string | null | undefined, fileUrl: string | null): ReportStatus {
  const upper = status?.toUpperCase();
  if (upper === 'FAILED') return 'FAILED';
  if (upper === 'READY' || fileUrl) return 'READY';
  return 'GENERATING';
}

function parseEnum<T extends string>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  return value as T;
}
