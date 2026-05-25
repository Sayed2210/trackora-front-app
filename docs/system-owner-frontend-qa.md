# System Owner Frontend QA Checklist

## 1. Environment Setup

### Backend

- Start the backend API using the project backend run command for the target environment.
- Confirm the API base URL is reachable from the owner frontend.
- Confirm Swagger/OpenAPI is available for contract checks when the backend environment exposes it.
- Confirm authentication, platform roles, and platform permissions are seeded before starting route and permission QA.

### Owner Frontend

- Install dependencies from the repository root if needed: `npm install`.
- Run the owner app through Nx: `npm exec -- nx run owner:serve`.
- Open the owner app at the configured dev-server URL.
- If testing e2e locally, confirm Playwright browser binaries are already installed before running e2e.

### Required Env Variables

- `API_BASE_URL`: backend API origin used by the frontend API interceptor.
- `BASE_URL`: optional Playwright base URL for owner e2e tests.
- Auth/session variables required by the backend environment.
- Any tenant, billing, support, or audit-log service variables required by the backend seed environment.

### Required Seeded Data

- Platform users for each supported role: `PLATFORM_OWNER`, `PLATFORM_ADMIN`, `PLATFORM_SUPPORT`, `PLATFORM_FINANCE`.
- A non-platform user for forbidden-access checks.
- Tenants covering active, trial, suspended, canceled, unpaid, and past-due states.
- Plans covering active and archived/deletable states, plus at least one plan attached to active subscriptions for conflict checks.
- Subscriptions covering active, trialing, past-due, canceled, renewable, and plan-change scenarios.
- Global feature flags and tenant override data for inherited, enabled, disabled, and null override states.
- Billing overview data, invoices, unpaid tenants, and past-due tenants.
- Audit logs with old/new values containing sensitive fields for masking checks.
- Support tenant health data with alerts, integrations, usage warnings, and safe summary-only data.
- Active impersonation session fixture or workflow path for banner verification.

### Login Credentials Placeholder

- Platform owner email: `<PLATFORM_OWNER_EMAIL>`
- Platform owner password: `<PLATFORM_OWNER_PASSWORD>`
- Platform admin email: `<PLATFORM_ADMIN_EMAIL>`
- Platform support email: `<PLATFORM_SUPPORT_EMAIL>`
- Platform finance email: `<PLATFORM_FINANCE_EMAIL>`
- Non-platform user email: `<NON_PLATFORM_EMAIL>`

## 2. Automated Commands

- Owner build: `npm exec -- nx run owner:build`
- Owner lint: `npm exec -- nx run owner:lint`
- Owner test: `npm exec -- nx run owner:test`
- Affected lint/test: `npm exec -- nx affected -t lint,test --base=origin/dev`
- Owner-related matrix: `npm exec -- nx run-many -t lint test build --projects=owner,overview,tenants,plans,subscriptions,feature-flags,billing,audit-logs,support`
- Owner e2e smoke, if Playwright browser binaries are available: `npm exec -- nx run owner-e2e:e2e`
- If Playwright browser binaries are missing, record e2e as skipped. Do not install browsers unless project policy allows it.

## 3. Manual Route Checklist

