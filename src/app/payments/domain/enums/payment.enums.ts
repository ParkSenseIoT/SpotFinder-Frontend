/** Aligns with backend payment lifecycle values. */
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/** Aligns with backend payment method values. */
export enum PaymentMethod {
  YAPE = 'YAPE',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
}

export enum PaymentReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
}

export enum PaymentReportStatus {
  READY = 'READY',
  GENERATING = 'GENERATING',
  FAILED = 'FAILED',
}
