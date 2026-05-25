import {
  AuditLog,
  AuditLogsPage,
  AuditLogSeverity,
} from '../../domain/models/audit-log.models';
import { AuditLogDto, AuditLogsListDto } from '../dtos/audit-log.dtos';

const MASK = '[MASKED]';
const SENSITIVE_KEYS = [
  'password',
  'token',
  'refreshToken',
  'accessToken',
  'otp',
  'secret',
  'apiKey',
  'authorization',
  'bearer',
  'card',
  'bankAccount',
  'nationalId',
  'privateKey',
];

export const mapAuditLogsPage = (
  dto: AuditLogsListDto<AuditLogDto> | AuditLogDto[],
): AuditLogsPage => {
  const list = Array.isArray(dto)
    ? dto
    : (dto.items ??
      dto.data ??
      dto.results ??
      dto.logs ??
      dto.auditLogs ??
      dto.audit_logs);
  const items = Array.isArray(list)
    ? list.map((item) => mapAuditLog(readObject(item) as AuditLogDto))
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

export const maskSensitiveValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(maskSensitiveValue);
  if (!value || typeof value !== 'object') return value;

  return Object.entries(value as Record<string, unknown>).reduce<
    Record<string, unknown>
  >((masked, [key, nested]) => {
    masked[key] = isSensitiveKey(key) ? MASK : maskSensitiveValue(nested);
    return masked;
  }, {});
};

export const formatMaskedJson = (value: unknown): string => {
  const masked = maskSensitiveValue(value);
  if (masked === null || masked === undefined || masked === '')
    return 'لا توجد بيانات';
  if (typeof masked === 'string') return masked;
  try {
    return JSON.stringify(masked, null, 2);
  } catch {
    return 'تعذر عرض البيانات بأمان';
  }
};

const mapAuditLog = (dto: AuditLogDto): AuditLog => {
  const actor = readObject(dto.actor ?? dto.user);
  const tenant = readObject(dto.tenant);
  const resource = readObject(dto.resource);
  const tenantId = readString(
    tenant['id'] ?? tenant['_id'] ?? dto.tenantId ?? dto.tenant_id,
  );
  const tenantName = readString(
    tenant['name'] ?? dto.tenantName ?? dto.tenant_name,
  );

  return {
    id: readString(dto.id ?? dto._id),
    action: readString(dto.action ?? dto.event, 'UNKNOWN_ACTION'),
    actor: {
      id: readString(
        actor['id'] ?? actor['_id'] ?? dto.actorId ?? dto.actor_id,
      ),
      name: readString(
        actor['name'] ?? dto.actorName ?? dto.actor_name,
        'Unknown actor',
      ),
      email: readString(actor['email'] ?? dto.actorEmail ?? dto.actor_email),
      role: readString(
        actor['role'] ?? dto.actorRole ?? dto.actor_role,
        'Unknown role',
      ),
    },
    tenant:
      tenantId || tenantName
        ? {
            id: tenantId,
            name: readString(
              tenant['name'] ?? dto.tenantName ?? dto.tenant_name,
              'Unknown tenant',
            ),
            slug: readString(
              tenant['slug'] ?? dto.tenantSlug ?? dto.tenant_slug,
            ),
          }
        : null,
    resourceType: readString(
      resource['type'] ?? dto.resourceType ?? dto.resource_type,
      'Unknown resource',
    ),
    resourceId: readString(
      resource['id'] ?? resource['_id'] ?? dto.resourceId ?? dto.resource_id,
    ),
    reason: readString(dto.reason),
    timestamp: readNullableString(
      dto.timestamp ?? dto.createdAt ?? dto.created_at,
    ),
    ipAddress: readString(dto.ipAddress ?? dto.ip_address ?? dto.ip),
    userAgent: readString(dto.userAgent ?? dto.user_agent),
    status: readString(dto.status),
    severity: readSeverity(dto.severity ?? dto.level ?? dto.status),
    oldValue: maskSensitiveValue(
      dto.oldValue ?? dto.old_value ?? dto.before ?? dto.previous,
    ),
    newValue: maskSensitiveValue(
      dto.newValue ?? dto.new_value ?? dto.after ?? dto.next,
    ),
  };
};

const isSensitiveKey = (key: string): boolean => {
  const normalized = key.replace(/[_-]/g, '').toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) =>
    normalized.includes(sensitive.toLowerCase()),
  );
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

const readSeverity = (value: unknown): AuditLogSeverity => {
  const severity = readString(value).toLowerCase();
  if (['danger', 'error', 'failed', 'failure'].includes(severity))
    return 'danger';
  if (['warning', 'warn'].includes(severity)) return 'warning';
  if (['success', 'succeeded', 'ok'].includes(severity)) return 'success';
  if (['info', 'notice'].includes(severity)) return 'info';
  return 'neutral';
};
