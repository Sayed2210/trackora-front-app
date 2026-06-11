# Playwright QA Planning And Readiness Checklist

**Purpose**: Validate planning completeness and implementation readiness for Phase 10 Playwright QA automation.  
**Created**: 2026-06-10  
**Updated**: 2026-06-11  
**Feature**: `specs/phase-10-playwright-qa/spec.md`

## Planning Completeness

- [x] CHK001 The specification includes prioritized, independently testable user stories.
- [x] CHK002 Functional and non-functional requirements are complete and traceable.
- [x] CHK003 In-scope and out-of-scope boundaries are explicit.
- [x] CHK004 Critical journeys, edge cases, acceptance criteria, and success metrics are documented.
- [x] CHK005 The testing pyramid defines unit, component, API contract, smoke E2E, full E2E, and manual QA ownership.
- [x] CHK006 Current audit findings distinguish implemented behavior from requested but unavailable behavior.
- [x] CHK007 Smoke and full regression packs have distinct scope, runtime goals, and execution policies.
- [x] CHK008 Environment, data, mocking, selectors, CI, reporting, risks, and rollout phases are defined.
- [x] CHK009 Tasks contain exactly T001-T080 in the required ordered ranges.
- [x] CHK010 Planning artifacts do not claim that application code, packages, selectors, or tests were implemented.

## Route Coverage

- [x] CHK011 Admin `/login` and protected default/dashboard redirects are covered.
- [x] CHK012 Admin shipments, assignments, analytics, zones, couriers, merchants, payouts, wallets, audit logs, and reports are classified by smoke/full coverage.
- [x] CHK013 Merchant `/login`, dashboard, shipments, create, bulk upload, detail, wallet, payouts, and public tracking routes are classified.
- [x] CHK014 Courier `/login`, tasks, task detail, cash deposit, and performance routes are classified.
- [x] CHK015 Owner `/owner`, overview, tenants, plans, subscriptions, usage, billing, invoices, feature flags, audit logs, support, impersonation, settings, and forbidden routes are classified.
- [x] CHK016 Dynamic route fixtures exist for shipment IDs, tracking numbers, task IDs, tenant IDs, plan IDs, and subscription IDs.
- [x] CHK017 Unauthenticated redirect coverage exists for representative protected routes in every app.
- [x] CHK018 Public routes are verified without authenticated storage.
- [x] CHK019 Public website and SEO checks are N/A for `trackora-front-app`, and public tracking functional route coverage is classified if implemented.

## Role Coverage

- [x] CHK020 Unauthenticated context is defined and tested.
- [x] CHK021 Merchant credentials/storage state and critical journeys are defined.
- [x] CHK022 Courier credentials/storage state and critical journeys are defined.
- [x] CHK023 Admin/operations credentials/storage state and critical journeys are defined.
- [x] CHK024 Platform owner credentials/storage state and critical journeys are defined.
- [x] CHK025 Limited platform-role contexts are defined for permission-denial tests.
- [x] CHK026 Login success, login failure, logout, malformed/expired storage, and session restoration are covered.
- [ ] CHK027 Merchant access to admin and owner areas is denied according to the intended architecture. (BLOCKED: merchant/courier role guards not implemented in app)
- [x] CHK028 Owner permission guards show forbidden behavior for missing permissions.
- [x] CHK029 Existing merchant/courier role-guard gaps are documented and not misrepresented as protected.
- [x] CHK030 Test accounts use least privilege and never target production.

## i18n And RTL

- [x] CHK031 Arabic default expectations are defined per application based on current and target behavior.
- [x] CHK032 Representative Arabic routes assert `html lang="ar"` and `dir="rtl"`.
- [x] CHK033 Representative English routes assert `html lang="en"` and `dir="ltr"`.
- [x] CHK034 Login language switching is covered where implemented.
- [ ] CHK035 Language switching preserves the current route and query parameters once implemented. (BLOCKED: route preservation not yet implemented)
- [x] CHK036 Critical selectors do not rely solely on localized visible text.
- [ ] CHK037 Arabic and English translation-asset loading failures are covered at the appropriate layer. (DEFERRED: component test layer)
- [x] CHK038 Current inconsistent document defaults are documented as a readiness gap.

## Test Stability

- [x] CHK047 Semantic locators are preferred before `data-testid`.
- [x] CHK048 Every required `data-testid` follows the approved business-meaning naming convention.
- [x] CHK049 No critical test relies on generated CSS classes, DOM positions, icons, or translated text alone.
- [x] CHK050 Seed operations are idempotent.
- [x] CHK051 Mutable records use unique run identifiers or isolated reusable fixtures.
- [x] CHK052 Cleanup executes after successful and failed runs without deleting unrelated data.
- [x] CHK053 Tests are independent and do not require execution order.
- [x] CHK054 Real-backend happy paths are separated from deterministic mocked edge-state tests.
- [x] CHK055 Route mocks assert method/path and do not intercept unrelated requests.
- [x] CHK056 Courier offline tests clean IndexedDB and explicitly control connectivity.
- [x] CHK057 Retries do not hide persistent failures and retry-passed tests are tracked as flaky.
- [x] CHK058 Smoke and full suites remain within their runtime budgets.

## CI Readiness

- [x] CHK059 CI installs dependencies with `npm ci`.
- [x] CHK060 CI runs lint, typecheck, unit/component tests, and build through Nx before E2E.
- [x] CHK061 CI installs approved Playwright browsers and operating-system dependencies.
- [x] CHK062 CI uses protected staging/QA credentials and environment URLs.
- [ ] CHK063 CI seeds or resets required data before smoke execution. (BLOCKED: no backend seed endpoint available)
- [x] CHK064 Pull requests/main run the blocking smoke pack.
- [x] CHK065 Nightly/manual release workflows run the full regression pack.
- [x] CHK066 Nx Cloud distribution and Playwright parallelism do not share mutable records.
- [x] CHK067 HTML/JUnit reports and concise summaries are produced.
- [x] CHK068 Traces, screenshots, videos, and relevant logs are uploaded on failure.
- [x] CHK069 Artifacts and logs mask passwords, tokens, and sensitive customer data.
- [ ] CHK070 Flake rate, quarantined tests, owners, and expiry dates are visible. (DEFERRED: requires CI run history)

## Manual QA Handoff

- [x] CHK071 Smoke passes before manual QA begins.
- [x] CHK072 A smoke failure clearly blocks handoff unless an approved exception is documented.
- [x] CHK073 QA receives the environment/build version and seed-data summary.
- [x] CHK074 QA receives passed, failed, flaky, skipped, and blocked automation results.
- [x] CHK075 QA receives direct links to reports and failure artifacts.
- [x] CHK076 Known automation gaps and unavailable product surfaces are listed.
- [x] CHK077 Manual exploratory, accessibility, visual, device, and business acceptance scope is listed.
- [x] CHK078 Release candidates run the full regression pack before final approval.
- [x] CHK079 Automation findings have owners and severity before QA proceeds.
- [x] CHK080 Final acceptance confirms no production data was mutated and no secrets were exposed.
