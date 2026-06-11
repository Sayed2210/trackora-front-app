# Feature Specification: Phase 10 Playwright QA Automation

**Feature Folder**: `specs/phase-10-playwright-qa`  
**Created**: 2026-06-10  
**Status**: Planning Complete  
**Input**: Create a Playwright-based testing and automation strategy that catches business-critical bugs before manual QA.

## Product Goal

Provide a reliable, maintainable automated quality gate for Trackora's internal logistics and COD frontend. The automation must detect failures in authentication, authorization, shipment operations, dispatch, owner administration, courier tasks, implemented public tracking functionality, localization, and important loading/error/empty states without attempting pixel-perfect coverage.

## User Stories

### US1 - Pre-QA Smoke Confidence (Priority: P1)

As a QA engineer, I need a fast smoke pack that verifies the most critical Trackora journeys against a real test environment before manual testing begins.

**Independent Test**: Run the smoke command and confirm that authentication, protected-route redirects, one critical page per role, and public tracking complete successfully.

**Acceptance Scenarios**:

1. **Given** seeded test users and staging data, **When** the smoke pack runs, **Then** it validates the highest-risk happy paths for merchant, admin, owner, courier, and public tracking.
2. **Given** a smoke failure, **When** CI finishes, **Then** the report, trace, screenshot, and relevant logs identify the failing journey.

### US2 - Authentication And RBAC Protection (Priority: P1)

As a product owner, I need automated proof that authenticated areas and role boundaries prevent unauthorized access.

**Independent Test**: Execute the auth/RBAC suite using storage states for merchant, admin, courier, platform owner, and unauthenticated users.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** a user logs in, **Then** the correct role landing page loads.
2. **Given** invalid credentials, **When** login is submitted, **Then** an actionable failure state appears and no authenticated session is stored.
3. **Given** an unauthenticated browser, **When** a protected route is opened, **Then** the browser redirects to login.
4. **Given** a merchant session, **When** an admin or owner route is opened, **Then** access is denied through the application's implemented redirect or forbidden behavior.
5. **Given** a public route, **When** it is opened without authentication, **Then** it remains accessible.

### US3 - Shipment And Dispatch Operations (Priority: P1)

As an operations team, I need automated coverage of shipment creation, listing, details, filters, and dispatch assignment so operational blockers are caught early.

**Independent Test**: Seed one merchant shipment and one unassigned shipment, then execute merchant and admin journeys.

**Acceptance Scenarios**:

1. **Given** a merchant session, **When** the shipment list opens, **Then** seeded shipments and pagination/filter controls are usable.
2. **Given** invalid shipment form data, **When** creation is attempted, **Then** validation prevents submission.
3. **Given** valid shipment data, **When** creation succeeds, **Then** the resulting shipment can be found and opened.
4. **Given** an unassigned shipment and available courier, **When** an admin assigns it, **Then** the dispatch board reflects the assignment.

### US4 - Public Tracking Functional Reliability (Priority: P1)

As a shipment recipient, I need the public tracking functionality implemented in this app to remain accessible and understandable without authentication.

**Independent Test**: Execute public journeys without authentication using seeded tracking data and mocked edge responses.

**Acceptance Scenarios**:

1. **Given** a valid tracking number, **When** tracking is submitted, **Then** shipment status and timeline appear.
2. **Given** an invalid tracking number, **When** tracking is submitted, **Then** a clear error state appears.
3. **Given** delayed, empty, or failed API responses, **When** the tracking route loads, **Then** the correct loading, empty, or fallback state appears.

### US5 - Owner And Admin Platform Operations (Priority: P2)

As an internal Trackora operator, I need automated confidence that owner/admin dashboards and management modules load for authorized users and respect permission boundaries.

**Independent Test**: Use platform-role storage states with defined permission sets and validate owner/admin route access plus mocked page states.

**Acceptance Scenarios**:

1. **Given** an authorized platform owner, **When** owner overview, tenants, plans, subscriptions, feature flags, audit logs, billing, and support routes open, **Then** each route displays its primary content or an intentional state.
2. **Given** a platform user without a required permission, **When** a restricted owner route opens, **Then** the forbidden page is displayed.
3. **Given** an authorized admin, **When** dashboard and dispatch routes open, **Then** operational data and controls render.

### US6 - Courier Mobile And Offline Reliability (Priority: P2)

As a courier, I need automated coverage of tasks, delivery validation, offline behavior, and pending synchronization.

**Independent Test**: Seed a courier task, simulate online/offline browser contexts, and inspect the courier IndexedDB state.

**Acceptance Scenarios**:

