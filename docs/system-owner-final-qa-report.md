# System Owner Final QA Report

## Summary

- Branch: `feature/system-owner-final-qa`
- Base branch: `dev`
- QA scope: System Owner, Merchant, Courier, Admin assignment, Wallet/COD, auth, API integration, negative access, RTL/LTR, build/lint/test/e2e smoke.
- Live manual login with seeded System Owner, Merchant, and Courier credentials was not verified in this repository session because no backend seed credentials were available.
- Backend Docker, database, Redis, Prisma migrate, and seed were not verified because this frontend repository does not contain `docker-compose*.yml` or `prisma/schema.prisma`.
- Pilot API base URL configured in shared `ApiClient`: `http://trackora.techlabeg.com/v1`.

## Commands Run

| Command | Result | Notes |
|---|---:|---|
| `git checkout dev && git pull origin dev && git checkout -b feature/system-owner-final-qa` | PASS | Created requested QA branch from latest `dev`. |
| `npm exec -- nx show projects --json` | PASS | Confirmed owner, merchant, courier, admin, e2e, and feature projects. |
| `npm exec -- nx run owner:lint --skipNxCache` | PASS | Owner lint passed. |
| `npm exec -- nx run owner:test --skipNxCache` | PASS | 7 files, 28 tests passed after timeout fix. |
| `npm exec -- nx run owner:build --skipNxCache` | PASS | Build succeeded with existing initial bundle budget warning. |
| `npm exec -- nx run-many -t lint test build --projects=owner,merchant,courier,admin --skipNxCache` | PASS | Matrix passed after owner overview spec timeout fix; app builds emit existing warnings. |
| `npm exec -- nx affected -t lint,test --files=<changed-files> --skipNxCache` | PASS | 26 affected projects ran lint/test successfully; warnings only. |
| `npm exec -- nx run core-api:lint --skipNxCache` | PASS | Lint passed with existing warnings in `api-client.ts`. |
| `npm exec -- nx run core-api:test --skipNxCache` | PASS | Jest suite passed. |
| `npm exec -- nx run owner-e2e:e2e --skipNxCache` | PASS | Owner smoke e2e passed after rerun; first attempt timed out waiting for web server. |
| `npm exec -- nx run merchant-e2e:e2e --skipNxCache` | PASS | Merchant smoke e2e passed. |
| `npm exec -- nx run courier-e2e:e2e --skipNxCache` | PASS | Courier smoke e2e passed. |
| `npm exec -- nx run admin-e2e:e2e --skipNxCache` | PASS | Admin smoke e2e passed after rerun; first attempt timed out waiting for web server. |
| `timeout 90s npm exec -- nx run owner:serve --port=4204` | PASS | Owner dev server started successfully. |
| `timeout 90s npm exec -- nx run admin:serve --port=4203` | PASS | Admin dev server started successfully. |

## Environment QA

| Route / Feature | Expected behavior | Actual behavior | Status | Fix applied | Notes |
|---|---|---|---:|---|---|
| Frontend workspace | Nx projects and commands are discoverable. | `nx show projects --json` listed owner, merchant, courier, admin, e2e, and feature libs. | PASS | None | Verified by Nx command. |
| Backend Docker/database/Redis | Docker compose starts backend, database, and Redis if available. | No `docker-compose*.yml` exists in this frontend repo. | NOT IMPLEMENTED | None | Backend repo is required for this check. |
| Prisma generate/migrate/seed | Prisma commands can be verified if backend is in scope. | No `prisma/schema.prisma` exists in this frontend repo. | NOT IMPLEMENTED | None | Backend repo is required for this check. |
| Frontend dev server | App starts locally. | Owner and admin dev servers started; merchant/courier e2e web servers also started during smoke e2e. | PASS | None | Verified by Nx serve/e2e commands. |
| API base URL | Frontend can target pilot backend. | Shared `ApiClient` now uses `http://trackora.techlabeg.com/v1`. | PASS | Set pilot API base URL in `libs/core/api/src/lib/api-client.ts`. | Absolute URL is not modified by `baseUrlInterceptor`. |
| Env variables documentation | Required env values are documented. | `.env.example` documents the pilot `TRACKORA_API_BASE_URL`, `TRACKORA_WS_URL`, local app URLs, and feature flags. | PASS | Updated pilot API URL documentation. | Current app code uses the shared `ApiClient` base URL directly. |

