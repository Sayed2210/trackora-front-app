# Trackora Front-End Architecture Review & Action Plan

> Generated: 2026-05-09  
> Scope: Admin, Merchant, Courier apps + shared libraries

---

## Summary

The Trackora front-end is a well-structured Nx Angular monorepo with clean domain separation, lazy loading, and a solid facade/repository pattern. However, there are critical gaps in auth state synchronization, route protection, API integration completeness, and performance optimizations that need addressing before production.

---

## Critical Issues (Must Fix)

### TASK-01: Sync dual auth state

- **Severity**: HIGH
- **Apps**: All
- **Detail**: `AuthService` (signals) and `authFeature` (NgRx) both track user state but are never synchronized. `loginSuccess` action is never dispatched. Layouts read from `AuthService` while the NgRx store sits empty.
- **Action**: Either dispatch `loginSuccess` from `AuthRepository.login()` to populate the NgRx store, or remove the unused `authFeature`/`layoutFeature`/`notificationsFeature` stores and rely solely on signal services.
- **Files**:
  - `libs/core/auth/src/lib/auth.service.ts`
  - `libs/shared/data-access/src/lib/repository/auth.repository.ts`
  - `libs/core/state/src/lib/auth.store.ts`
  - `apps/*/src/app/app.config.ts`

### TASK-02: Add roleGuard to admin routes

- **Severity**: HIGH
- **Apps**: Admin
- **Detail**: `roleGuard` and `permissionGuard` exist but aren't applied to any admin route. Any authenticated user can access admin pages.
- **Action**: Add `roleGuard([UserRole.ADMIN])` to the admin layout route. Add `permissionGuard` to sensitive sub-routes (payouts, audit-logs).
- **Files**:
  - `apps/admin/src/app/app.routes.ts`
  - `apps/admin/src/app/app.config.ts` (ensure `roleGuard` provider if needed)

### TASK-03: Complete courier API integration

- **Severity**: HIGH
- **Apps**: Courier
- **Detail**: All courier pages read/write exclusively to Dexie (IndexedDB). `OfflineSyncService.sendUpdate()` is a stub with simulated delay. The app has no real backend sync.
- **Action**: Implement real HTTP calls in `OfflineSyncService.sendUpdate()` using `ApiClient`/repositories. Keep the offline-first pattern but add actual sync.
- **Files**:
  - `apps/courier/src/app/services/offline-sync.service.ts`
  - `apps/courier/src/app/services/offline-store.service.ts`

### TASK-04: Complete admin API integration

- **Severity**: HIGH
- **Apps**: Admin
- **Detail**: 6 of 10 admin pages use hardcoded mock data with no repository calls: CourierManagement, MerchantManagement, PayoutApproval, WalletManagement, AuditLogs, Reports.
- **Action**: Replace mock signal arrays with real repository calls (CourierRepository, MerchantRepository, AdminRepository, WalletRepository). Create missing repository methods as needed.
- **Files**:
  - `apps/admin/src/app/pages/courier-management-page.component.ts`
  - `apps/admin/src/app/pages/merchant-management-page.component.ts`
  - `apps/admin/src/app/pages/payout-approval-page.component.ts`
  - `apps/admin/src/app/pages/wallet-management-page.component.ts`
  - `apps/admin/src/app/pages/audit-logs-page.component.ts`
  - `apps/admin/src/app/pages/reports-page.component.ts`

---

## High Priority

### TASK-05: Add ChangeDetectionStrategy.OnPush to all components

- **Severity**: MEDIUM (performance)
- **Apps**: All
- **Detail**: All components use default change detection. Since all state is signal-based, `OnPush` is trivially safe and meaningfully reduces CD cycles.
- **Action**: Add `changeDetection: ChangeDetectionStrategy.OnPush` to every component across all apps and feature libraries.
- **Files**: All `*.component.ts` files

### TASK-06: Add trackBy to all *ngFor loops

- **Severity**: MEDIUM (performance)
- **Apps**: All
- **Detail**: Every `*ngFor` loop across all apps iterates without `trackBy`. Tables with 50+ rows cause full DOM recreation on updates.
- **Action**: Add `trackBy` functions to all `*ngFor` iterations, especially tables and lists.
- **Files**:
  - `apps/merchant/src/app/pages/dashboard.component.ts` (kpis, activities)
  - `apps/merchant/src/lib/pages/shipment-list-page.component.ts` (shipments, statuses)
  - `apps/merchant/src/lib/pages/wallet-page.component.ts` (transactions)
  - `apps/merchant/src/lib/pages/tracking-page.component.ts` (timeline events)
  - `apps/admin/src/app/pages/dashboard.component.ts` (kpis, alerts)
  - `apps/admin/src/app/pages/courier-management-page.component.ts` (couriers)
  - `apps/admin/src/app/pages/merchant-management-page.component.ts` (merchants)
  - `apps/admin/src/app/pages/payout-approval-page.component.ts` (payouts)
  - `apps/admin/src/app/pages/wallet-management-page.component.ts` (wallets)
  - `apps/admin/src/app/pages/audit-logs-page.component.ts` (logs)
  - `apps/admin/src/app/pages/reports-page.component.ts` (reports)
  - `apps/courier/src/app/pages/courier-task-list-page.component.ts` (tasks)
  - `apps/courier/src/app/pages/cash-deposit-page.component.ts` (cash log)