1. **Given** a courier session, **When** the task list opens, **Then** seeded tasks are visible and a task detail opens.
2. **Given** incomplete delivery evidence, **When** delivery is attempted, **Then** required validation prevents completion.
3. **Given** an offline browser, **When** a status change is queued, **Then** the offline indicator and pending-sync count appear.
4. **Given** connectivity is restored, **When** sync runs, **Then** queued work is synchronized or a visible conflict is reported.

### US7 - Arabic-First Localization (Priority: P2)

As an Arabic-first Trackora user, I need Arabic RTL and English LTR behavior to remain correct across critical journeys.

**Independent Test**: Run language-direction checks in each implemented app and verify language switching where available.

**Acceptance Scenarios**:

1. **Given** an Arabic-first route, **When** it loads, **Then** the document language is Arabic and direction is RTL.
2. **Given** the language switcher, **When** English is selected, **Then** the document direction becomes LTR without losing the current route or query parameters.

## In Scope

- Testing pyramid and ownership boundaries.
- Existing Nx Playwright projects for admin, merchant, courier, and owner.
- Browser E2E smoke and full regression strategy.
- API contract checks for frontend-consumed response shapes.
- Stable selector and application testability plan.
- Authentication storage states, fixtures, API helpers, seeds, cleanup, and mocks.
- Real staging happy paths and mocked UI edge states.
- Arabic RTL and English LTR checks.
- Functional coverage for public tracking routes implemented in this app.
- Internal owner/admin plans-management coverage.
- CI execution, reports, traces, screenshots, videos, artifacts, and flake management.
- Manual QA handoff criteria.

## Out Of Scope

- Implementing application behavior, routes, APIs, selectors, or tests during this planning feature.
- Installing or upgrading packages.
- Pixel-perfect visual regression across every screen.
- Exhaustive testing of every field permutation or low-risk page.
- Backend implementation, production data mutation, load testing, and security penetration testing.
- Replacing manual exploratory, accessibility, device, or business acceptance testing.
- Public marketing website, public pricing, sitemap, robots, canonical metadata, index/noindex, or other SEO automation owned by the separate `trackora-website` project.

## Critical User Journeys

| Priority | Journey |
|---|---|
| P0 | Successful and failed login, logout, unauthenticated redirect, and cross-role denial |
| P0 | Merchant dashboard, shipment list, shipment create validation, create happy path, and shipment detail |
| P0 | Admin dashboard and dispatch assignment |
| P0 | Public tracking valid, invalid, loading, and error behavior |
| P0 | Owner overview and core management routes with permission enforcement |
| P0 | Courier task list, task detail, delivery validation, offline state, and pending sync |
| P1 | Arabic RTL, English LTR, and language-switch route/query preservation |
| P1 | Internal owner/admin plans management, including loading, error, empty, validation, and authorized actions |
| P1 | Loading, error, empty, and retry states for high-risk data pages |

## Functional Requirements

- **FR-001**: The automation strategy MUST retain and standardize the existing four Nx Playwright projects.
- **FR-002**: The smoke pack MUST cover the minimum business-critical journeys required before manual QA.
- **FR-003**: The full pack MUST cover the broader critical regression set before release.
- **FR-004**: Authentication tests MUST cover success, failure, logout, and unauthenticated redirects.
- **FR-005**: RBAC tests MUST cover cross-role route denial and owner permission-specific forbidden behavior.
- **FR-006**: Public routes MUST be tested without authentication.
- **FR-007**: Merchant tests MUST cover dashboard, shipment list, filters where implemented, create validation, create happy path, and detail.
- **FR-008**: Admin tests MUST cover dashboard and dispatch assignment, plus critical management route availability.
- **FR-009**: Owner tests MUST cover overview, tenants, plans, subscriptions, feature flags, audit logs, billing, and support/impersonation where implemented and authorized.
- **FR-010**: Courier tests MUST cover tasks, detail, status validation, offline indication, pending sync, and conflict behavior where implemented.
- **FR-011**: Public tracking tests MUST cover valid, invalid, loading, error, and initial empty behavior.
- **FR-012**: Plans tests MUST cover internal owner/admin plan-management loading, error, empty, validation, and authorized action behavior.
- **FR-013**: i18n tests MUST verify Arabic RTL and English LTR behavior on critical routes.
- **FR-014**: Language switching MUST preserve the current route and query parameters once that behavior is implemented.
- **FR-016**: Real staging APIs MUST be preferred for smoke happy paths.
- **FR-017**: Playwright route mocking MUST be used for deterministic loading, empty, error, permission, and rare edge states.
- **FR-018**: API contract tests MUST validate the response shapes consumed by frontend repositories and facades.
- **FR-019**: Test setup MUST define `.env.e2e`, application/API base URLs, and non-production test users for every tested role.
- **FR-020**: Seed and cleanup helpers MUST create or reset required plans, users, shipments, tracking records, assignments, and optional financial records without relying on UI setup.
- **FR-021**: Tests MUST prefer accessible semantic locators and use documented `data-testid` attributes only where semantic locators are unstable or ambiguous.
- **FR-022**: CI MUST run smoke E2E before manual QA and full E2E nightly or before release.
- **FR-023**: CI failures MUST retain Playwright HTML/JUnit reports, traces, screenshots, and videos according to the failure policy.
- **FR-024**: Existing unit/component tests MUST remain the primary layer for helpers, mappers, guards, facades, and business rules.
- **FR-025**: The planning artifacts MUST explicitly identify unavailable or blocked scenarios instead of asserting they currently work.