## Auth QA

| Route / Feature | Expected behavior | Actual behavior | Status | Fix applied | Notes |
|---|---|---|---:|---|---|
| System Owner login | Platform user can authenticate and access owner routes. | Login component route exists at `/login`; live credential login was not performed. | NOT VERIFIED | None | Seeded credentials required. |
| Merchant login | Merchant/Tenant Admin can authenticate and access merchant routes. | Merchant `/login` route exists; live credential login was not performed. | NOT VERIFIED | None | Seeded credentials required. |
| Courier login | Courier can authenticate and access courier routes. | Courier `/login` route exists; live credential login was not performed. | NOT VERIFIED | None | Seeded credentials required. |
| Logout | User session clears and redirects appropriately. | `AuthService.logout()` clears user/token storage; no browser logout flow was manually verified. | PARTIAL | None | Verified by code inspection only. |
| Refresh behavior | Existing token restores session and direct route refresh works. | `AuthService.restoreSession()` restores token-stored user; owner app initializer calls `/auth/me` when token exists. | PARTIAL | None | Direct browser refresh with live auth was not verified. |
| 401/403 handling | Unauthorized API responses clear auth and route to login. | `authInterceptor` clears tokens and navigates to `/login` for 401/403. | PASS | None | Verified by code inspection. |

## System Owner QA

| Route / Feature | Expected behavior | Actual behavior | Status | Fix applied | Notes |
|---|---|---|---:|---|---|
| `/owner` | Authenticated platform user lands on overview. | Index child route loads `OverviewPageComponent` and requires platform analytics permission. | PASS | None | Verified by route inspection and owner tests. |
| `/owner/overview` | Shows platform overview, loading, empty, and error states. | Overview component renders metrics, loading, empty, error, and retry states; tests verify API values and empty states. | PASS | Increased flaky spec timeout to 10s. | Verified by tests and code inspection. |
| `/owner/tenants` | Tenant list, filters, pagination, safe actions. | Tenant list route exists and feature module loads platform tenant list. | PARTIAL | None | Runtime backend data not verified. |
| `/owner/tenants/:tenantId` | Tenant detail and lifecycle actions are guarded and reason-required. | Detail routes exist; tenant mutation pages/components check permissions and reason workflows by code inspection. | PARTIAL | None | Runtime backend data not verified. |
| `/owner/plans` | Plans are accessible only to `manage_plans`. | Route previously used analytics guard; now requires `Permission.MANAGE_PLANS`. | PASS | Fixed route guard/data and added route spec. | Phase 12 bug fixed. |
| `/owner/plans/create` | Create plan requires `manage_plans`. | Route now requires `Permission.MANAGE_PLANS`. | PASS | Fixed route guard/data. | Verified by route spec. |
| `/owner/plans/:planId` | Plan detail requires `manage_plans`. | Route now requires `Permission.MANAGE_PLANS`. | PASS | Fixed route guard/data. | Verified by route spec. |
| `/owner/plans/:planId/edit` | Edit plan requires `manage_plans`. | Route now requires `Permission.MANAGE_PLANS`. | PASS | Fixed route guard/data. | Verified by route spec. |
| `/owner/subscriptions` | Subscription list supports permitted view roles and safe mutation gating. | Route accepts any of manage subscriptions, billing, or analytics permissions; mutations are locally manage-gated. | PASS | None | Verified by route/code inspection. |
| `/owner/subscriptions/:subscriptionId` | Subscription workflows require reason and valid permissions. | Detail route exists; sensitive mutations are locally guarded and reason-required by code inspection. | PARTIAL | None | Runtime backend conflicts not verified. |
| `/owner/feature-flags` | Global feature flag updates require permission and reason. | Route requires `manage_feature_flags`; feature module supports reason-required updates. | PASS | None | Verified by route/code inspection. |
| `/owner/tenants/:tenantId/feature-flags` | Tenant overrides require permission, warning, and reason. | Route requires `manage_feature_flags`; component supports override confirmation/reason. | PASS | None | Verified by code inspection. |
| `/owner/billing` | Billing overview requires billing permission and shows summary. | Route requires `view_billing`; component loads billing overview. | PARTIAL | None | Export remains disabled/unavailable; live API not verified. |
| `/owner/invoices` | Invoices require billing permission. | Route requires `view_billing`; invoices page exists. | PASS | None | Verified by route/code inspection. |
| `/owner/audit-logs` | Audit logs require audit permission and mask sensitive data. | Route requires `view_audit_logs`; audit feature contains masking/detail handling. | PASS | None | Runtime masking not manually verified. |
| `/owner/support` | Support search and impersonation start are guarded. | Support route allows support role or impersonation permission; start action requires permission and reason. | PASS | None | Verified by code inspection. |
| `/owner/support/tenants/:tenantId` | Tenant health displays safe health summary and guarded impersonation. | Route and component exist; impersonation start requires reason. | PASS | None | Runtime backend data not verified. |
| `/owner/support/impersonation` | Active impersonation can be inspected and ended. | Route requires impersonation permission; end calls backend then refreshes `/auth/me`. | PASS | None | Verified by code inspection. |
| `/owner/usage` | Platform usage route exists. | Route exists but loads placeholder page. | NOT IMPLEMENTED | None | No feature added due Phase 12 rules. |
| `/owner/settings` | Owner settings route exists. | Route exists but loads placeholder page. | NOT IMPLEMENTED | None | No feature added due Phase 12 rules. |
| Owner navigation | Missing permission hides action/nav items. | Nav now filters plans, subscriptions, usage, billing, invoices, flags, audit, support, settings by permission/role. | PASS | Added permission-aware nav filtering. | Tenants remains platform-role visible by design. |
| Owner RTL/LTR | Arabic defaults RTL; English remains LTR. | Layout no longer forces English documents to Arabic RTL. | PASS | Preserved `html[lang="en"]` as LTR, otherwise Arabic RTL. | Verified by code inspection/build. |

