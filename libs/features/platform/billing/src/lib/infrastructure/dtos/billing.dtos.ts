export interface BillingListDto<T> {
  data?: unknown;
  items?: unknown;
  results?: unknown;
  tenants?: unknown;
  invoices?: unknown;
  meta?: {
    page?: unknown;
    limit?: unknown;
    pageSize?: unknown;
    total?: unknown;
    totalPages?: unknown;
  };
  total?: unknown;
  count?: unknown;
  page?: unknown;
  limit?: unknown;
  pageSize?: unknown;
  page_size?: unknown;
  _item?: T;
}

export interface BillingOverviewDto {
  summary?: unknown;
  platformSummary?: unknown;
  platform_summary?: unknown;
  revenue?: unknown;
  revenueSummary?: unknown;
  revenue_summary?: unknown;
  unpaidTenants?: unknown;
  unpaid_tenants?: unknown;
  pastDueTenants?: unknown;
  past_due_tenants?: unknown;
  manualInvoices?: unknown;
  manualInvoiceSummary?: unknown;
  manual_invoice_summary?: unknown;
  billingHealth?: unknown;
  billing_health?: unknown;
  alerts?: unknown;
  exportSupported?: unknown;
  export_supported?: unknown;
}

export interface BillingTenantDto {
  id?: unknown;
  _id?: unknown;
  tenantId?: unknown;
  tenant_id?: unknown;
  name?: unknown;
  tenantName?: unknown;
  tenant_name?: unknown;
  slug?: unknown;
  tenantSlug?: unknown;
  tenant_slug?: unknown;
  status?: unknown;
  amountDue?: unknown;
  amount_due?: unknown;
  balance?: unknown;
  currency?: unknown;
  dueDate?: unknown;
  due_date?: unknown;
  invoiceCount?: unknown;
  invoice_count?: unknown;
}

export interface BillingAlertDto {
  id?: unknown;
  key?: unknown;
  severity?: unknown;
  type?: unknown;
  title?: unknown;
  message?: unknown;
  description?: unknown;
}

export interface PlatformInvoiceDto {
  id?: unknown;
  _id?: unknown;
  number?: unknown;
  invoiceNumber?: unknown;
  invoice_number?: unknown;
  tenant?: unknown;
  tenantId?: unknown;
  tenant_id?: unknown;
  tenantName?: unknown;
  tenant_name?: unknown;
  tenantSlug?: unknown;
  tenant_slug?: unknown;
  amount?: unknown;
  total?: unknown;
  amountDue?: unknown;
  amount_due?: unknown;
  currency?: unknown;
  status?: unknown;
  paymentStatus?: unknown;
  payment_status?: unknown;
  dueDate?: unknown;
  due_date?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
}
