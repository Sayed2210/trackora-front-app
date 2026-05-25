import { TenantStatus } from '../../domain/models/tenant.models';

export const tenantBreadcrumbs = (current: string) => [
  { label: 'المالك', href: '/owner/overview' },
  { label: 'المستأجرون', href: '/owner/tenants' },
  { label: current },
];

export const formatDate = (value: string | undefined): string => {
  if (!value) {
    return 'غير متاح';
  }
  return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date(value));
};

export const tenantStatusLabel = (status: TenantStatus | string | undefined): string => {
  const labels: Record<string, string> = {
    TRIAL: 'تجريبي',
    ACTIVE: 'نشط',
    SUSPENDED: 'موقوف',
    CANCELLED: 'ملغي',
    PAST_DUE: 'متأخر الدفع',
  };
  return labels[status ?? ''] ?? 'غير معروف';
};

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
