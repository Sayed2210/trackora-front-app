# Implementation Plan: Phase 10 Playwright QA Automation

**Date**: 2026-06-10  
**Spec**: `specs/phase-10-playwright-qa/spec.md`  
**Status**: Planning Only

## Summary

Extend the existing Nx Playwright setup into a layered automation system that provides a fast real-staging smoke gate before manual QA and a broader full regression pack for nightly and release validation. Standardize shared fixtures, authentication storage states, API seed helpers, route mocks, selectors, reports, and CI behavior while preserving app-specific E2E projects.

## Technical Context

| Item | Current State |
|---|---|
| Workspace | Nx 22.7, npm |
| Frontend | Angular 21 standalone components |
| Applications | `admin`, `merchant`, `courier`, `owner` |
| State | NgRx feature stores plus Angular signals/facades |
| API | Shared `ApiClient`; base URL currently hardcoded to `http://trackora.techlabeg.com/v1` |
| i18n | `@ngx-translate/core`, Arabic and English JSON assets for admin/merchant/courier |
| Offline | Courier Dexie IndexedDB and pending-sync service |
| Unit/component tests | Jest/Vitest-based coverage across apps, core, shared, and feature libraries |
| E2E | Existing `admin-e2e`, `merchant-e2e`, `courier-e2e`, `owner-e2e` Nx projects |
| CI | GitHub Actions and Nx Cloud; currently runs all E2E targets together |
| Testability | No `data-testid` attributes currently exist |

## Current Project Audit Findings

### Routing And Roles

| App | Public Routes | Protected/Critical Routes | Role Behavior |
|---|---|---|---|
| Admin | `/login` | `/dashboard`, `/shipments`, `/assignments`, `/analytics`, `/zones`, `/couriers`, `/merchants`, `/payouts`, `/wallets`, `/audit-logs`, `/reports` | Guarded for super admin, operations manager, and finance admin roles |
| Merchant | `/login`, `/tracking`, `/tracking/:trackingNumber` | `/dashboard`, `/shipments`, `/shipments/create`, `/shipments/bulk-upload`, `/shipments/:id`, `/wallet`, `/payouts` | Protected by authentication; merchant-specific role guard is not currently applied |
| Courier | `/login` | `/tasks`, `/tasks/:id`, `/cash-deposit`, `/performance` | Protected by authentication; courier-specific role guard is not currently applied |
| Owner | `/login`, `/owner/forbidden` | `/owner` plus overview, tenants, plans, subscriptions, usage, billing, invoices, feature flags, audit logs, support, impersonation, settings | Platform-role and permission guards route denied users to forbidden |

### Important Gaps

- Arabic-first behavior is inconsistent: owner starts Arabic RTL, while admin/merchant/courier documents start English LTR.
- `LanguageService` defaults to Arabic but is not initialized consistently by all layouts.
- API base URL is hardcoded and `.env.example` is not consumed by the shared API client.
- Existing E2E tests only perform request-level “route serves” checks.
- Current CI has no explicit smoke/full split and no dedicated Playwright artifact upload.
- No stable test IDs exist.

Public website, public pricing, sitemap, robots, canonical metadata, index/noindex, and other SEO concerns are intentionally excluded from this plan. They belong to the separate `trackora-website` project and are not blockers for `trackora-front-app` QA readiness.

### Existing Strengths

- Playwright, Nx Playwright plugin, and four E2E projects already exist.
- Merchant shipment list/create/detail routes are implemented.
- Admin dashboard and dispatch board are implemented.
- Owner has broad platform route and permission coverage plus reusable loading/empty/error UI.
- Courier task, delivery validation, IndexedDB offline cache, pending sync, and conflict behavior are implemented.
- Existing unit/component tests cover many repositories, facades, mappers, owner pages, and guards.

## Test Architecture

### Project Structure

Retain app-specific E2E projects and introduce shared support code during implementation:

```text
apps/
├── admin-e2e/src/
├── merchant-e2e/src/
├── courier-e2e/src/
└── owner-e2e/src/

tools/e2e/
├── auth/
├── fixtures/
├── api/
├── mocks/
├── data/
├── assertions/
└── config/
```

Shared support code owns cross-app authentication, API clients, seed contracts, route mocks, test data builders, report helpers, and common assertions. App-specific projects own journeys and page-specific helpers.

### Suite Classification

| Tag | Purpose |
|---|---|
| `@smoke` | Fast real-staging P0 journeys required before manual QA |
| `@full` | Broader regression journeys for nightly and release runs |
| `@mocked` | Deterministic UI states produced with route interception |
| `@contract` | API response-shape validation |
| `@admin`, `@merchant`, `@courier`, `@owner`, `@public` | Role/application ownership |

### Layer Ownership

- Unit tests: validators, helpers, mappers, guards, stores, facades, and offline-sync decisions.
- Component tests: form validation details, permission visibility, and rendering states.
- Contract tests: endpoint envelopes and fields consumed by frontend repositories.
- Smoke E2E: real staging API, one critical happy path per role, auth/RBAC, and public tracking.
- Full E2E: broader route coverage, mutations, mocked edge states, offline behavior, i18n, functional public tracking, and internal plans management.

