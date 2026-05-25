import {
  BillingAlert,
  BillingMetric,
  BillingOverview,
  BillingTenantSummary,
  InvoicesPage,
  PlatformInvoice,
} from '../../domain/models/billing.models';
import {
  BillingAlertDto,
  BillingListDto,
  BillingOverviewDto,
  BillingTenantDto,
  PlatformInvoiceDto,
} from '../dtos/billing.dtos';

export const mapBillingOverview = (
  dto: BillingOverviewDto,
): BillingOverview => {
  const summary = dto.summary ?? dto.platformSummary ?? dto.platform_summary;
  const revenue = dto.revenue ?? dto.revenueSummary ?? dto.revenue_summary;
  const manualInvoices =
    dto.manualInvoiceSummary ??
    dto.manual_invoice_summary ??
    dto.manualInvoices;
  const alerts = dto.alerts ?? dto.billingHealth ?? dto.billing_health;

  return {
    summary: mapMetrics(summary),
    revenue: mapMetrics(revenue),
    unpaidTenants: mapTenants(
      dto.unpaidTenants ?? dto.unpaid_tenants,
      'UNPAID',
    ),
    pastDueTenants: mapTenants(
      dto.pastDueTenants ?? dto.past_due_tenants,
      'PAST_DUE',
    ),
    manualInvoiceSummary: mapMetrics(manualInvoices),
    alerts: mapAlerts(alerts),
    exportSupported: readBoolean(
      dto.exportSupported ?? dto.export_supported,
      false,
    ),
    contractNotes: [
      'Billing endpoints are based on the latest available owner contract notes because live Swagger was unavailable in this environment.',
    ],
  };
};

export const mapInvoicesPage = (
  dto: BillingListDto<PlatformInvoiceDto> | PlatformInvoiceDto[],
): InvoicesPage => {
  const list = Array.isArray(dto)
    ? dto
    : (dto.items ?? dto.data ?? dto.results ?? dto.invoices);
  const items = Array.isArray(list)
    ? list.map((item) => mapInvoice(readObject(item) as PlatformInvoiceDto))
    : [];
  const meta = Array.isArray(dto) ? {} : readObject(dto.meta);

  return {
    items,
    total: Array.isArray(dto)
      ? items.length
      : readNumber(meta['total'] ?? dto.total ?? dto.count, items.length),
    page: Array.isArray(dto) ? 1 : readNumber(meta['page'] ?? dto.page, 1),
    pageSize: Array.isArray(dto)
      ? items.length
      : readNumber(
          meta['limit'] ??
            meta['pageSize'] ??
            dto.limit ??
            dto.pageSize ??
            dto.page_size,
          items.length || 20,
        ),
  };
};

const mapInvoice = (dto: PlatformInvoiceDto): PlatformInvoice => {
  const tenant = readObject(dto.tenant);
  const rawAmount = readObject(dto.amount);
  return {
    id: readString(dto.id ?? dto._id),
    number: readString(
      dto.number ?? dto.invoiceNumber ?? dto.invoice_number,
      readString(dto.id ?? dto._id, 'N/A'),
    ),
    tenant: {
      id: readString(
        tenant['id'] ?? tenant['_id'] ?? dto.tenantId ?? dto.tenant_id,
      ),
      name: readString(
        tenant['name'] ?? dto.tenantName ?? dto.tenant_name,
        'Unknown tenant',
      ),
      slug: readString(tenant['slug'] ?? dto.tenantSlug ?? dto.tenant_slug),
    },
    amount: {
      amount: readNullableNumber(
        rawAmount['amount'] ??
          dto.total ??
          dto.amountDue ??
          dto.amount_due ??
          dto.amount,
      ),
      currency: readString(
        rawAmount['currency'] ?? dto.currency,
        'EGP',
      ).toUpperCase(),
    },
    status: readString(dto.status, 'OPEN'),
    paymentStatus: readString(
      dto.paymentStatus ?? dto.payment_status,
      'PENDING',
    ),
    dueDate: readNullableString(dto.dueDate ?? dto.due_date),
    createdAt: readNullableString(dto.createdAt ?? dto.created_at),
  };
};

const mapTenants = (
  value: unknown,
  fallbackStatus: string,
): BillingTenantSummary[] => {
  const list = extractArray(value);
  return list.map((entry) => {
    const dto = readObject(entry) as BillingTenantDto;
    return {
      id: readString(dto.id ?? dto._id ?? dto.tenantId ?? dto.tenant_id),
      name: readString(
        dto.name ?? dto.tenantName ?? dto.tenant_name,
        'Unknown tenant',
      ),
      slug: readString(dto.slug ?? dto.tenantSlug ?? dto.tenant_slug),
      status: readString(dto.status, fallbackStatus),
      amountDue: readNullableNumber(
        dto.amountDue ?? dto.amount_due ?? dto.balance,
      ),
      currency: readString(dto.currency, 'EGP').toUpperCase(),
      dueDate: readNullableString(dto.dueDate ?? dto.due_date),
      invoiceCount: readNullableNumber(dto.invoiceCount ?? dto.invoice_count),
    };
  });
};

const mapAlerts = (value: unknown): BillingAlert[] =>
  extractArray(value).map((entry, index) => {
    const dto = readObject(entry) as BillingAlertDto;
    return {
      id: readString(dto.id ?? dto.key, `billing-alert-${index}`),
      severity: readSeverity(dto.severity ?? dto.type),
      title: readString(dto.title, 'Billing alert'),
      message: readString(dto.message ?? dto.description),
    };
  });

const mapMetrics = (value: unknown): BillingMetric[] => {
  const arrayValue = extractArray(value);
  if (arrayValue.length) {
    return arrayValue.map((entry) => {
      const item = readObject(entry);
      const key = readString(
        item['key'] ?? item['name'] ?? item['label'],
        'metric',
      );
      return {
        key,
        label: readString(
          item['label'] ?? item['title'] ?? item['name'],
          humanize(key),
        ),
        value: readMetricValue(
          item['value'] ?? item['amount'] ?? item['total'] ?? item['count'],
        ),
        currency: readNullableString(item['currency']) ?? undefined,
      };
    });
  }

  return Object.entries(readObject(value)).map(([key, raw]) => {
    const item = readObject(raw);
    return {
      key,
      label: humanize(key),
      value: readMetricValue(
        item['value'] ??
          item['amount'] ??
          item['total'] ??
          item['count'] ??
          raw,
      ),
      currency: readNullableString(item['currency']) ?? undefined,
    };
  });
};

const extractArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  const object = readObject(value);
  const nested =
    object['items'] ?? object['data'] ?? object['results'] ?? object['tenants'];
  return Array.isArray(nested) ? nested : [];
};

const readObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const readString = (value: unknown, fallback = ''): string =>
  typeof value === 'string'
    ? value
    : value === null || value === undefined
      ? fallback
      : String(value);

const readNullableString = (value: unknown): string | null => {
  const text = readString(value).trim();
  return text ? text : null;
};

const readNumber = (value: unknown, fallback = 0): number => {
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const readNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = readNumber(value, Number.NaN);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const readMetricValue = (value: unknown): number | string | null =>
  readNullableNumber(value) ?? readNullableString(value);
const readBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;
const readSeverity = (value: unknown): BillingAlert['severity'] => {
  const severity = readString(value).toLowerCase();
  return severity === 'danger' ||
    severity === 'warning' ||
    severity === 'success' ||
    severity === 'info'
    ? severity
    : 'neutral';
};

const humanize = (value: string): string =>
  value
    .replace(/[_-]/g, ' ')
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