- `/owner`: verifies authenticated platform users land on the overview, unauthenticated users are redirected, and forbidden users are blocked.
- `/owner/overview`: verifies overview cards, analytics widgets, loading state, empty/error handling, and responsive layout.
- `/owner/tenants`: verifies tenant list, filters, search, pagination, row actions, permission-aware actions, and safe errors.
- `/owner/tenants/create`: verifies required fields, validation, successful creation feedback, and backend validation errors.
- `/owner/tenants/:tenantId`: verifies tenant summary, status, metadata, lifecycle actions, reason-required status changes, and 404 handling.
- `/owner/tenants/:tenantId/usage`: verifies usage cards, limits, empty usage, loading, error, and responsive tables/cards.
- `/owner/tenants/:tenantId/users`: verifies user summary, empty state, errors, permission access, and no sensitive credentials shown.
- `/owner/tenants/:tenantId/billing`: verifies tenant billing summary, invoice/payment status, empty state, errors, and finance permission handling.
- `/owner/tenants/:tenantId/feature-flags`: verifies tenant overrides, inherited values, warning/confirmation, reason-required mutation, and audit-safe messaging.
- `/owner/plans`: verifies plan list/cards, filters, archive/delete confirmation, conflict handling, and permission-aware actions.
- `/owner/plans/create`: verifies form validation, plan limits, entitlements, success feedback, and backend validation errors.
- `/owner/plans/:planId`: verifies plan detail, limits, entitlements, linked subscription conflict behavior, and 404 handling.
- `/owner/plans/:planId/edit`: verifies edit validation, successful update, disabled/hidden unauthorized actions, and validation errors.
- `/owner/subscriptions`: verifies subscription list, status/payment filters, pagination, loading, empty, and error states.
- `/owner/subscriptions/:subscriptionId`: verifies details, change plan, cancel, renew, update payment status, reason-required workflows, and conflict handling.
- `/owner/usage`: verifies platform usage placeholder or usage content, analytics permission guard, loading/empty/error states if API-backed.
- `/owner/billing`: verifies billing summary, unpaid tenants, past-due tenants, finance guard, empty/error states, and export disabled/unavailable handling.
- `/owner/invoices`: verifies invoices list, filters, pagination, loading, empty, errors, and permission handling.
- `/owner/feature-flags`: verifies global flags, reason-required updates, warning copy, loading, empty, and error states.
- `/owner/audit-logs`: verifies filters, table, details/previews, sensitive value masking, loading, empty, and error states.
- `/owner/support`: verifies safe tenant search, support-only access, no shipment/private customer data leakage, confirmation before impersonation, and reason requirement.
- `/owner/support/tenants/:tenantId`: verifies tenant health summary, safe data only, alerts/integrations/usage warnings, and impersonation confirmation/reason.
- `/owner/support/impersonation`: verifies active context, end impersonation confirmation, `/auth/me` refresh, and banner state.
- `/owner/settings`: verifies route protection, layout consistency, placeholder copy if still pending backend permission confirmation, and forbidden handling.

## 4. Permission Checklist

### PLATFORM_OWNER

- Can access all owner areas when seeded with all platform permissions.
- Can see all permitted navigation items.
- Can perform permitted sensitive workflows after confirmation and reason entry.
- Cannot bypass reason-required workflows.

### PLATFORM_ADMIN

- Can access operational areas matching assigned permissions.
- Cannot access finance-only areas without `view_billing`.
- Cannot access support impersonation without support role or `impersonate_tenant_admin`.
- Missing permissions show forbidden page on direct route access.

### PLATFORM_SUPPORT

- Can access support-related areas when role/permission allows.
- Can inspect safe tenant health summaries only.
- Can start impersonation only after confirmation and reason.
- Cannot access billing, plans, feature flags, audit logs, or subscriptions unless explicitly seeded with those permissions.

### PLATFORM_FINANCE

- Can access billing and invoices when seeded with `view_billing`.
- Can access subscription payment visibility only when route permissions allow.
- Cannot access support impersonation, tenant mutation, feature flag mutation, plans, or audit logs without matching permissions.

### Non-Platform User

- Cannot access `/owner` or any owner child route.
- Direct route access shows forbidden or redirects according to auth state.
- Owner navigation and owner functionality are not exposed in admin, merchant, courier, or public website apps.

## 5. CRUD And Workflow Checklist

### Tenants

- List tenants with search, filters, and pagination.
- Create tenant with required-field validation and success feedback.
- Open tenant detail and verify summary data.
- Activate, suspend, or cancel tenant only with required reason.
- Verify 400 validation, 403 forbidden, 404 not found, and 409 conflict messaging.

### Plans

- List plans and verify active/archived state display.
- Create and edit plans with supported fields only.
- Verify plan limits and feature entitlements.
- Archive/delete only after confirmation.
- Verify conflict handling for plans attached to active subscriptions.

### Subscriptions

- List subscriptions with status, payment status, tenant, plan, and date filters.
- Open subscription details and verify usage against limits.
- Change plan, cancel, renew, and update payment status only with required reason.
- Verify success feedback, conflict handling, and safe error messages.

