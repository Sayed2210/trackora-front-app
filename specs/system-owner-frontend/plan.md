# Trackora System Owner Frontend App Plan

## Summary

Build a new authenticated Angular app named `owner` inside the existing Trackora Nx frontend workspace.

The app serves Trackora platform owners and internal platform operators under `/owner`. It manages SaaS-level operational domains including tenants, plans, subscriptions, feature flags, usage, billing overview, analytics, audit logs, support tools, and impersonation.

No implementation should begin until Swagger/API alignment is complete.

## Workspace Alignment

Current workspace facts:

| Item | Value |
|------|-------|
| Framework | Angular 21 |
| Workspace | Nx 22 |
| Package manager | npm |
| Existing apps | admin, merchant, courier |
| Existing feature libs | auth, analytics, assignments, courier tasks, payouts, shipments, tracking, wallet |
| Existing shared libs | shared ui, shared domain, shared data-access, shared utils |
| Existing core libs | core api, auth, config, realtime, state |

The owner app should follow existing workspace conventions while keeping platform-owner functionality separated from tenant admin, merchant, courier, and public website concerns.

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Create `apps/owner` | Keeps the platform owner dashboard isolated from existing apps. |
| Use `/owner` prefix | Prevents route conflict with public, tenant admin, merchant, and courier experiences. |
| Use feature libs under `libs/features/platform` | Keeps platform-owner modules grouped by business capability. |
| Use clean architecture | Separates UI, application state, API infrastructure, and domain rules. |
| Use Angular Signals for feature state | Fits modern Angular and avoids unnecessary global store complexity. |
| Keep Auth and Permission global | Authorization is cross-cutting and must be consistent across modules. |
| Use Swagger as source of truth | Backend is already implemented and documented. |

## Proposed Project Structure

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

## Route Architecture

| Route | Module | Access |
|-------|--------|--------|
| `/owner` | Overview | Platform role, analytics permission. |
| `/owner/overview` | Overview | Platform role, analytics permission. |
| `/owner/tenants` | Tenants | Platform role. |
| `/owner/tenants/create` | Tenants | `manage_tenants`. |
| `/owner/tenants/:tenantId` | Tenants | Platform role. |
| `/owner/tenants/:tenantId/usage` | Tenants | Platform role. |
| `/owner/tenants/:tenantId/users` | Tenants | Platform role. |
| `/owner/tenants/:tenantId/billing` | Tenants/Billing | `view_billing`. |
| `/owner/tenants/:tenantId/feature-flags` | Feature Flags | `manage_feature_flags`. |
| `/owner/plans` | Plans | Platform role. |
| `/owner/plans/create` | Plans | `manage_plans`. |
| `/owner/plans/:planId` | Plans | Platform role. |
| `/owner/plans/:planId/edit` | Plans | `manage_plans`. |
| `/owner/subscriptions` | Subscriptions | Platform role. |
| `/owner/subscriptions/:subscriptionId` | Subscriptions | Platform role. |
| `/owner/usage` | Usage | `view_platform_analytics`. |
| `/owner/billing` | Billing | `view_billing`. |
| `/owner/invoices` | Billing | `view_billing`. |
| `/owner/feature-flags` | Feature Flags | `manage_feature_flags`. |
| `/owner/audit-logs` | Audit Logs | `view_audit_logs`. |
| `/owner/support` | Support | Support role or support permissions. |
| `/owner/settings` | Settings | Platform role, exact permission from Swagger alignment. |

## API Integration Plan

Use Swagger/backend API as the source of truth before creating DTOs.

Planned infrastructure:

| Item | Responsibility |
|------|----------------|
| PlatformApiClient | Shared wrapper for `/platform/*` endpoints. |
| AuthInterceptor | Attach token and handle auth failures. |
| ApiErrorMapper | Convert backend error payloads into UI-safe errors. |
| PaginationMapper | Normalize pagination responses. |
| Platform DTOs | Match Swagger request/response payloads. |
| Domain mappers | Convert DTOs to frontend domain models. |

Repository plan:

| Repository | Endpoints |
|------------|-----------|
| PlatformAnalyticsRepository | Analytics overview, usage, revenue, shipments. |
| PlatformTenantsRepository | Tenant list, create, detail, patch, status, usage, users, billing, flags. |
| PlatformPlansRepository | Plan list, create, detail, patch, delete. |
| PlatformSubscriptionsRepository | List, detail, patch, change plan, cancel, renew. |
| PlatformFeatureFlagsRepository | Global flags and tenant overrides. |
| PlatformBillingRepository | Billing and invoice endpoints from Swagger. |
| PlatformAuditLogsRepository | Platform audit logs. |
| PlatformSupportRepository | Tenant search, health, impersonation start/end. |

