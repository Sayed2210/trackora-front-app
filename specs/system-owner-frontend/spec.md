# Trackora System Owner Frontend App Specification

## Product Definition

The Trackora System Owner App is an authenticated operational dashboard for Trackora platform owners who manage the full SaaS platform across all tenants and shipping companies.

The app is served under the `/owner` route prefix and is separate from the public website, tenant admin dashboard, merchant portal, and courier app.

The System Owner App is used by internal platform-level users to manage tenants, subscription plans, subscriptions, platform feature flags, usage, billing overview, platform analytics, audit logs, support workflows, and tenant admin impersonation.

The app differs from the Tenant Admin Dashboard because it operates across the entire platform rather than inside a single tenant. Tenant Admin users manage their own company, users, shipments, merchants, couriers, reports, and settings. System Owner users manage SaaS-level entities, platform-wide controls, billing visibility, support tools, and tenant lifecycle operations.

Problems solved:

- Give platform owners one secure place to monitor the health of the Trackora SaaS platform.
- Allow platform admins to create, update, activate, suspend, or cancel tenants.
- Allow controlled management of subscription plans, subscriptions, limits, and feature entitlements.
- Provide platform analytics, revenue, shipment, usage, and fraud visibility.
- Provide support tooling for tenant health checks and controlled impersonation.
- Provide audit visibility for sensitive platform actions.
- Reduce operational risk by requiring permissions, reasons, confirmations, and audit-friendly UI flows.

Out of scope:

- Public marketing website.
- Tenant Admin Dashboard functionality.
- Merchant portal functionality.
- Courier mobile/app workflows.
- Backend API implementation.
- Backend permission model changes.
- Payment processor implementation.
- Replacing Swagger as the API source of truth.
- Building custom design tokens outside Trackora tokens.

## Roles & Permissions

Supported backend platform roles:

| Role | Purpose |
|------|---------|
| PLATFORM_OWNER | Full platform ownership and access to all owner capabilities. |
| PLATFORM_ADMIN | Platform administration excluding finance-only or owner-only sensitive actions where applicable. |
| PLATFORM_SUPPORT | Support workflows, tenant health inspection, and controlled impersonation. |
| PLATFORM_FINANCE | Billing, invoices, subscription payment visibility, and finance reporting. |

Supported backend permissions:

| Permission | Usage |
|------------|-------|
| manage_tenants | Create, edit, activate, suspend, cancel tenants. |
| manage_plans | Create, edit, archive, delete plans. |
| manage_subscriptions | Change, renew, cancel, and update subscriptions. |
| view_platform_analytics | View overview, usage, revenue, and shipment analytics. |
| manage_feature_flags | Manage global and tenant feature flags. |
| view_audit_logs | View platform audit logs. |
| impersonate_tenant_admin | Start and end tenant admin impersonation sessions. |
| view_billing | View billing overview, invoices, unpaid and past-due tenants. |
| suspend_tenants | Suspend tenants through reason-required workflow. |

Route guard plan:

| Route Area | Required Access |
|------------|-----------------|
| `/owner` and `/owner/overview` | Platform role plus `view_platform_analytics`. |
| `/owner/tenants` | Platform role plus `manage_tenants` for mutations. |
| `/owner/plans` | Platform role plus `manage_plans`. |
| `/owner/subscriptions` | Platform role plus `manage_subscriptions`. |
| `/owner/usage` | Platform role plus `view_platform_analytics`. |
| `/owner/billing` and `/owner/invoices` | Platform role plus `view_billing`; finance role preferred. |
| `/owner/feature-flags` | Platform role plus `manage_feature_flags`. |
| `/owner/audit-logs` | Platform role plus `view_audit_logs`. |
| `/owner/support` | Platform role plus support permissions. |
| `/owner/settings` | Platform role, exact permissions to be aligned with Swagger. |

UI permission visibility:

- Unauthorized navigation items are hidden.
- Unauthorized actions are hidden or disabled based on UX risk.
- Direct route access without permission shows a forbidden state.
- Sensitive actions require a reason modal.
- Destructive actions require confirmation.
- Impersonation state is always visible through a persistent banner.

## Main Modules

### Owner Overview Dashboard

Routes:

| Route | Purpose |
|-------|---------|
| `/owner` | Redirect or render overview dashboard. |
| `/owner/overview` | Platform overview dashboard. |

Widgets:

| Widget | Source |
|--------|--------|
| Total tenants | Platform analytics overview. |
| Active tenants | Platform analytics overview. |
| Trial tenants | Platform analytics overview. |
| Suspended tenants | Platform analytics overview. |
| Total shipments | Platform analytics shipments. |
| Active merchants | Platform analytics usage. |
| Active couriers | Platform analytics usage. |
| COD volume | Platform analytics revenue. |
| Payout volume | Platform analytics revenue. |
| Fraud flagged shipments | Platform analytics shipments. |
| Top tenants by shipment volume | Platform analytics usage or shipments. |
| Alerts | Platform analytics overview. |

Backend endpoints:

| Method | Endpoint |
|--------|----------|
| GET | `/platform/analytics/overview` |
| GET | `/platform/analytics/usage` |
| GET | `/platform/analytics/revenue` |
| GET | `/platform/analytics/shipments` |

### Tenants Management

Routes:

| Route | Purpose |
|-------|---------|
| `/owner/tenants` | Tenant list, search, filters, pagination. |
| `/owner/tenants/create` | Create tenant. |
| `/owner/tenants/:tenantId` | Tenant details. |
| `/owner/tenants/:tenantId/usage` | Tenant usage. |
| `/owner/tenants/:tenantId/users` | Tenant users summary. |
| `/owner/tenants/:tenantId/billing` | Tenant billing summary. |
| `/owner/tenants/:tenantId/feature-flags` | Tenant feature flags. |

Features:

- Tenants table.
- Search.
- Filters by status, plan, and date.
- Pagination.
- Create tenant.
- Edit tenant.
- Activate, suspend, and cancel tenant.
- Reason-required status changes.
- Tenant usage cards.
- Tenant users summary.
- Billing summary.
- Feature flag summary.

Backend endpoints:

| Method | Endpoint |
|--------|----------|
| GET | `/platform/tenants` |
| POST | `/platform/tenants` |
| GET | `/platform/tenants/:id` |
| PATCH | `/platform/tenants/:id` |
| PATCH | `/platform/tenants/:id/status` |
| GET | `/platform/tenants/:id/usage` |
| GET | `/platform/tenants/:id/users` |
| GET | `/platform/tenants/:id/billing` |
| GET | `/platform/tenants/:id/feature-flags` |

### Plans Management

Routes:

| Route | Purpose |
|-------|---------|
| `/owner/plans` | Plans table/cards. |
| `/owner/plans/create` | Create plan. |
| `/owner/plans/:planId` | Plan details. |
| `/owner/plans/:planId/edit` | Edit plan. |

Features:

- Plans table/cards.
- Create and edit plan.
- Archive/delete safe behavior.
- Plan limits.
- Plan feature entitlements.
- Starter, Growth, Pro, and Enterprise display.
- Pricing and currency display.

Backend endpoints:

| Method | Endpoint |
|--------|----------|
| GET | `/platform/plans` |
| POST | `/platform/plans` |
| GET | `/platform/plans/:id` |
| PATCH | `/platform/plans/:id` |
| DELETE | `/platform/plans/:id` |

### Subscriptions Management

Routes:

| Route | Purpose |
|-------|---------|
| `/owner/subscriptions` | Subscriptions list. |
| `/owner/subscriptions/:subscriptionId` | Subscription details. |

Features:

- Subscriptions table.
- Filters by status, paymentStatus, tenant, and plan.
- Subscription details.
- Change plan.
- Renew.
- Cancel.
- Update payment status.
- Reason-required mutations.
- Usage against limits.

Backend endpoints:

| Method | Endpoint |
|--------|----------|
| GET | `/platform/subscriptions` |
| GET | `/platform/subscriptions/:id` |
| PATCH | `/platform/subscriptions/:id` |
| POST | `/platform/subscriptions/:id/change-plan` |
| POST | `/platform/subscriptions/:id/cancel` |
| POST | `/platform/subscriptions/:id/renew` |

### Feature Flags

Routes:

| Route | Purpose |
|-------|---------|
| `/owner/feature-flags` | Global feature flags. |
| `/owner/tenants/:tenantId/feature-flags` | Tenant-specific feature flags. |

