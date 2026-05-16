export type ReportStatus = 'GENERATING' | 'READY' | 'FAILED';
export type ReportType = 'OCCUPANCY' | 'REVENUE' | 'PEAK_HOURS' | 'HEATMAP';

export interface AnalyticsReport {
  id: number;
  reportType: ReportType;
  periodStart: string | null;
  periodEnd: string | null;
  generatedAt: string | null;
  status: ReportStatus;
  fileUrl: string | null;
  facilityId: number | null;
  downloadUrl: string | null;
}

export interface GenerateReportPayload {
  reportType: ReportType;
  startDate: string;
  endDate: string;
  generatedBy: number | null;
  facilityId: number | null;
}

export interface ReportResource {
  id: number;
  reportType: string;
  periodStart: string | null;
  periodEnd: string | null;
  generatedAt: string | null;
  status: string | null;
  fileUrl: string | null;
  facilityId: number | null;
}