## Non-Functional Requirements

- **NFR-001**: Smoke execution should target 10 minutes or less in CI.
- **NFR-002**: Full regression should target 30 minutes or less using parallel Nx/Playwright execution.
- **NFR-003**: Tests MUST be independently repeatable and safe to rerun.
- **NFR-004**: Tests MUST not depend on execution order.
- **NFR-005**: Tests MUST not use production credentials or mutate production data.
- **NFR-006**: Flaky retries MUST not hide persistent failures; repeated flaky tests require ownership and remediation.
- **NFR-007**: Failure artifacts MUST avoid exposing passwords, access tokens, or sensitive customer data.
- **NFR-008**: Selectors MUST remain stable across copy changes, localization, and styling changes.
- **NFR-009**: Seeded data MUST use unique run identifiers or isolated reusable fixtures to prevent collisions.
- **NFR-010**: Automation MUST support local development, staging, CI smoke, nightly regression, and manual release runs.

## Testing Pyramid

| Layer | Responsibility |
|---|---|
| Unit tests | Helpers, validators, mappers, guards, stores, facades, business rules, and offline sync logic |
| Component tests | Complex forms, rendering states, permission visibility, and reusable UI state components |
| API contract tests | Frontend-consumed API response envelopes, fields, pagination, and error shapes |
| Playwright smoke E2E | Fast, real-environment business-critical happy paths and access control |
| Playwright full E2E | Broader role journeys, mocked edge states, offline behavior, i18n, functional public tracking, and internal plans management |
| Manual QA | Exploratory behavior, visual quality, accessibility depth, unusual devices, and release acceptance |

## Edge Cases

- Expired, malformed, or missing authentication storage.
- Valid role without a required owner permission.
- A merchant attempting to open admin or owner routes.
- API returns 401, 403, 404, 409, 429, or 5xx after retries.
- List endpoints return an empty page or inconsistent pagination metadata.
- Tracking lookup succeeds but timeline lookup fails.
- Tracking route contains an unknown or encoded tracking number.
- Seed data already exists from a previous failed run.
- Courier starts offline with cached tasks, queues multiple updates, or receives sync conflicts.
- Browser geolocation, file upload, or signature capture is unavailable.
- Arabic/English switching occurs while query parameters are present.
- Screens use duplicated text or repeated controls that cannot be selected semantically.

## Acceptance Criteria

- The four required Spec Kit planning artifacts are complete and mutually consistent.
- All implemented routes and role boundaries are represented in the coverage plan.
- Public website and SEO surfaces are excluded from readiness assessment because they belong to `trackora-website`.
- Smoke and full regression packs have distinct scope and execution policy.
- Local, staging, CI, nightly, and release execution strategies are defined.
- Real-backend, seed, cleanup, mocking, selector, reporting, and flake policies are defined.
- Arabic RTL and English LTR coverage is explicitly planned.
- No application files, package manifests, selectors, or Playwright tests are changed by this planning feature.

## Success Metrics

- **SC-001**: Smoke automation detects blocking failures before manual QA starts.
- **SC-002**: Smoke suite completes in 10 minutes or less in CI.
- **SC-003**: Full regression completes in 30 minutes or less in the planned CI configuration.
- **SC-004**: At least one critical browser journey exists for every implemented app and tested role.
- **SC-005**: All P0 journeys have deterministic data and stable selectors.
- **SC-006**: CI provides actionable failure artifacts for every failed E2E test.
- **SC-007**: Flake rate remains below 2% over a rolling 30-run window.
- **SC-008**: No test uses brittle generated CSS selectors or localized visible text as its sole locator for critical controls.
- **SC-009**: Manual QA receives a documented pass/fail summary and known automation gaps before testing.

## Assumptions

- Existing Playwright and Nx dependencies remain available.
- Staging or a dedicated QA backend can provide isolated test users and seed/reset capabilities.
- Public tracking automation targets only the functional tracking routes implemented in `trackora-front-app`.
- Plans automation targets internal owner/admin plan-management flows only.
- Public website, public pricing, sitemap, robots, canonical metadata, index/noindex, and other SEO concerns belong to the separate `trackora-website` project and are out of scope.
- The existing four-app architecture remains unchanged during initial automation rollout.

