export interface BulkUploadResultDto {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: Array<{ rowIndex: number; message: string }>;
  shipments?: Array<{
    id: string;
    trackingNumber: string;
    customerName: string;
    customerPhone: string;
    status: string;
    zoneId?: string | null;
  }>;
}