Features:

- Global flags.
- Tenant overrides.
- Plan inherited flags.
- Effective flag view.
- Enable/disable with reason.
- Override/inherit/null semantics.
- Audit warning before save.

Backend endpoints:

| Method | Endpoint |
|--------|----------|
| GET | `/platform/feature-flags` |
| PATCH | `/platform/feature-flags/:key` |
| GET | `/platform/tenants/:id/feature-flags` |
| PATCH | `/platform/tenants/:id/feature-flags/:key` |

Flags:

| Flag |
|------|
| smart_dispatch |
| fraud_detection |
| cod_wallet |
| bulk_upload |
| whatsapp_notifications |
| api_access |
| public_tracking |
| advanced_reports |

### Billing Overview

Routes:

| Route | Purpose |
|-------|---------|
| `/owner/billing` | Billing overview. |
| `/owner/invoices` | Invoice list and manual invoices. |

Features:

- Billing summary.
- Unpaid tenants.
- Past due tenants.
- Manual invoices.
- Export billing summary.
- Finance-only access.

Backend endpoints:

- Platform billing endpoints from Swagger.

### Audit Logs

Routes:

| Route | Purpose |
|-------|---------|
| `/owner/audit-logs` | Audit log search and inspection. |

Features:

- Audit log table.
- Filters by actor, tenant, action, resource, and date.
- Old/new value preview.
- Reason display.
- IP and user agent display.
- Sensitive values masked.

Backend endpoints:

| Method | Endpoint |
|--------|----------|
| GET | `/platform/audit-logs` |

### Support And Impersonation

Routes:

| Route | Purpose |
|-------|---------|
| `/owner/support` | Support landing page. |
| `/owner/support/tenants/:tenantId` | Tenant health details. |
| `/owner/support/impersonation` | Impersonation management. |

Features:

- Search tenants.
- View tenant health.
- Start impersonation with reason.
- End impersonation.
- Show active impersonation banner.
- Dangerous action warnings.
- Support-only permissions.

Backend endpoints:

| Method | Endpoint |
|--------|----------|
| GET | `/platform/support/tenants/search` |
| GET | `/platform/support/tenants/:id/health` |
| POST | `/platform/tenants/:id/impersonate` |
| POST | `/platform/impersonation/end` |
| GET | `/auth/me` |

## Route Plan

Required routes:

| Route |
|-------|
| `/owner` |
| `/owner/overview` |
| `/owner/tenants` |
| `/owner/tenants/create` |
| `/owner/tenants/:tenantId` |
| `/owner/tenants/:tenantId/usage` |
| `/owner/tenants/:tenantId/users` |
| `/owner/tenants/:tenantId/billing` |
| `/owner/tenants/:tenantId/feature-flags` |
| `/owner/plans` |
| `/owner/plans/create` |
| `/owner/plans/:planId` |
| `/owner/plans/:planId/edit` |
| `/owner/subscriptions` |
| `/owner/subscriptions/:subscriptionId` |
| `/owner/usage` |
| `/owner/billing` |
| `/owner/invoices` |
| `/owner/feature-flags` |
| `/owner/audit-logs` |
| `/owner/support` |
| `/owner/settings` |

## UI/UX Direction

Design direction:

- Premium operational SaaS dashboard.
- Data-heavy but readable.
- Calm and serious.
- Arabic-first RTL.
- English secondary LTR.
- Desktop/laptop-first.
- Tablet-friendly.
- Not mobile-first.

Layout patterns:

- Sidebar.
- Topbar.
- Global search.
- Breadcrumbs.
- Page headers.
- Filters.
- Data tables.
- Stat cards.
- Status badges.
- Confirmation dialogs.
- Reason-required modal.
- Loading states.
- Empty states.
- Error states.
- Forbidden states.

Trackora tokens:

| Token | Value |
|-------|-------|
| Primary | `#1A3B66` |
| Primary Light | `#3B5998` |
| Accent | `#FF6B6B` |
| Text | `#333333` |
| Text Secondary | `#666666` |
| Background | `#FFFFFF` |
| Surface | `#F5F5F5` |
| Border | `#E0E0E0` |
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |
| Info | `#3B82F6` |

