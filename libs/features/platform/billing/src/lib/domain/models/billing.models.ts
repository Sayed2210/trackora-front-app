export type BillingTenantStatus =
  | 'UNPAID'
  | 'PAST_DUE'
  | 'ACTIVE'
  | 'SUSPENDED'
  | string;
export type InvoiceStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'PAID'
  | 'VOID'
  | 'UNCOLLECTIBLE'
  | 'OVERDUE'
  | string;
export type InvoicePaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'PAST_DUE'
  | 'NOT_REQUIRED'
  | string;

export interface MoneyAmount {
  amount: number | null;
  currency: string;
}

export interface BillingMetric {
  key: string;
  label: string;
  value: number | string | null;
  currency?: string;
}

export interface BillingTenantSummary {
  id: string;
  name: string;
  slug: string;
  status: BillingTenantStatus;
  amountDue: number | null;
  currency: string;
  dueDate: string | null;
  invoiceCount: number | null;
}

export interface BillingAlert {
  id: string;
  severity: 'info' | 'warning' | 'danger' | 'success' | 'neutral';
  title: string;
  message: string;
}

export interface BillingOverview {
  summary: BillingMetric[];
  revenue: BillingMetric[];
  unpaidTenants: BillingTenantSummary[];
  pastDueTenants: BillingTenantSummary[];
  manualInvoiceSummary: BillingMetric[];
  alerts: BillingAlert[];
  exportSupported: boolean;
  contractNotes: string[];
}

export interface PlatformInvoice {
  id: string;
  number: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  amount: MoneyAmount;
  status: InvoiceStatus;
  paymentStatus: InvoicePaymentStatus;
  dueDate: string | null;
  createdAt: string | null;
}

export interface InvoicesQuery {
  tenantId?: string;
  tenant?: string;
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface InvoicesPage {
  items: PlatformInvoice[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BillingState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