### TASK-07: Fix ShipmentFacade missing error handling

- **Severity**: MEDIUM (bug)
- **Apps**: Merchant
- **Detail**: `ShipmentFacade.loadShipments()` has no try/catch -- errors are silently swallowed. `WalletFacade` properly handles errors.
- **Action**: Add try/catch with error signal, matching `WalletFacade`'s pattern.
- **Files**:
  - `libs/features/shipments-feature/src/lib/facade/shipment.facade.ts`

### TASK-08: Fix ApiClient hardcoded baseUrl and double-prefix risk

- **Severity**: MEDIUM (bug potential)
- **Apps**: All
- **Detail**: `ApiClient` hardcodes `http://localhost:3000/v1` and `baseUrlInterceptor` prepends `/v1`, creating a risk of `/v1/v1/...` double-prefix if `ApiClient` is used directly.
- **Action**: Make `ApiClient.baseUrl` configurable via injection token or environment config. Remove the hardcoded prefix and let the interceptor handle it.
- **Files**:
  - `libs/core/api/src/lib/api-client.ts`
  - `apps/*/src/app/app.config.ts`

### TASK-09: Fix merchant tracking page bypassing repository pattern

- **Severity**: MEDIUM (architecture)
- **Apps**: Merchant
- **Detail**: `TrackingPageComponent` injects `HttpClient` directly instead of using `ShipmentRepository.findByTrackingNumber()`, bypassing the DTO/mapper pattern.
- **Action**: Replace direct `HttpClient` usage with `ShipmentRepository.findByTrackingNumber()`.
- **Files**:
  - `libs/features/tracking-feature/src/lib/pages/tracking-page.component.ts`

### TASK-10: Fix event listener leaks in courier app

- **Severity**: MEDIUM (memory leak)
- **Apps**: Courier
- **Detail**: `window.addEventListener('online'/'offline')` in `CourierTaskListPageComponent` and canvas touch/mouse listeners in `CourierTaskDetailPageComponent` are never cleaned up.
- **Action**: Implement `ngOnDestroy` or use `DestroyRef` + `takeUntilDestroyed()` to clean up both window and canvas event listeners.
- **Files**:
  - `apps/courier/src/app/pages/courier-task-list-page.component.ts`
  - `apps/courier/src/app/pages/courier-task-detail-page.component.ts`

---

## Medium Priority

### TASK-11: Remove or connect notifications store

- **Severity**: MEDIUM (dead code)
- **Apps**: All
- **Detail**: `notificationsFeature` is registered in all 3 apps but no component dispatches actions or displays notifications.
- **Action**: Either create a toast/notification component that subscribes to the store, or remove the store registration and code.
- **Files**:
  - `libs/core/state/src/lib/notifications.store.ts`
  - `apps/*/src/app/app.config.ts`

### TASK-12: Connect layout store to layout components

- **Severity**: MEDIUM (unused code)
- **Apps**: All
- **Detail**: `layoutFeature` store has `sidebarOpen`, `language`, `direction` but no layout component reads from it. Admin has no sidebar toggle; merchant/courier don't consume `selectDirection`.
- **Action**: Wire up `layoutFeature` selectors in layout components: sidebar toggle using `toggleSidebar`, RTL direction using `selectDirection`, language using `selectLanguage`.
- **Files**:
  - `apps/admin/src/app/layout/admin-layout.component.ts`
  - `apps/merchant/src/app/layout/merchant-layout.component.ts`
  - `apps/courier/src/app/layout/courier-layout.component.ts`
  - `libs/core/state/src/lib/layout.store.ts`

### TASK-13: Adopt i18n consistently

- **Severity**: MEDIUM (UX)
- **Apps**: All
- **Detail**: `@ngx-translate` is configured in all apps with `ar.json`/`en.json` files, but only `LoginPageComponent` uses translation keys. All other pages have hardcoded English strings.
- **Action**: Replace hardcoded strings with `{{ 'key' | translate }}` pattern in all page templates. Add missing keys to `ar.json` and `en.json`.
- **Files**:
  - All page component templates across all apps
  - `apps/*/src/assets/i18n/en.json`
  - `apps/*/src/assets/i18n/ar.json`

### TASK-14: Extract shared table component

- **Severity**: MEDIUM (DRY)
- **Apps**: Admin, Merchant
- **Detail**: Data tables, filter bars, and pagination are copy-pasted across 5+ admin pages and 2 merchant pages.
- **Action**: Create a `DataTableComponent` in `@trackora/shared/ui` with configurable columns, sorting, pagination, and empty/loading states.
- **Files**:
  - `libs/shared/ui/src/lib/components/` (new)

### TASK-15: Fix skip link accessibility in admin

