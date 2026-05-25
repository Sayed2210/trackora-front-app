export type AuditLogSeverity =
  | 'info'
  | 'warning'
  | 'danger'
  | 'success'
  | 'neutral';

export interface AuditActor {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuditTenant {
  id: string;
  name: string;
  slug: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: AuditActor;
  tenant: AuditTenant | null;
  resourceType: string;
  resourceId: string;
  reason: string;
  timestamp: string | null;
  ipAddress: string;
  userAgent: string;
  status: string;
  severity: AuditLogSeverity;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditLogsQuery {
  actor?: string;
  tenant?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'timestamp' | 'action' | 'resourceType' | 'actor' | 'tenant';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface AuditLogsPage {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditLogsState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
