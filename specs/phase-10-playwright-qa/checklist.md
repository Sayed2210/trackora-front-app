# Playwright QA Planning And Readiness Checklist

**Purpose**: Validate planning completeness and implementation readiness for Phase 10 Playwright QA automation.  
**Created**: 2026-06-10  
**Feature**: `specs/phase-10-playwright-qa/spec.md`

## Planning Completeness

- [ ] CHK001 The specification includes prioritized, independently testable user stories.
- [ ] CHK002 Functional and non-functional requirements are complete and traceable.
- [ ] CHK003 In-scope and out-of-scope boundaries are explicit.
- [ ] CHK004 Critical journeys, edge cases, acceptance criteria, and success metrics are documented.
- [ ] CHK005 The testing pyramid defines unit, component, API contract, smoke E2E, full E2E, and manual QA ownership.
- [ ] CHK006 Current audit findings distinguish implemented behavior from requested but unavailable behavior.
- [ ] CHK007 Smoke and full regression packs have distinct scope, runtime goals, and execution policies.
- [ ] CHK008 Environment, data, mocking, selectors, CI, reporting, risks, and rollout phases are defined.
- [ ] CHK009 Tasks contain exactly T001-T080 in the required ordered ranges.
- [ ] CHK010 Planning artifacts do not claim that application code, packages, selectors, or tests were implemented.

## Route Coverage

- [ ] CHK011 Admin `/login` and protected default/dashboard redirects are covered.
- [ ] CHK012 Admin shipments, assignments, analytics, zones, couriers, merchants, payouts, wallets, audit logs, and reports are classified by smoke/full coverage.
- [ ] CHK013 Merchant `/login`, dashboard, shipments, create, bulk upload, detail, wallet, payouts, and public tracking routes are classified.
- [ ] CHK014 Courier `/login`, tasks, task detail, cash deposit, and performance routes are classified.
- [ ] CHK015 Owner `/owner`, overview, tenants, plans, subscriptions, usage, billing, invoices, feature flags, audit logs, support, impersonation, settings, and forbidden routes are classified.
- [ ] CHK016 Dynamic route fixtures exist for shipment IDs, tracking numbers, task IDs, tenant IDs, plan IDs, and subscription IDs.
- [ ] CHK017 Unauthenticated redirect coverage exists for representative protected routes in every app.
- [ ] CHK018 Public routes are verified without authenticated storage.
- [ ] CHK019 Public website and SEO checks are N/A for `trackora-front-app`, and public tracking functional route coverage is classified if implemented.

## Role Coverage

- [ ] CHK020 Unauthenticated context is defined and tested.
- [ ] CHK021 Merchant credentials/storage state and critical journeys are defined.
- [ ] CHK022 Courier credentials/storage state and critical journeys are defined.
- [ ] CHK023 Admin/operations credentials/storage state and critical journeys are defined.
- [ ] CHK024 Platform owner credentials/storage state and critical journeys are defined.
- [ ] CHK025 Limited platform-role contexts are defined for permission-denial tests.
- [ ] CHK026 Login success, login failure, logout, malformed/expired storage, and session restoration are covered.
- [ ] CHK027 Merchant access to admin and owner areas is denied according to the intended architecture.
- [ ] CHK028 Owner permission guards show forbidden behavior for missing permissions.
- [ ] CHK029 Existing merchant/courier role-guard gaps are documented and not misrepresented as protected.
- [ ] CHK030 Test accounts use least privilege and never target production.

## i18n And RTL

- [ ] CHK031 Arabic default expectations are defined per application based on current and target behavior.
- [ ] CHK032 Representative Arabic routes assert `html lang="ar"` and `dir="rtl"`.
- [ ] CHK033 Representative English routes assert `html lang="en"` and `dir="ltr"`.
- [ ] CHK034 Login language switching is covered where implemented.
- [ ] CHK035 Language switching preserves the current route and query parameters once implemented.
- [ ] CHK036 Critical selectors do not rely solely on localized visible text.
- [ ] CHK037 Arabic and English translation-asset loading failures are covered at the appropriate layer.
- [ ] CHK038 Current inconsistent document defaults are documented as a readiness gap.

## Test Stability

- [ ] CHK047 Semantic locators are preferred before `data-testid`.
- [ ] CHK048 Every required `data-testid` follows the approved business-meaning naming convention.
- [ ] CHK049 No critical test relies on generated CSS classes, DOM positions, icons, or translated text alone.
- [ ] CHK050 Seed operations are idempotent.
- [ ] CHK051 Mutable records use unique run identifiers or isolated reusable fixtures.
- [ ] CHK052 Cleanup executes after successful and failed runs without deleting unrelated data.
- [ ] CHK053 Tests are independent and do not require execution order.
- [ ] CHK054 Real-backend happy paths are separated from deterministic mocked edge-state tests.
- [ ] CHK055 Route mocks assert method/path and do not intercept unrelated requests.
- [ ] CHK056 Courier offline tests clean IndexedDB and explicitly control connectivity.
- [ ] CHK057 Retries do not hide persistent failures and retry-passed tests are tracked as flaky.
- [ ] CHK058 Smoke and full suites remain within their runtime budgets.

## CI Readiness

- [ ] CHK059 CI installs dependencies with `npm ci`.
- [ ] CHK060 CI runs lint, typecheck, unit/component tests, and build through Nx before E2E.
- [ ] CHK061 CI installs approved Playwright browsers and operating-system dependencies.
- [ ] CHK062 CI uses protected staging/QA credentials and environment URLs.
- [ ] CHK063 CI seeds or resets required data before smoke execution.
- [ ] CHK064 Pull requests/main run the blocking smoke pack.
- [ ] CHK065 Nightly/manual release workflows run the full regression pack.
- [ ] CHK066 Nx Cloud distribution and Playwright parallelism do not share mutable records.
- [ ] CHK067 HTML/JUnit reports and concise summaries are produced.
- [ ] CHK068 Traces, screenshots, videos, and relevant logs are uploaded on failure.
- [ ] CHK069 Artifacts and logs mask passwords, tokens, and sensitive customer data.
- [ ] CHK070 Flake rate, quarantined tests, owners, and expiry dates are visible.

## Manual QA Handoff

- [ ] CHK071 Smoke passes before manual QA begins.
- [ ] CHK072 A smoke failure clearly blocks handoff unless an approved exception is documented.
- [ ] CHK073 QA receives the environment/build version and seed-data summary.
- [ ] CHK074 QA receives passed, failed, flaky, skipped, and blocked automation results.
- [ ] CHK075 QA receives direct links to reports and failure artifacts.
- [ ] CHK076 Known automation gaps and unavailable product surfaces are listed.
- [ ] CHK077 Manual exploratory, accessibility, visual, device, and business acceptance scope is listed.
- [ ] CHK078 Release candidates run the full regression pack before final approval.
- [ ] CHK079 Automation findings have owners and severity before QA proceeds.
- [ ] CHK080 Final acceptance confirms no production data was mutated and no secrets were exposed.