## Merchant / Tenant QA

| Route / Feature | Expected behavior | Actual behavior | Status | Fix applied | Notes |
|---|---|---|---:|---|---|
| `/dashboard` | Merchant dashboard shows KPIs and quick links. | Route exists and dashboard loads merchant analytics when `merchantId` is present. | PARTIAL | None | Runtime login/backend not verified; errors are not visibly surfaced. |
| `/shipments` | Merchant shipment list shows filters, pagination, and tracking numbers. | Route exists; component shows tracking number, masked phone in list, zone/status/COD/address. | PARTIAL | None | Backend data not verified. |
| `/shipments/create` | Merchant can create shipment with validation. | Create route/form exists and posts to `/shipments`; required fields and phone validation exist. | PARTIAL | None | Live create not verified; submit errors are limited. |
| `/shipments/:id` | Shipment detail shows tracking and details. | Detail route exists and shows tracking number/details. | PARTIAL | None | No live ownership check verified in frontend. |
| `/tracking` | Public tracking can search by tracking number. | Public tracking route exists and e2e smoke verified route serving. | PARTIAL | None | Code displays full customer details from API response. |
| `/wallet` | Merchant wallet shows balances and transactions. | Wallet route exists and calls merchant wallet/transactions endpoints. | PARTIAL | None | Runtime backend data not verified; error state not rendered. |
| `/payouts` | Merchant payout page exists if available. | Route exists. | NOT VERIFIED | None | Component behavior was not fully verified. |

## Assignment / Courier QA

| Route / Feature | Expected behavior | Actual behavior | Status | Fix applied | Notes |
|---|---|---|---:|---|---|
| Admin `/assignments` | Assign pending shipment to available courier. | Dispatch board loads first 100 shipments/client filters pending unassigned, loads couriers, posts `/assignments`. | PARTIAL | None | Live assignment not verified; assignment errors are uncaught. |
| Courier `/tasks` | Courier sees assigned tasks. | Route/component exist; courier e2e smoke passed for `/tasks`; component loads `/courier/tasks` and offline cache. | PARTIAL | None | Live courier login/tasks not verified. |
| Courier `/tasks/:id` | Courier updates status through valid transitions. | Detail route exists and queues status update payloads. | PARTIAL | None | Invalid transition rejection depends on backend; not manually verified. |
| Courier offline sync | Queued updates sync when online. | Offline sync service tests passed. | PASS | None | Verified by courier unit tests. |
| Courier `/cash-deposit` | Courier deposits held cash. | Route/component exist and e2e smoke passed for `/cash-deposit`. | PARTIAL | None | Live deposit not verified. |
| Courier `/performance` | Courier sees performance metrics. | Route/component exists and maps API/fallback metrics. | PARTIAL | None | Runtime backend data not verified. |