## State Management Plan

| State Type | Approach |
|------------|----------|
| Auth session | Existing or shared global auth state. |
| Platform permissions | Global permission state derived from `/auth/me`. |
| Feature lists | Feature facade with Signals. |
| Feature filters | Signal state in facade. |
| Pagination | Signal state in facade. |
| Selected detail item | Signal state in facade. |
| Server errors | Error signal plus mapped display message. |
| Forms | Reactive forms. |
| Impersonation | Global visible state because it affects all pages. |

Each feature facade should expose:

| Field |
|-------|
| data |
| loading |
| error |
| filters |
| pagination |
| selected item |
| actions |

## UI/UX Plan

Visual direction:

| Attribute | Direction |
|-----------|-----------|
| Tone | Premium, operational, serious. |
| Density | Data-heavy but readable. |
| Primary language | Arabic-first RTL. |
| Secondary language | English LTR. |
| Device priority | Desktop/laptop-first, tablet-friendly. |
| Mobile | Supported where reasonable, not primary. |

Shared UI primitives:

| Primitive |
|-----------|
| App shell |
| Sidebar |
| Topbar |
| Global search |
| Breadcrumbs |
| Page header |
| Filter bar |
| Data table |
| Stat card |
| Status badge |
| Confirmation dialog |
| Reason-required modal |
| Loading state |
| Empty state |
| Error state |
| Forbidden state |
| Impersonation banner |

Token usage:

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

## Security Plan

| Requirement | Plan |
|-------------|------|
| Platform-only access | Guard all owner routes by platform role. |
| Permission checks | Guard sensitive routes and actions by backend permissions. |
| Hidden actions | Hide unauthorized action buttons and menu items. |
| Forbidden state | Show explicit 403 page for direct route access. |
| Sensitive mutations | Require reason modal. |
| Destructive mutations | Require confirmation dialog. |
| Impersonation | Show global banner and end action. |
| Audit safety | Warn before feature flag and tenant status mutations. |
| Data masking | Mask sensitive audit log values. |

## Module Delivery Plan

| Phase | Deliverable |
|-------|-------------|
| Phase 0 | Swagger review and frontend contract notes. |
| Phase 1 | Owner app shell, routing, layout, base route config. |
| Phase 2 | Auth session integration, role guard, permission guard, forbidden page. |
| Phase 3 | Shared dashboard primitives and Trackora token usage. |
| Phase 4 | Overview dashboard with analytics widgets. |
| Phase 5 | Tenants management list, forms, details, status workflows. |
| Phase 6 | Plans management list, forms, details, safe archive/delete behavior. |
| Phase 7 | Subscriptions list, detail, change plan, renew, cancel. |
| Phase 8 | Global and tenant feature flags with override semantics. |
| Phase 9 | Billing overview, invoices, export flow. |
| Phase 10 | Audit logs list, filters, details, value masking. |
| Phase 11 | Support tenant search, health, impersonation banner and end flow. |
| Phase 12 | Final QA, RTL/LTR QA, permission QA, Swagger contract verification. |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Swagger endpoint shapes differ from assumptions | Complete Phase 0 before implementation. |
| Owner permissions overlap with existing admin auth | Create explicit platform role and permission checks. |
| Feature flags have ambiguous override semantics | Model global, plan inherited, tenant override, and effective values separately. |
| Impersonation can cause dangerous confusion | Persistent banner, end button, warnings, and reason requirement. |
| Billing endpoints are not fully listed in prompt | Resolve from Swagger during Phase 0. |
| UI becomes too dense | Use progressive disclosure, page headers, filters, and tables with readable spacing. |

## Definition Of Done

- Owner app builds.
- `/owner` route exists and is isolated.
- Platform-only route guard works.
- Permission guard works.
- Unauthorized actions are hidden.
- Forbidden state is shown for 403.
- API errors are mapped and displayed safely.
- Tables have filtering and pagination.
- Forms validate correctly.
- Reason-required actions work.
- Arabic RTL works.
- English LTR works.
- Trackora tokens are used.
- Loading, empty, error, and forbidden states exist.
- Impersonation banner works.
- Destructive actions require confirmation.
- Frontend contracts match Swagger.
- Owner dashboard does not leak into public, tenant admin, merchant, or courier apps.
