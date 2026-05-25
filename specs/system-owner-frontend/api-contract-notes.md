# System Owner API Contract Notes

## Review Status

Phase 0 reviewed the frontend repository API documentation and attempted to fetch local Swagger JSON from `http://localhost:3000/api/docs-json`.

The local backend was not running in this environment, so live Swagger endpoint paths, DTO schemas, exact billing endpoints, and `/owner/settings` authorization could not be fully confirmed from Swagger. The implementation must treat the items below as contract notes pending final Swagger verification.

Repo documentation reviewed:

- `docs/API_SPEC.md`
- `docs/API_USAGE_GUIDE.md`
- `docs/DEPLOYMENT.md`
- Existing System Owner planning artifacts under `specs/system-owner-frontend/`

Global API notes confirmed from repository docs:

- Runtime API routes are versioned under `/v1`; deployments may expose the API through an `/api` gateway prefix.
- Development base URL documented as `http://localhost:3000` with environment value `TRACKORA_API_BASE_URL=http://localhost:3000/v1`.
- Auth uses Bearer tokens.
- Most list endpoints use pagination via `page` and `limit`.
- Current pagination shape is documented primarily as `{ "data": [...], "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 } }`.
- Older docs also show `{ "data": [...], "total": 100, "page": 1, "limit": 20 }`; owner implementation must normalize both if backend still returns mixed shapes.
- Error shape is documented both as `{ "success": false, "data": null, "error": { "code", "message", "details" } }` and `{ "statusCode": 400, "message": "..." }`; owner implementation must map both until Swagger confirms one canonical shape.
- Standard auth and authorization status handling: `401` for missing/invalid token, `403` for insufficient permissions.

## Analytics

Planned endpoints from owner spec:

| Method | Endpoint                        | Swagger Status                     |
| ------ | ------------------------------- | ---------------------------------- |
| GET    | `/platform/analytics/overview`  | Pending live Swagger confirmation. |
| GET    | `/platform/analytics/usage`     | Pending live Swagger confirmation. |
| GET    | `/platform/analytics/revenue`   | Pending live Swagger confirmation. |
| GET    | `/platform/analytics/shipments` | Pending live Swagger confirmation. |

DTOs to confirm:

- Platform overview counts.
- Usage aggregates.
- Revenue aggregates.
- Shipment aggregates.
- Alert item shape.
- Top tenants by shipment volume shape.

## Tenants

Planned endpoints from owner spec:

| Method | Endpoint                              | Swagger Status                     |
| ------ | ------------------------------------- | ---------------------------------- |
| GET    | `/platform/tenants`                   | Pending live Swagger confirmation. |
| POST   | `/platform/tenants`                   | Pending live Swagger confirmation. |
| GET    | `/platform/tenants/:id`               | Pending live Swagger confirmation. |
| PATCH  | `/platform/tenants/:id`               | Pending live Swagger confirmation. |
| PATCH  | `/platform/tenants/:id/status`        | Pending live Swagger confirmation. |
| GET    | `/platform/tenants/:id/usage`         | Pending live Swagger confirmation. |
| GET    | `/platform/tenants/:id/users`         | Pending live Swagger confirmation. |
| GET    | `/platform/tenants/:id/billing`       | Pending live Swagger confirmation. |
| GET    | `/platform/tenants/:id/feature-flags` | Pending live Swagger confirmation. |

DTOs to confirm:

- Tenant list item and detail shape.
- Tenant create and update request shape.
- Tenant status enum and status mutation request shape.
- Required `reason` field for status mutation.
- Tenant usage, users summary, billing summary, and feature flag summary shapes.

## Plans

Planned endpoints from owner spec:

| Method | Endpoint              | Swagger Status                     |
| ------ | --------------------- | ---------------------------------- |
| GET    | `/platform/plans`     | Pending live Swagger confirmation. |
| POST   | `/platform/plans`     | Pending live Swagger confirmation. |
| GET    | `/platform/plans/:id` | Pending live Swagger confirmation. |
| PATCH  | `/platform/plans/:id` | Pending live Swagger confirmation. |
| DELETE | `/platform/plans/:id` | Pending live Swagger confirmation. |

DTOs to confirm:

- Plan list item and detail shape.
- Plan pricing and currency fields.
- Plan limit fields.
- Plan feature entitlement fields.
- Archive versus delete behavior and response codes.

## Subscriptions

Planned endpoints from owner spec:

| Method | Endpoint                                  | Swagger Status                     |
| ------ | ----------------------------------------- | ---------------------------------- |
| GET    | `/platform/subscriptions`                 | Pending live Swagger confirmation. |
| GET    | `/platform/subscriptions/:id`             | Pending live Swagger confirmation. |
| PATCH  | `/platform/subscriptions/:id`             | Pending live Swagger confirmation. |
| POST   | `/platform/subscriptions/:id/change-plan` | Pending live Swagger confirmation. |
| POST   | `/platform/subscriptions/:id/cancel`      | Pending live Swagger confirmation. |
| POST   | `/platform/subscriptions/:id/renew`       | Pending live Swagger confirmation. |

DTOs to confirm:

- Subscription list item and detail shape.
- Subscription status enum.
- Payment status enum.
- Change plan request shape.
- Cancel request shape and required reason field.
- Renew request shape.
- Usage against limits shape.

## Feature Flags

Planned endpoints from owner spec:

| Method | Endpoint                                   | Swagger Status                     |
| ------ | ------------------------------------------ | ---------------------------------- |
| GET    | `/platform/feature-flags`                  | Pending live Swagger confirmation. |
| PATCH  | `/platform/feature-flags/:key`             | Pending live Swagger confirmation. |
| GET    | `/platform/tenants/:id/feature-flags`      | Pending live Swagger confirmation. |
| PATCH  | `/platform/tenants/:id/feature-flags/:key` | Pending live Swagger confirmation. |

Flags planned by product spec:

- `smart_dispatch`
- `fraud_detection`
- `cod_wallet`
- `bulk_upload`
- `whatsapp_notifications`
- `api_access`
- `public_tracking`
- `advanced_reports`

DTOs to confirm:

- Global flag shape.
- Tenant override shape.
- Plan inherited flag shape.
- Effective flag response shape.
- Override/inherit/null request semantics.
- Required `reason` field for mutations.

## Billing

Exact billing endpoints are not present in the repository docs and require live Swagger confirmation.

Expected endpoint areas to confirm:

- Billing summary.
- Unpaid tenants.
- Past due tenants.
- Invoice list.
- Manual invoice creation if supported.
- Billing summary export.
- Tenant billing detail under `/platform/tenants/:id/billing`.

DTOs to confirm:

- Billing summary shape.
- Invoice list item and detail shape.
- Manual invoice request shape.
- Export response shape.
- Finance-only permission behavior.

## Audit Logs

Planned endpoint from owner spec:

| Method | Endpoint               | Swagger Status                     |
| ------ | ---------------------- | ---------------------------------- |
| GET    | `/platform/audit-logs` | Pending live Swagger confirmation. |

Repo docs also document tenant-admin audit logs at `/admin/audit-logs`; owner implementation must not reuse that route unless Swagger states platform audit logs are aliased there.

DTOs to confirm:

- Audit log list item shape.
- Actor, tenant, action, resource, date filters.
- Old/new value shape.
- Reason field.
- IP and user agent fields.
- Sensitive value masking expectations.

## Support And Impersonation

Planned endpoints from owner spec:

| Method | Endpoint                               | Swagger Status                     |
| ------ | -------------------------------------- | ---------------------------------- |
| GET    | `/platform/support/tenants/search`     | Pending live Swagger confirmation. |
| GET    | `/platform/support/tenants/:id/health` | Pending live Swagger confirmation. |
| POST   | `/platform/tenants/:id/impersonate`    | Pending live Swagger confirmation. |
| POST   | `/platform/impersonation/end`          | Pending live Swagger confirmation. |
| GET    | `/auth/me`                             | Pending live Swagger confirmation. |

DTOs to confirm:

- Tenant search result shape.
- Tenant health shape.
- Impersonation start request shape and required reason field.
- Impersonation session response shape.
- Impersonation end response shape.
- `/auth/me` active impersonation context shape.

## Platform Auth Context

`/auth/me` must be confirmed in Swagger for platform-owner requirements.

Fields to confirm:

- User id.
- Name.
- Email or phone.
- Platform role values: `PLATFORM_OWNER`, `PLATFORM_ADMIN`, `PLATFORM_SUPPORT`, `PLATFORM_FINANCE`.
- Permissions array values.
- Active tenant context if impersonating.
- Active impersonation session if impersonating.
- Locale and direction preferences if provided.

## Permissions

Owner spec requires these permissions:

- `manage_tenants`
- `manage_plans`
- `manage_subscriptions`
- `view_platform_analytics`
- `manage_feature_flags`
- `view_audit_logs`
- `impersonate_tenant_admin`
- `view_billing`
- `suspend_tenants`

The exact permission required for `/owner/settings` is not available in repository docs and must be confirmed from Swagger/backend authorization metadata before Phase 2.

## Phase 1 Impact

Phase 1 does not implement API calls, repositories, feature logic, auth guards, or permission guards.

These notes are recorded so Phase 2 and later phases can align routes, guards, DTOs, repositories, and error handling with live Swagger before feature implementation.