## Playwright Strategy

### Configuration

- Keep one Playwright config per E2E project but centralize shared defaults.
- Use Chromium for smoke initially; add mobile Chromium for courier full regression.
- Configure CI-only retries, deterministic timeouts, trace on first retry, screenshot on failure, and video retained on failure.
- Use Nx targets for all execution; package scripts delegate to Nx run-many or project targets.
- Define environment-aware web server behavior: local commands start app servers, staging runs skip local servers.

### Recommended Scripts

```text
test:e2e
test:e2e:ui
test:e2e:smoke
test:e2e:full
test:e2e:debug
playwright:install
```

### Smoke Pack

- Login success and failure.
- Unauthenticated redirect and logout.
- Merchant dashboard and shipment list.
- Admin dashboard and dispatch board.
- Owner overview and core management route availability.
- Courier task list and task detail.
- Public tracking valid lookup.
- Basic Arabic/English direction assertion on representative routes.

### Full Pack

- Cross-role and permission-specific access denial.
- Shipment create validation, successful create, filtering, pagination, and detail.
- Dispatch assignment.
- Owner tenants, plans, subscriptions, feature flags, audit logs, billing, support, and impersonation.
- Courier status validation, geolocation permission behavior, offline cached tasks, pending sync, and conflicts.
- Tracking invalid/loading/error/partial-timeline behavior.
- Loading, empty, error, and retry states for high-risk pages.
- Internal owner/admin plans-management loading, empty, error, validation, detail, and authorized mutation behavior.

## Test Environment Plan

### Environment Contract

Plan a non-committed `.env.e2e` and a committed `.env.e2e.example` containing non-secret placeholders:

```text
E2E_BASE_URL
E2E_API_BASE_URL
E2E_ADMIN_BASE_URL
E2E_MERCHANT_BASE_URL
E2E_COURIER_BASE_URL
E2E_OWNER_BASE_URL
E2E_ADMIN_PHONE
E2E_ADMIN_PASSWORD
E2E_MERCHANT_PHONE
E2E_MERCHANT_PASSWORD
E2E_COURIER_PHONE
E2E_COURIER_PASSWORD
E2E_OWNER_PHONE
E2E_OWNER_PASSWORD
```

Additional permission-limited owner credentials may be added for targeted RBAC checks.

### Local Development

- Run the required app through its Nx serve target.
- Point E2E API configuration at a local or shared QA backend.
- Allow individual project, tag, headed, UI, and debug execution.
- Never require UI-created prerequisite data.

### Staging

- Use stable isolated role accounts.
- Seed deterministic records before execution.
- Use unique run IDs for mutable records.
- Keep smoke happy paths on real APIs.
- Clean up or reset mutable records after runs.

## Data And Seed Strategy

### Seed Ownership

Prefer backend-supported seed/reset endpoints or scripts. If unavailable, use authenticated API helpers that call existing public/admin/platform endpoints. Avoid creating all prerequisite data through UI.

### Required Fixtures

| Fixture | Minimum State |
|---|---|
| Platform owner | Platform role with all required owner permissions |
| Limited platform user | Platform role missing selected permissions |
| Admin | Authorized admin/operations role |
| Merchant | Merchant ID, dashboard data, wallet, and shipment access |
| Courier | Assigned tasks and permission to update status |
| Internal plan | Owner/admin-managed plan with known status and permissions |
| Shipment | Merchant-owned shipment with known detail and timeline |
| Tracking number | Stable public tracking result |
| Dispatch shipment | Pending, unassigned shipment |
| Available courier | Capacity available for assignment |
| Financial record | Optional wallet/transaction/payout fixture for targeted suites |

### Rules

- Use API helpers for setup and cleanup.
- Prefix mutable records with a unique run identifier.
- Keep reusable read-only fixtures for smoke where backend guarantees stability.
- Make seed operations idempotent.
- Record fixture IDs in the test context for cleanup and diagnostics.
- Do not expose secrets or customer PII in reports.

## Mocking Strategy

| Scenario | Strategy |
|---|---|
| Smoke happy paths | Real staging API |
| UI loading state | Delay intercepted response |
| Empty internal lists/plans/tracking timeline | Fulfill deterministic empty response |
| API error fallback | Fulfill 4xx/5xx error shape |
| RBAC browser behavior | Prefer real limited-role account; use auth/storage mock only when unavailable |
| API contract validation | Real QA/staging endpoint with schema assertions |
| Courier offline | `browserContext.setOffline(true)` plus IndexedDB helpers |
| Geolocation | Playwright context permissions and configured coordinates |
| File/photo | Playwright file chooser with deterministic fixture |

Mocks must validate that requests match the expected method/path and must not silently intercept unrelated traffic.

## Selector Strategy

### Rules