## Frontend Architecture

Architecture style:

- Clean architecture.
- Angular standalone-first structure.
- Feature libraries for owner domain modules.
- Shared reusable UI, data-access, domain, utils, and i18n libraries.

Layers:

| Layer | Responsibility |
|-------|----------------|
| Presentation | Routed pages, smart containers, dumb UI components. |
| Application | Facades and use cases. |
| Infrastructure | Repositories, API services, DTOs, mappers. |
| Domain | Models, enums, permissions, route configs, pure business helpers. |

Suggested structure:

```text
apps/owner/
├── src/app/
│   ├── app.routes.ts
│   ├── layout/
│   ├── pages/
│   ├── guards/
│   └── shell/

libs/features/platform/
├── overview/
├── tenants/
├── plans/
├── subscriptions/
├── feature-flags/
├── billing/
├── audit-logs/
└── support/

libs/shared/
├── ui/
├── data-access/
├── domain/
├── utils/
└── i18n/
```

## API Integration Plan

Swagger/backend API is the source of truth.

API integration responsibilities:

| Item | Responsibility |
|------|----------------|
| PlatformApiClient | Central platform API HTTP wrapper. |
| Auth interceptor | Attach auth token and platform context. |
| Error mapper | Convert backend errors into UI-safe errors. |
| Pagination mapper | Normalize backend pagination to frontend state. |
| DTO mappers | Convert backend DTOs to domain models. |
| Repositories | Feature-specific API abstraction. |

Repositories:

| Repository |
|------------|
| PlatformTenantsRepository |
| PlatformPlansRepository |
| PlatformSubscriptionsRepository |
| PlatformFeatureFlagsRepository |
| PlatformAnalyticsRepository |
| PlatformBillingRepository |
| PlatformAuditLogsRepository |
| PlatformSupportRepository |

## State Management

State strategy:

- Auth global state.
- Permission state.
- Angular Signals for feature state.
- Facades per feature.
- No unnecessary global store usage.

Each feature facade exposes:

| Facade Field |
|--------------|
| data |
| loading |
| error |
| filters |
| pagination |
| selected item |
| actions |

## Security UX

Security requirements:

- Route guard for platform roles only.
- Permission guard per route and action.
- Hide unauthorized actions.
- Show forbidden page for 403.
- Reason modal for sensitive actions.
- Destructive confirmation dialogs.
- Active impersonation banner.
- End impersonation button.
- Clear warnings for dangerous actions.
- Sensitive audit values masked.
- Unauthorized platform routes must not leak tenant admin, merchant, courier, or public website behavior.

## Data Models

Frontend models:

| Model |
|-------|
| PlatformUser |
| Tenant |
| TenantStatus |
| Plan |
| PlanFeatureFlag |
| Subscription |
| SubscriptionStatus |
| PaymentStatus |
| FeatureFlag |
| TenantFeatureFlag |
| PlatformOverview |
| UsageSummary |
| BillingSummary |
| ManualInvoice |
| AuditLog |
| ImpersonationSession |
| TenantHealth |

## Implementation Phases

| Phase | Scope |
|-------|-------|
| Phase 0 | Spec/API alignment from Swagger. |
| Phase 1 | Owner app shell and routing. |
| Phase 2 | Auth, role guard, permission guard. |
| Phase 3 | Shared dashboard UI primitives. |
| Phase 4 | Overview dashboard. |
| Phase 5 | Tenants management. |
| Phase 6 | Plans management. |
| Phase 7 | Subscriptions management. |
| Phase 8 | Feature flags. |
| Phase 9 | Billing overview. |
| Phase 10 | Audit logs. |
| Phase 11 | Support and impersonation. |
| Phase 12 | Final QA. |

## Acceptance Criteria

- Owner app exists as an Angular app named `owner`.
- Owner app is served under `/owner`.
- Owner routes are protected by platform role checks.
- Platform permissions control route access and action visibility.
- All listed owner modules have planned routes and feature boundaries.
- Swagger is used as the source of truth for API contracts.
- Arabic RTL and English LTR are supported.
- Trackora tokens are used consistently.
- No owner dashboard functionality leaks into public website, tenant admin dashboard, merchant portal, or courier app.
