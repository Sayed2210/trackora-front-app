# Tasks: Phase 10 Playwright QA Automation

**Input**: `spec.md` and `plan.md` in `specs/phase-10-playwright-qa/`  
**Execution Rule**: Implement in ID order within each range unless dependencies explicitly permit parallel work.

## Audit Only

- [ ] T001 Audit and document all resolved Nx application/E2E projects, targets, and current Playwright configuration.
- [ ] T002 Audit and document every implemented public, protected, nested, dynamic, and fallback route across admin, merchant, courier, and owner.
- [ ] T003 Audit and document authentication storage, login/logout behavior, app guards, platform roles, owner permissions, and current cross-role gaps.
- [ ] T004 Audit and document i18n, RTL/LTR defaults, implemented public tracking functionality, internal owner/admin plans-management readiness, API runtime configuration, and environment gaps.
- [ ] T005 Audit and document existing unit/component/E2E tests, current CI execution, route-serving smoke tests, and missing browser journey coverage.

## Playwright Setup Plan

- [ ] T006 Define shared Playwright defaults for timeouts, retries, browser projects, reporters, traces, screenshots, videos, and local/staging web-server behavior.
- [ ] T007 Define `.env.e2e` and `.env.e2e.example` contracts for app URLs, API URL, role credentials, permission-limited accounts, and secret handling.
- [ ] T008 Define Nx-compatible package scripts and target conventions for `test:e2e`, `test:e2e:ui`, `test:e2e:smoke`, `test:e2e:full`, `test:e2e:debug`, and `playwright:install`.
- [ ] T009 Define suite tagging and filtering conventions for smoke, full, mocked, contract, public, and role-specific tests.
- [ ] T010 Define shared support-code structure, ownership boundaries, naming conventions, and migration plan for the seven existing request-only E2E specs.

## Selector And Testability Plan

- [ ] T011 Inventory auth and layout controls requiring stable selectors, including login fields, submit/error states, logout, language switching, navigation, and forbidden states.
- [ ] T012 Inventory shared loading, empty, error, retry, table, dialog, confirmation, and reason-required components requiring stable selector contracts.
- [ ] T013 Inventory public tracking controls and result states requiring `track-input`, `track-submit`, `tracking-status`, timeline, loading, empty, and error selectors.
- [ ] T014 Inventory merchant dashboard, shipment list, filters, pagination, create form, bulk upload, and shipment detail selectors.
- [ ] T015 Inventory admin dashboard, dispatch board, courier/merchant management, payouts, wallets, audit logs, reports, zones, and analytics selectors.
- [ ] T016 Inventory owner navigation, overview KPIs, tenants, plans, subscriptions, billing, invoices, feature flags, audit logs, support, impersonation, and forbidden selectors.
- [ ] T017 Inventory courier tasks, filters, details, OTP, COD, evidence, GPS, status actions, offline indicator, pending sync, conflicts, deposits, and performance selectors.
- [ ] T018 Define selector naming rules, dynamic-ID formatting, uniqueness checks, and guidance for semantic locators versus `data-testid`.
- [ ] T019 Define testability requirements for preserving route/query parameters, exposing deterministic state containers, and avoiding localized text as the sole locator.
- [ ] T020 Review the selector inventory with frontend/QA owners and approve the minimum application changes required before E2E implementation.

## Fixtures, Helpers, And Data Strategy Plan

- [ ] T021 Define API-based login and reusable Playwright storage-state generation for unauthenticated, admin, merchant, courier, owner, and limited-owner contexts.
- [ ] T022 Define a typed E2E API client with authentication, base URL configuration, request logging, error handling, and secret masking.
- [ ] T023 Define idempotent seed/reset helpers for role users, permissions, tenants, plans, merchants, couriers, shipments, tracking numbers, assignments, wallets, and transactions.
- [ ] T024 Define unique run-ID conventions, mutable-record ownership, cleanup hooks, failed-run cleanup, and parallel-run collision prevention.
- [ ] T025 Define deterministic test-data builders and fixture records for valid, invalid, empty, boundary, and permission-limited scenarios.
- [ ] T026 Define reusable route-mock helpers for delayed responses, empty payloads, 4xx/5xx errors, partial data, pagination, and retry behavior.
- [ ] T027 Define API contract assertion helpers for auth, dashboards, lists, pagination, public tracking, courier tasks, and platform endpoints.
- [ ] T028 Define courier IndexedDB helpers for cached tasks, pending updates, conflicts, deposits, and cleanup between tests.
- [ ] T029 Define browser-context helpers for offline mode, geolocation, permissions, file upload, language, viewport, and clock control.
- [ ] T030 Document local/staging seed prerequisites, test-account ownership, credential rotation, data retention, and troubleshooting procedures.

## Smoke Tests Plan