1. Prefer `getByRole`, associated labels, accessible names, and stable form names.
2. Use `data-testid` for repeated cards, non-semantic custom controls, localized copy, status containers, and state components.
3. Do not locate critical elements solely by CSS classes, DOM position, icons, or translated visible text.
4. Name IDs by business meaning, not styling or implementation.
5. Add selectors only during implementation and only where the audit identifies a stability need.

### Planned Selector Inventory

| Area | Planned IDs |
|---|---|
| Auth/layout | `login-phone`, `login-password`, `login-submit`, `login-error`, `logout-button`, `language-switcher` |
| Common states | `loading-state`, `empty-state`, `error-state`, `retry-button`, `forbidden-state` |
| Public tracking | `track-input`, `track-submit`, `tracking-status`, `tracking-timeline`, `tracking-error` |
| Merchant shipments | `shipment-list`, `shipment-row-{id}`, `shipment-status-filter`, `shipment-zone-filter`, `shipment-create-form`, `shipment-create-submit`, `shipment-detail` |
| Dashboards | `dashboard-kpi-card`, `dashboard-alerts`, `dashboard-empty-state` |
| Dispatch | `dispatch-shipment-{id}`, `dispatch-courier-{id}`, `dispatch-assign` |
| Owner | `owner-nav-{route}`, `tenant-row-{id}`, `plan-card`, `subscription-row-{id}`, `feature-flag-{key}`, `audit-log-row-{id}`, `impersonation-banner` |
| Courier | `courier-task-{id}`, `courier-status-filter`, `offline-indicator`, `pending-sync-count`, `sync-now`, `task-status-{status}` |

## API Contract Strategy

- Validate auth login/me response fields used by auth mapping and storage.
- Validate list envelopes and pagination consumed by shipment, tenant, plan, subscription, audit-log, and billing repositories.
- Validate dashboard response fields consumed by admin, merchant, and owner facades.
- Validate courier task/status and public tracking response shapes.
- Treat contract mismatches as blocking because frontend mappers currently accept multiple backend field variants.
- Keep contract assertions focused on required consumed fields, types, nullable behavior, and error shapes.

## CI Strategy

### Pull Request / Main Gate

1. Checkout and set up Node/npm cache.
2. Run `npm ci`.
3. Run lint, typecheck, unit/component tests, and build through Nx.
4. Install required Playwright browser dependencies.
5. Seed/reset the QA environment.
6. Run `@smoke` suites through Nx.
7. Upload HTML/JUnit reports, traces, screenshots, and videos on failure.
8. Publish a concise pass/fail summary for manual QA.

### Nightly / Release

- Run full regression across all E2E projects.
- Use Nx Cloud and Playwright workers/shards without sharing mutable records.
- Upload merged reports and retain artifacts longer than smoke artifacts.
- Track duration, failures, retries, and flake rate.

### Failure Policy

- Blocking smoke failures stop manual QA handoff.
- One CI retry is allowed for infrastructure/transient diagnosis, not to hide failures.
- A test that passes only on retry is recorded as flaky and assigned for remediation.
- Quarantined tests must remain visible, have an owner, and have an expiry date.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Hardcoded API URL prevents environment isolation | Plan runtime E2E API configuration before reliable multi-environment execution |
| No stable selectors | Complete selector/testability tasks before full browser suite expansion |
| Shared staging data causes collisions | Use idempotent seeds, unique run IDs, and cleanup |
| Role-specific guards are missing in merchant/courier | Test current behavior, document security gap, and add expected RBAC tests once guards exist |
| Backend instability makes UI tests flaky | Separate real smoke paths from deterministic mocked UI state tests |
| Courier offline tests are timing-sensitive | Use direct IndexedDB helpers and explicit offline/network assertions |
| Reports expose sensitive data | Mask secrets/PII and avoid attaching raw auth responses |
| Broad E2E suite becomes slow | Keep smoke narrow, move business logic to lower layers, parallelize full suites |

## Rollout Phases

| Phase | Outcome |
|---|---|
| 1. Audit and readiness | Confirm routes, contracts, environments, selectors, role accounts, and blocked surfaces |
| 2. Foundation | Shared config, tags, environment loader, storage states, API helpers, seeds, mocks, reports |
| 3. Smoke gate | Real-staging P0 journeys for public, merchant, admin, owner, and courier |
| 4. Full role regression | Shipment, dispatch, owner modules, courier offline, RBAC, and edge states |
| 5. Internal coverage expansion | Expand functional public tracking and internal owner/admin plans-management coverage |
| 6. CI hardening | Nightly runs, artifact retention, flake tracking, quarantine governance, and QA handoff |

## Definition Of Done

- Smoke and full suite definitions are implemented and documented.
- All P0 implemented journeys have stable selectors and deterministic data.
- Local, staging, PR, nightly, and release execution paths work through Nx.
- CI produces actionable failure reports and blocks manual QA on smoke failures.
- Arabic RTL and English LTR checks are present.
- Public website and SEO concerns remain excluded and owned by `trackora-website`; unavailable internal-system scenarios remain explicitly documented.