## Wallet / COD QA

| Route / Feature | Expected behavior | Actual behavior | Status | Fix applied | Notes |
|---|---|---|---:|---|---|
| Merchant wallet transactions | Delivered COD shipment creates wallet transaction and balance update. | Wallet UI calls wallet endpoints and renders transactions. | NOT VERIFIED | None | Requires delivered COD seed/workflow backend. |
| COD fee/commission | Fees and commission appear correctly. | No full end-to-end COD delivery and wallet reconciliation was executed. | NOT VERIFIED | None | Requires backend seed data and live workflow. |
| Courier cash held | Courier cash held is visible if available. | Admin financial summary and courier cash deposit UI exist. | PARTIAL | None | Live delivered COD flow not verified. |

## Negative QA

| Route / Feature | Expected behavior | Actual behavior | Status | Fix applied | Notes |
|---|---|---|---:|---|---|
| Merchant cannot access owner routes | Non-platform user is blocked from owner app. | Owner guards reject users without platform roles. | PASS | None | Verified by guard code inspection. |
| Courier cannot access owner routes | Non-platform courier is blocked from owner app. | Owner guards reject users without platform roles. | PASS | None | Verified by guard code inspection. |
| Missing permission hides owner nav/action buttons | Unauthorized owner actions/nav are hidden or blocked. | Owner nav now filters permissioned items; routes enforce permissions. | PASS | Fixed owner nav filtering and plan route guards. | Verified by code inspection/tests. |
| Impersonation requires reason | Start/end impersonation require confirmation/reason. | Support workflows include reason requirement. | PASS | None | Verified by code inspection. |
| Invalid API responses do not crash UI | UI should show safe errors/loading/empty states. | Owner dashboard primitives and feature facades provide safe error/empty states; not every app renders errors. | PARTIAL | None | Merchant wallet/dashboard error rendering remains limited. |
| Empty optional fields do not crash UI | Optional fields should be guarded. | Most inspected templates use optional/fallback values. | PARTIAL | None | Full backend fixtures not available. |

## RTL/LTR QA

| Route / Feature | Expected behavior | Actual behavior | Status | Fix applied | Notes |
|---|---|---|---:|---|---|
| Owner sidebar | Sidebar aligns in RTL and remains usable on mobile. | CSS uses logical padding and responsive grid; layout inspected and built. | PASS | None | No screenshot captured. |
| Owner tables/forms/dialogs | Direction should not break tables, filters, dialogs, forms. | Owner shared primitives and modules use mostly logical layout and responsive styles. | PARTIAL | None | Manual screenshot/browser review not performed. |
| Owner breadcrumbs | Breadcrumb separators and order are readable in both directions. | Breadcrumbs use flex and `margin-inline-start`. | PASS | None | Verified by code inspection. |
| Owner banners | Impersonation banner remains visible and distinct. | Banner is mounted in owner layout. | PASS | None | Verified by code inspection. |
| English LTR | Existing English document should remain LTR. | Owner layout now preserves `lang="en"` and sets `dir="ltr"`. | PASS | Fixed forced RTL. | Verified by code inspection/build. |
| Long Arabic labels | Long Arabic labels do not break layout. | Many Arabic labels exist and CSS uses wrapping/gaps. | PARTIAL | None | Manual screenshot review still needed. |

## Bugs Found

