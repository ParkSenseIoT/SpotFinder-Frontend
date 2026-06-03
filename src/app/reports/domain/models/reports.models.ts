export enum ReportType {
  OCCUPANCY = 'OCCUPANCY',
  REVENUE = 'REVENUE',
  PEAK_HOURS = 'PEAK_HOURS',
  HEATMAP = 'HEATMAP',
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
}

export enum ReportStatus {
  GENERATING = 'GENERATING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export interface AdminReport {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  generatedBy: string;
  fileUrl?: string;
  sizeBytes?: number;
}

export interface GenerateReportRequest {
  name: string;
  type: ReportType;
  format: ReportFormat;
  periodStart: string;
  periodEnd: string;
}