- **Severity**: LOW (a11y)
- **Apps**: Admin
- **Detail**: `index.html` has a skip link targeting `#main-content` but no element in the layout has that `id`.
- **Action**: Add `id="main-content"` to the `<main>` or content container element in `AdminLayoutComponent`.
- **Files**:
  - `apps/admin/src/app/layout/admin-layout.component.ts`

### TASK-16: Fix admin layout responsive sidebar

- **Severity**: LOW (UX)
- **Apps**: Admin
- **Detail**: Sidebar is fixed 260px with no toggle. Layout breaks on small screens.
- **Action**: Add a sidebar toggle using `layoutFeature.selectSidebarOpen` and responsive CSS with a hamburger menu.
- **Files**:
  - `apps/admin/src/app/layout/admin-layout.component.ts`

### TASK-17: Replace mock data in merchant dashboard

- **Severity**: LOW (tech debt)
- **Apps**: Merchant
- **Detail**: `DashboardComponent` uses `any` types for KPIs, activities, and charts instead of typed interfaces.
- **Action**: Define typed interfaces for dashboard API responses and replace `any` types.
- **Files**:
  - `apps/merchant/src/app/pages/dashboard.component.ts`

### TASK-18: Remove dead AbortController code in ApiClient

- **Severity**: LOW (dead code)
- **Apps**: All
- **Detail**: `ApiClient` creates `AbortController` instances for request deduplication, but Angular's `HttpClient` doesn't consume `AbortSignal`. The cancellation code has no effect.
- **Action**: Either implement proper request deduplication using RxJS `shareReplay`/`switchMap`, or remove the dead `AbortController` code.
- **Files**:
  - `libs/core/api/src/lib/api-client.ts`

### TASK-19: Add unit tests for courier pages

- **Severity**: LOW (quality)
- **Apps**: Courier
- **Detail**: Only `app.spec.ts` exists with a basic creation test. No page-level tests.
- **Action**: Add component tests for `CourierTaskListPageComponent`, `CourierTaskDetailPageComponent`, `CashDepositPageComponent`, and `PerformanceMetricsPageComponent`.
- **Files**:
  - `apps/courier/src/app/pages/*.spec.ts` (new)

### TASK-20: Consider sessionStorage security

- **Severity**: LOW (security)
- **Apps**: All
- **Detail**: `authInterceptor` reads access tokens from `sessionStorage`, which is vulnerable to XSS attacks.
- **Action**: For production, consider migrating to httpOnly cookies for token storage, or add CSP headers to mitigate XSS risk.
- **Files**:
  - `libs/core/api/src/lib/interceptors.ts`
  - `libs/core/auth/src/lib/token-storage.service.ts`

---

## What Works Well

1. **Lazy loading**: All routes use `loadComponent`/`loadChildren` -- excellent initial bundle sizes
2. **Facade + Repository + DTO/Mapper pattern**: Clean separation between UI, state, and data
3. **Shared domain types**: Pure TypeScript, no Angular dependency, single source of truth
4. **Interceptor pipeline**: Centralized auth, base URL, retry, and error handling
5. **RBAC infrastructure**: `roleGuard`, `permissionGuard`, `HasPermissionDirective` are built and ready
6. **Signal-based local state**: No RxJS subscription leaks, modern Angular pattern
7. **Value objects**: `Money` and `PhoneNumber` with domain validation
8. **Offline-first for courier**: Dexie schema is well-designed with typed tables
9. **ShipmentStateMachine**: Client-side business rule enforcement
10. **Egyptian market localization**: RTL, Arabic pipes, EGP currency, phone validation

---

## Checklist Progress

| ID | Task | Severity | Status |
|----|------|----------|--------|
| TASK-01 | Sync dual auth state | HIGH | ☑ |
| TASK-02 | Add roleGuard to admin routes | HIGH | ☑ |
| TASK-03 | Complete courier API integration | HIGH | ☑ |
| TASK-04 | Complete admin API integration | HIGH | ☑ |
| TASK-05 | Add OnPush change detection | MEDIUM | ☑ |
| TASK-06 | Add trackBy to all *ngFor | MEDIUM | ☑ |
| TASK-07 | Fix ShipmentFacade error handling | MEDIUM | ☑ |
| TASK-08 | Fix ApiClient baseUrl config | MEDIUM | ☑ |
| TASK-09 | Fix tracking page repository bypass | MEDIUM | ☑ |
| TASK-10 | Fix courier event listener leaks | MEDIUM | ☑ |
| TASK-11 | Remove or connect notifications store | MEDIUM | ☑ |
| TASK-12 | Connect layout store to components | MEDIUM | ☑ |
| TASK-13 | Adopt i18n consistently | MEDIUM | ☐ |
| TASK-14 | Extract shared table component | MEDIUM | ☐ |
| TASK-15 | Fix skip link accessibility | LOW | ☑ |
| TASK-16 | Fix admin responsive sidebar | LOW | ☑ |
| TASK-17 | Replace dashboard `any` types | LOW | ☑ |
| TASK-18 | Remove dead AbortController code | LOW | ☑ |
| TASK-19 | Add courier unit tests | LOW | ☐ |
| TASK-20 | Consider sessionStorage security | LOW | ☐ |