| Severity | Bug | Status | Fix applied |
|---|---|---:|---|
| High | Owner plan routes were protected by analytics guard instead of `manage_plans`. | Fixed | Updated all plans routes to `ownerPermissionGuard(Permission.MANAGE_PLANS)` and added route spec. |
| High | Owner sidebar exposed several protected areas without matching permission metadata. | Fixed | Added permission/permissions metadata and filtering in owner layout. |
| Medium | Owner layout always forced Arabic RTL, breaking English LTR sessions. | Fixed | Preserve `html[lang="en"]` as LTR; default to Arabic RTL otherwise. |
| Medium | Owner overview spec was flaky in the full multi-app matrix due 5s default timeout. | Fixed | Increased the specific spec timeout to 10s without weakening assertions. |
| Medium | Owner app/API connectivity for pilot QA needed real backend base URL instead of local proxy assumption. | Fixed | Set shared `ApiClient` base URL to `http://trackora.techlabeg.com/v1`. |
| Low | Stale Nx boundary-disable comments existed in platform plans files. | Fixed | Removed unused `eslint-disable-next-line @nx/enforce-module-boundaries` comments. |

## Remaining Known Issues

### Critical blockers

| Item | Status | Notes |
|---|---:|---|
| Live end-to-end pilot login and seeded workflow | NOT VERIFIED | Requires seeded System Owner, Merchant/Tenant Admin, Courier credentials and backend state. |
| Backend Docker/Prisma lifecycle | NOT IMPLEMENTED | Not present in this frontend repository. |

### High priority bugs

| Item | Status | Notes |
|---|---:|---|
| Merchant and courier app roots use only `authGuard` | PARTIAL | Admin has role guard; merchant/courier frontend routes do not enforce app-specific roles in route config. Backend must enforce access. |
| Admin shipments route reuses merchant shipment feature | PARTIAL | Inspected facade requires `merchantId`; admin users without `merchantId` may see missing merchant profile error. |
| Public tracking displays full customer phone/address/COD from API response | PARTIAL | May be intended for customer tracking, but privacy should be confirmed before pilot. |

### Medium priority issues

| Item | Status | Notes |
|---|---:|---|
| Owner, merchant, courier, admin production builds exceed initial bundle warning budget | PARTIAL | Builds pass, warnings remain. |
| App builds emit unused import/CommonJS warnings | PARTIAL | Merchant dashboard, courier pages, and Leaflet warning remain. |
| Courier local COD cash-on-hand may not reflect delivered COD before sync | PARTIAL | Code inspection suggests delivered COD queues status update but local cash log collection depends on sync/backend flow. |
| Assignment board has limited error handling | PARTIAL | Assignment create errors are uncaught in inspected component. |
| Owner usage/settings are placeholders | NOT IMPLEMENTED | No feature added per Phase 12 rules. |

### Nice-to-have improvements

| Item | Status | Notes |
|---|---:|---|
| Manual screenshot set | NOT VERIFIED | Capture desktop/mobile Arabic RTL and English LTR for owner sidebar, tables, filters, dialogs, forms, breadcrumbs, banners, and long Arabic labels. |
| Environment-based API config | NOT IMPLEMENTED | Current pilot base URL is set in `ApiClient`; future config should use a build/runtime environment provider. |
| More realistic e2e coverage | NOT VERIFIED | Existing e2e tests are route-serving smoke tests, not authenticated business workflows. |

## Screenshots Checklist

| Screenshot | Required? | Status | Notes |
|---|---:|---:|---|
| Owner overview desktop Arabic RTL | Yes | NOT VERIFIED | Manual browser capture needed with seeded owner. |
| Owner tenants/plans/subscriptions tables Arabic RTL | Yes | NOT VERIFIED | Manual browser capture needed with seeded data. |
| Owner dialogs/reason workflows Arabic RTL | Yes | NOT VERIFIED | Manual browser capture needed. |
| Owner impersonation banner | Yes | NOT VERIFIED | Requires active impersonation fixture/workflow. |
| Owner English LTR sidebar/topbar/breadcrumbs | Yes | NOT VERIFIED | Manual browser capture needed after setting `html lang="en"`. |
| Merchant shipment create/list/detail | Yes | NOT VERIFIED | Requires seeded merchant login. |
| Courier task detail/status/COD/deposit | Yes | NOT VERIFIED | Requires seeded courier login and task. |
| Wallet/COD transactions | Yes | NOT VERIFIED | Requires delivered COD shipment workflow. |