### Feature Flags

- List global flags and tenant flags.
- Verify inherited, effective, enabled, disabled, and override/null semantics.
- Mutate global and tenant flags only with reason.
- Verify tenant override warning/confirmation before save.
- Verify unauthorized mutation actions are hidden or disabled.

### Billing

- Verify billing summary, unpaid tenants, and past-due tenants.
- Verify invoices list, filters, pagination, empty, and error states.
- Verify finance-only access and safe forbidden behavior.
- Verify export action remains disabled or clearly unavailable until backend endpoint exists.

### Audit Logs

- Search/filter by actor, tenant, action, resource, and date.
- Verify old/new values preview.
- Verify reason, IP address, and user agent display.
- Verify sensitive values are masked.
- Verify empty/error states and no backend stack traces are displayed.

### Support And Impersonation

- Search tenants using support-safe fields.
- Open tenant health and verify no private customer shipment data is exposed.
- Start impersonation only after confirmation and reason.
- Verify active impersonation banner is visually distinct from a normal owner session.
- Verify banner cannot be dismissed without ending impersonation.
- End impersonation and verify `/auth/me` refresh removes impersonation context.
- Verify platform owner routes remain protected during impersonation.

## 6. API Integration Checklist

For every module, verify these states and status codes:

- Analytics/overview: loading state, success state, empty state, error state, 401 redirect/logout, 403 forbidden, 404 safe not-found message, 409 safe conflict message if returned.
- Tenants: loading state, success state, empty state, error state, 401 redirect/logout, 403 forbidden, 404 safe not-found message, 409 validation/conflict message.
- Plans: loading state, success state, empty state, error state, 401 redirect/logout, 403 forbidden, 404 safe not-found message, 409 validation/conflict message.
- Subscriptions: loading state, success state, empty state, error state, 401 redirect/logout, 403 forbidden, 404 safe not-found message, 409 validation/conflict message.
- Feature flags: loading state, success state, empty state, error state, 401 redirect/logout, 403 forbidden, 404 safe not-found message, 409 validation/conflict message.
- Billing/invoices: loading state, success state, empty state, error state, 401 redirect/logout, 403 forbidden, 404 safe not-found message, 409 validation/conflict message.
- Audit logs: loading state, success state, empty state, error state, 401 redirect/logout, 403 forbidden, 404 safe not-found message, 409 validation/conflict message.
- Support/impersonation: loading state, success state, empty state, error state, 401 redirect/logout, 403 forbidden, 404 safe not-found message, 409 validation/conflict message.
- `/auth/me`: success state updates current user/session, 401 clears auth and redirects, impersonation context appears/disappears correctly, errors are safe and do not expose stack traces.

## 7. RTL/LTR Checklist

- Arabic RTL: verify `html[lang="ar"]` and `dir="rtl"`, sidebar alignment, topbar alignment, breadcrumbs order, tables, forms, dialogs, status badges, and action menus.
- English LTR: verify `html[lang="en"]` and `dir="ltr"`, sidebar alignment, topbar alignment, breadcrumbs order, tables, forms, dialogs, status badges, and action menus.
- Tables: verify no severe horizontal overflow on desktop, laptop, and tablet widths.
- Forms: verify labels, validation messages, inputs, and buttons align correctly in both directions.
- Dialogs: verify confirmation and reason-required dialogs align correctly in both directions.
- Sidebar: verify active nav item, hidden unauthorized items, and responsive layout in both directions.
- Breadcrumbs: verify readable capitalization, separators, and current-route styling in both directions.

## 8. Known TODOs

- Backend Swagger/live environment may be required to re-confirm billing endpoint details before release.
- Seed data is required for complete permission, conflict, empty-state, and impersonation coverage.
- If Playwright browser binaries are missing in a local or CI environment, owner e2e smoke must be recorded as skipped unless project policy allows installing browsers.
- Billing export endpoint is not available; export UI should remain disabled or clearly marked unavailable until backend support exists.
- Existing owner production build may emit a bundle budget warning; track separately from functional QA unless it becomes a release gate.