- [ ] T031 Plan `@smoke @public` verification that currently implemented public tracking routes load without authentication.
- [ ] T032 Plan `@smoke` login success for merchant, admin, courier, and owner using real staging accounts and expected landing routes.
- [ ] T033 Plan `@smoke` login failure verification with invalid credentials and confirmation that no authenticated storage is created.
- [ ] T034 Plan `@smoke` unauthenticated redirects for representative protected routes in every app.
- [ ] T035 Plan `@smoke` logout verification for each implemented app layout and confirmation that protected routes become inaccessible.
- [ ] T036 Plan `@smoke @merchant` merchant dashboard load with seeded KPI/activity data.
- [ ] T037 Plan `@smoke @merchant` shipment list load and opening a seeded shipment detail.
- [ ] T038 Plan `@smoke @admin` admin dashboard load and critical KPI/alert availability.
- [ ] T039 Plan `@smoke @admin` dispatch board load with seeded unassigned shipment and available courier.
- [ ] T040 Plan `@smoke @owner` owner overview load with authorized platform-owner storage state.
- [ ] T041 Plan `@smoke @owner` availability checks for tenants, plans, subscriptions, feature flags, audit logs, billing, and support routes.
- [ ] T042 Plan `@smoke @courier` courier task list load and opening a seeded task detail.
- [ ] T043 Plan `@smoke @public` valid tracking-number lookup showing status and timeline.
- [ ] T044 Plan `@smoke @i18n` representative Arabic RTL and English LTR document-direction assertions.
- [ ] T045 Define the smoke pass/fail gate, maximum runtime, required artifacts, and manual-QA handoff result format.

## Full E2E Suites Plan

- [ ] T046 Plan full auth/RBAC coverage for cross-role denial, malformed/expired storage, platform-role checks, and owner permission-specific forbidden routes.
- [ ] T047 Plan full public tracking coverage for initial empty, valid, invalid, loading, error, encoded-number, and partial-timeline states.
- [ ] T048 Plan merchant shipment-list coverage for status/zone filters, pagination, empty state, API error, and retry.
- [ ] T049 Plan merchant shipment-create coverage for required fields, invalid phone, unavailable zones, valid submission, and created-record cleanup.
- [ ] T050 Plan merchant shipment-detail coverage for timeline/data display, missing geolocation, and API error behavior.
- [ ] T051 Plan merchant wallet and payout critical-path coverage using seeded or mocked financial records.
- [ ] T052 Plan admin dispatch coverage for zone/risk filters, assignment success, unavailable/full courier behavior, and assignment API failure.
- [ ] T053 Plan admin courier and merchant management coverage for list states, critical filters, create/approval validation, and details.
- [ ] T054 Plan admin payouts, wallets, audit logs, reports, zones, and analytics route/state coverage according to business risk.
- [ ] T055 Plan owner overview coverage for loading, partial success, all-failed, empty alerts, top tenants, and retry.
- [ ] T056 Plan owner tenants coverage for list/filter/pagination, create validation, detail, usage, users, billing, feature flags, and permission denial.
- [ ] T057 Plan owner plans coverage for list/loading/error/empty, create/edit validation, details, and safe archive/delete behavior.
- [ ] T058 Plan owner subscriptions and billing coverage for list/detail, filters, reason-required actions, invoices, empty/error states, and finance permissions.
- [ ] T059 Plan owner feature-flag and audit-log coverage for list states, filters, details, reason workflows, masking, and required permissions.
- [ ] T060 Plan owner support and impersonation coverage for tenant search, health, reason requirement, active banner, end action, and permission denial.
- [ ] T061 Plan courier task-status validation for COD, OTP, geolocation, photo/signature evidence, failed/postponed states, and API errors.
- [ ] T062 Plan courier offline coverage for cached tasks, offline indicator, queued updates, pending count, restored connectivity, retries, conflicts, and cleanup.
- [ ] T063 Plan complete i18n coverage for Arabic default expectations, RTL/LTR switching, translation assets, and route/query preservation.
- [ ] T064 Plan full coverage for implemented public tracking functional behavior, internal owner/admin plans-management flows, and blocked route documentation for unavailable internal surfaces only.
- [ ] T065 Plan API contract suites for frontend-consumed auth, dashboard, shipment, tracking, courier, tenant, plan, subscription, billing, feature-flag, audit-log, and support responses.

## CI And Reporting Plan

- [ ] T066 Plan GitHub Actions dependency installation and Nx lint, typecheck, unit/component test, and build quality gates before E2E.
- [ ] T067 Plan Playwright browser/dependency installation through the approved `playwright:install` script and Nx-compatible commands.
- [ ] T068 Plan the pull-request/main smoke job, staging environment protection, seed/reset step, and blocking behavior before manual QA.
- [ ] T069 Plan nightly and manual-release full-regression workflows with application/role matrix execution.
- [ ] T070 Plan HTML, JUnit, and machine-readable summaries plus merged-report behavior across Nx/Playwright projects.
- [ ] T071 Plan trace, screenshot, video, network/log attachment, artifact upload, retention, and sensitive-data masking policies.
- [ ] T072 Plan CI-only retries, flaky-test detection, ownership, quarantine rules, expiry dates, and rolling flake-rate reporting.
- [ ] T073 Plan Nx Cloud distribution, Playwright workers/shards, isolated mutable data, and suite runtime budgets.
- [ ] T074 Plan GitHub environment secrets, least-privilege test accounts, credential rotation, and failure-safe cleanup.
- [ ] T075 Plan CI status reporting and manual-QA handoff summary containing smoke result, failed journeys, artifacts, known gaps, and environment version.

## Documentation And QA Checklist

- [ ] T076 Create the local execution runbook for individual apps, tags, headed/UI/debug modes, environment setup, seeds, and cleanup.
- [ ] T077 Create the staging and CI troubleshooting guide for authentication, API availability, browser installation, selectors, data collisions, offline tests, and reports.
- [ ] T078 Create the manual QA handoff process defining when automation blocks QA, what remains manual, and how failed/blocked coverage is communicated.
- [ ] T079 Validate every internal route, role, implemented public tracking, i18n, stability, CI, and handoff item in `checklist.md` against the implemented automation.
- [ ] T080 Perform final acceptance review confirming smoke/full readiness, documented blocked scenarios, actionable reports, and no unapproved application or production-data changes.

