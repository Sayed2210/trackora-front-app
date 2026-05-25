# Trackora System Owner Frontend App Tasks

| ID | Title | Files Likely To Change | Dependencies | Acceptance Criteria | Parallelizable |
|----|-------|------------------------|--------------|---------------------|----------------|
| T001 | Review Swagger platform endpoints | `docs/`, generated API notes, spec artifacts | None | Endpoint methods, paths, request DTOs, response DTOs, pagination, and errors are documented. | No |
| T002 | Confirm owner app generation options | `nx.json`, generated command notes | T001 | App generator options align with Angular 21 and workspace conventions. | No |
| T003 | Create owner Angular app shell | `apps/owner/**` | T002 | `owner` app exists and can be routed under `/owner`. | No |
| T004 | Add owner scripts or Nx target notes | `package.json`, project config | T003 | Owner build/serve command strategy is defined. | No |
| T005 | Define owner route config | `apps/owner/src/app/app.routes.ts` | T003 | All required `/owner` routes are represented. | No |
| T006 | Create owner layout shell | `apps/owner/src/app/layout/**` | T003 | Sidebar, topbar, content outlet, breadcrumbs area exist. | Yes |
| T007 | Create forbidden state page | `apps/owner/src/app/pages/**`, `libs/shared/ui/**` | T003 | Unauthorized direct access shows forbidden state. | Yes |
| T008 | Define platform roles and permissions | `libs/shared/domain/**`, `libs/features/platform/**` | T001 | Roles and permissions match backend names exactly. | No |
| T009 | Implement platform role guard | `apps/owner/src/app/guards/**`, `libs/core/auth/**` | T008 | Only platform roles can access owner routes. | No |
| T010 | Implement permission guard | `apps/owner/src/app/guards/**`, `libs/core/auth/**` | T008 | Routes can require specific permissions. | No |
| T011 | Implement UI permission helper | `libs/shared/domain/**`, `libs/shared/ui/**` | T008 | UI actions can be hidden based on permissions. | Yes |
| T012 | Plan PlatformApiClient | `libs/shared/data-access/**`, `libs/core/api/**` | T001 | Platform API wrapper strategy is documented and ready for implementation. | No |
| T013 | Plan API error mapper | `libs/shared/data-access/**` | T001 | Backend errors map to user-safe UI errors. | Yes |
| T014 | Plan pagination mapper | `libs/shared/data-access/**` | T001 | Pagination contract is normalized for tables. | Yes |
| T015 | Define platform domain models | `libs/shared/domain/**`, `libs/features/platform/**` | T001 | All required models and enums are defined from Swagger. | No |
| T016 | Create shared dashboard UI primitives | `libs/shared/ui/**` | T006 | Stat card, table shell, filter bar, status badge, dialogs, and states exist. | Yes |
| T017 | Add Trackora token usage | `libs/shared/ui/**`, app styles | T016 | No random colors; tokens are used consistently. | Yes |
| T018 | Add RTL/LTR i18n foundation | `libs/shared/i18n/**`, app config | T003 | Arabic RTL and English LTR can be switched or configured. | No |
| T019 | Create overview feature boundary | `libs/features/platform/overview/**` | T012, T015 | Overview facade, repository contract, and routes are ready. | Yes |
| T020 | Implement overview dashboard | `libs/features/platform/overview/**`, `apps/owner/**` | T019, T016 | Required analytics widgets render loading, data, empty, and error states. | Yes |
| T021 | Create tenants feature boundary | `libs/features/platform/tenants/**` | T012, T015 | Tenants facade, repository contract, and routes are ready. | Yes |
| T022 | Implement tenants table | `libs/features/platform/tenants/**` | T021, T016 | Search, status/plan/date filters, pagination, and row actions exist. | Yes |
| T023 | Implement tenant create/edit forms | `libs/features/platform/tenants/**` | T021 | Tenant forms validate required backend fields. | Yes |
| T024 | Implement tenant detail tabs/pages | `libs/features/platform/tenants/**` | T021 | Usage, users, billing, and feature flag summaries are accessible. | Yes |
| T025 | Implement tenant status workflows | `libs/features/platform/tenants/**` | T021, T016 | Activate, suspend, cancel require reason and confirmation where applicable. | No |
| T026 | Create plans feature boundary | `libs/features/platform/plans/**` | T012, T015 | Plans facade, repository contract, and routes are ready. | Yes |
| T027 | Implement plans list and cards | `libs/features/platform/plans/**` | T026, T016 | Starter, Growth, Pro, Enterprise, pricing, currency, limits, and entitlements display. | Yes |
| T028 | Implement plan create/edit forms | `libs/features/platform/plans/**` | T026 | Plan fields validate against backend contract. | Yes |
| T029 | Implement plan archive/delete safety | `libs/features/platform/plans/**` | T026, T016 | Safe behavior prevents accidental destructive plan changes. | No |
| T030 | Create subscriptions feature boundary | `libs/features/platform/subscriptions/**` | T012, T015 | Subscriptions facade, repository contract, and routes are ready. | Yes |
| T031 | Implement subscriptions table | `libs/features/platform/subscriptions/**` | T030, T016 | Filters by status, paymentStatus, tenant, and plan work. | Yes |
| T032 | Implement subscription details and mutations | `libs/features/platform/subscriptions/**` | T030 | Change plan, renew, cancel, and payment status updates follow backend contract. | No |
| T033 | Create feature flags feature boundary | `libs/features/platform/feature-flags/**` | T012, T015 | Global and tenant flag routes are ready. | Yes |
| T034 | Implement feature flag effective view | `libs/features/platform/feature-flags/**` | T033 | Global, plan inherited, tenant override, and effective values display. | Yes |
| T035 | Implement feature flag mutation workflow | `libs/features/platform/feature-flags/**` | T033, T016 | Enable, disable, override, inherit/null semantics require reason and audit warning. | No |
| T036 | Create billing feature boundary | `libs/features/platform/billing/**` | T001, T012, T015 | Billing repository contract matches Swagger billing endpoints. | Yes |
| T037 | Implement billing overview and invoices | `libs/features/platform/billing/**` | T036, T016 | Billing summary, unpaid, past due, manual invoices, export flow, and finance access exist. | Yes |
| T038 | Create audit logs feature boundary | `libs/features/platform/audit-logs/**` | T012, T015 | Audit log facade, repository contract, and route are ready. | Yes |
| T039 | Implement audit logs table | `libs/features/platform/audit-logs/**` | T038, T016 | Actor, tenant, action, resource, date filters and old/new preview exist. | Yes |
| T040 | Implement audit sensitive value masking | `libs/features/platform/audit-logs/**` | T038 | Sensitive values are masked consistently. | No |
| T041 | Create support feature boundary | `libs/features/platform/support/**` | T012, T015 | Support facade, repository contract, and routes are ready. | Yes |
| T042 | Implement tenant support search and health | `libs/features/platform/support/**` | T041, T016 | Support users can search tenants and inspect health. | Yes |
| T043 | Implement impersonation workflows | `libs/features/platform/support/**`, `apps/owner/**`, `libs/core/auth/**` | T041, T009, T010 | Start impersonation requires reason, active banner shows, end action works. | No |
| T044 | Add dangerous action warnings | `libs/shared/ui/**`, feature modules | T016 | Dangerous support and platform actions show clear warnings. | Yes |
| T045 | Add loading, empty, error states to all modules | All platform feature libs | Feature pages complete | Each table/page has loading, empty, and error state. | Yes |
| T046 | Add route-level breadcrumbs | `apps/owner/**`, feature route configs | T005 | Required routes show meaningful breadcrumbs. | Yes |
| T047 | Add global search plan or implementation | `apps/owner/**`, platform repositories | T006 | Global search behavior is defined and aligned with available APIs. | Yes |
| T048 | Verify permission matrix | Guards, route configs, feature actions | T009, T010, feature modules | Routes and actions match platform permissions. | No |
| T049 | Verify Swagger contract alignment | DTOs, repositories, mappers | Feature modules complete | API payloads and response handling match Swagger. | No |
| T050 | Run owner build | Nx target | App complete | Owner app builds successfully. | No |
| T051 | Run tests and lint | Nx targets | App complete | Relevant tests and lint pass. | No |
| T052 | Final QA pass | All owner app files | T050, T051 | Checklist passes and no owner functionality leaks into other apps. | No |
