# Trackora Frontend Implementation Checklist

> **Project:** Trackora Logistics & COD Shipment Management SaaS  
> **Date:** 2026-05-05  
> **Branch Strategy:** Every feature on its own branch, merged into `dev`  

---

## Legend

- [x] Completed
- [ ] Pending / Not Started
- [~] In Progress

---

## Phase 1: Foundation

| # | Task | Status | Branch | Notes |
|---|------|--------|--------|-------|
| 1.1 | Scaffold Nx monorepo with 3 apps (admin, merchant, courier) | [x] | `feature/phase-1-foundation` | Angular 21, esbuild bundler |
| 1.2 | Generate all core libs (auth, api, realtime, state, config) | [x] | `feature/phase-1-foundation` | |
| 1.3 | Generate all shared libs (domain, ui, utils, data-access) | [x] | `feature/phase-1-foundation` | |
| 1.4 | Generate all feature libs (auth, shipments, assignments, courier-tasks, wallet, payouts, tracking, analytics) | [x] | `feature/phase-1-foundation` | |
| 1.5 | Configure path aliases (`@trackora/*`) in `tsconfig.base.json` | [x] | `feature/phase-1-foundation` | |
| 1.6 | Install dependencies (PrimeNG, PrimeFlex, NgRx, ngx-translate, Dexie, Leaflet, decimal.js, chart.js) | [x] | `feature/phase-1-foundation` | `--legacy-peer-deps` used |
| 1.7 | `libs/shared/domain` — entities, enums, value objects | [x] | `feature/phase-1-foundation` | Shipment, User, Wallet, Address, Money, PhoneNumber, StateMachine |
| 1.8 | `libs/core/api` — ApiClient, interceptors, error handling | [x] | `feature/phase-1-foundation` | Auth, BaseUrl, Error, Retry interceptors |
| 1.9 | `libs/core/auth` — AuthService, TokenStorage, guards, `*appHasPermission` | [x] | `feature/phase-1-foundation` | Signals-based, role & permission guards |
| 1.10 | `libs/core/state` — NgRx store (auth, layout, notifications, permissions) | [x] | `feature/phase-1-foundation` | createFeature pattern |
| 1.11 | `libs/core/realtime` — SSE transport, RealtimeService | [x] | `feature/phase-1-foundation` | Abstract interface, SSE implementation |
| 1.12 | `libs/core/config` — LanguageService, FeatureFlagsService | [x] | `feature/phase-1-foundation` | Arabic default (`ar`) |
| 1.13 | Base layout shells for admin, merchant, courier apps | [x] | `feature/phase-1-foundation` | Sidebar for admin/merchant, minimal for courier |
| 1.14 | Arabic/English i18n JSON scaffolding | [x] | `feature/phase-1-foundation` | `assets/i18n/ar.json`, `en.json` |
| 1.15 | Trackora brand theme (CSS variables, fonts) | [x] | `feature/phase-1-foundation` | Primary `#001F3F`, Accent `#FF6B6B` |

**Phase 1 Merge:** ✅ Merged into `dev`

---

## Phase 2: Shared Infrastructure

| # | Task | Status | Branch | Notes |
|---|------|--------|--------|-------|
| 2.1 | `libs/shared/utils` — Validators (Egyptian phone), Formatters (currency, date) | [x] | `feature/phase-2-shared-infrastructure` | |
| 2.2 | `libs/shared/data-access` — DTOs (shipment, auth, wallet) | [x] | `feature/phase-2-shared-infrastructure` | Request/response interfaces |
| 2.3 | `libs/shared/data-access` — Mappers (ShipmentMapper, AuthMapper, WalletMapper) | [x] | `feature/phase-2-shared-infrastructure` | DTO → Domain conversion |
| 2.4 | `libs/shared/data-access` — Repositories (Shipment, Auth, Wallet) | [x] | `feature/phase-2-shared-infrastructure` | Uses ApiClient, returns domain entities |
| 2.5 | `libs/shared/ui` — LanguageSwitcher component | [x] | `feature/phase-2-shared-infrastructure` | Toggle AR/EN |
| 2.6 | `libs/shared/ui` — LoadingSpinner component | [x] | `feature/phase-2-shared-infrastructure` | CSS animation |
| 2.7 | `libs/shared/ui` — `egpCurrency` pipe | [x] | `feature/phase-2-shared-infrastructure` | Intl.NumberFormat |
| 2.8 | `libs/shared/ui` — `localDate` pipe | [x] | `feature/phase-2-shared-infrastructure` | Intl.DateTimeFormat |
| 2.9 | Auth feature — Login page with reactive form | [x] | `feature/phase-2-shared-infrastructure` | Email/password validation |
| 2.10 | Auth feature — Language toggle on login | [x] | `feature/phase-2-shared-infrastructure` | Integrated with LanguageService |
| 2.11 | App configs — HttpClient + interceptors providers | [x] | `feature/phase-2-shared-infrastructure` | All 3 apps |
| 2.12 | App configs — NgRx Store providers | [x] | `feature/phase-2-shared-infrastructure` | All 3 apps |
| 2.13 | App configs — ngx-translate providers | [x] | `feature/phase-2-shared-infrastructure` | All 3 apps |

**Phase 2 Merge:** ✅ Merged into `dev`

---

## Phase 3: Core Features

| # | Task | Status | Branch | Notes |
|---|------|--------|--------|-------|
| 3.1 | Shipments feature — Facade with Signals | [x] | `feature/phase-3-core-features` | loadShipments, loadDetail, optimistic updates |
| 3.2 | Shipments feature — List page with filters, pagination, status badges | [x] | `feature/phase-3-core-features` | Table with status colors |
| 3.3 | Shipments feature — Create shipment form with validations | [x] | `feature/phase-3-core-features` | Reactive form, phone regex |
| 3.4 | Shipments feature — Detail page | [x] | `feature/phase-3-core-features` | Grid layout with shipment info |
| 3.5 | Shipments feature — Bulk upload page | [x] | `feature/phase-3-core-features` | Drag-drop, progress polling, CSV template |
| 3.6 | Shipments feature — Child routes (list, create, detail) | [x] | `feature/phase-3-core-features` | Lazy loaded |
| 3.7 | Wallet feature — Facade with Signals | [x] | `feature/phase-3-core-features` | Wallet + transactions |
| 3.8 | Wallet feature — Balance cards (available, pending) | [x] | `feature/phase-3-core-features` | Color-coded |
| 3.9 | Wallet feature — Transaction list table | [x] | `feature/phase-3-core-features` | Credit/debit colors |
| 3.10 | Wallet feature — Child routes | [x] | `feature/phase-3-core-features` | Lazy loaded |
| 3.11 | Tracking feature — Public tracking page (`/tracking/:trackingNumber`) | [x] | `feature/phase-3-core-features` | No auth required, timeline visualization |
| 3.12 | Tracking feature — Route configuration | [x] | `feature/phase-3-core-features` | Lazy loaded, minimal bundle |
| 3.13 | Merchant app dashboard — KPI cards | [x] | `feature/phase-3-core-features` | Total shipments, delivery rate, avg COD |
| 3.14 | Merchant app dashboard — Recent activity feed | [x] | `feature/phase-3-core-features` | Activity list with status badges |
| 3.15 | Merchant app — Integrate shipments and wallet pages | [x] | `feature/phase-3-core-features` | Routes already configured |
| 3.16 | Admin app — Integrate shipments page | [x] | `feature/phase-3-core-features` | Routes already configured |

**Phase 3 Merge:** ✅ Merged into `dev`

---

## Phase 4: Courier PWA

| # | Task | Status | Branch | Notes |
|---|------|--------|--------|-------|
| 4.1 | Courier task list page | [ ] | | Swipeable cards, offline banner |
| 4.2 | Courier task detail page | [ ] | | Customer info, address, COD, map |
| 4.3 | Offline Dexie store — Database schema | [ ] | | `pending_updates`, `cached_tasks`, `cash_log`, etc. |
| 4.4 | Offline Dexie store — Queue status updates | [ ] | | UUID generation, timestamp |
| 4.5 | Offline Dexie store — Sync service | [ ] | | Retry with exponential backoff |
| 4.6 | Status update flow — OTP input (4 digits, max 3 attempts) | [ ] | | |
| 4.7 | Status update flow — Photo capture | [ ] | | Canvas compression, max 500KB |
| 4.8 | Status update flow — Signature pad | [ ] | | Max 100KB |
| 4.9 | Status update flow — COD confirmation | [ ] | | |
| 4.10 | Status update flow — GPS location capture | [ ] | | |
| 4.11 | Optimistic UI updates + rollback | [ ] | | On API failure |
| 4.12 | Service Worker + Background Sync API | [ ] | | `sync` event listener |
| 4.13 | PWA manifest, icons, install prompt | [ ] | | `manifest.webmanifest` |
| 4.14 | Conflict resolution UI | [ ] | | Server vs local state rules |
| 4.15 | Cash deposit logging page | [ ] | | |
| 4.16 | Performance metrics page | [ ] | | |

**Phase 4 Branch:** Not created yet

---

## Phase 5: Admin & Operations

| # | Task | Status | Branch | Notes |
|---|------|--------|--------|-------|
| 5.1 | Admin dashboard — KPI cards (today's stats) | [ ] | | Shipments created/delivered/failed, COD collected |
| 5.2 | Admin dashboard — Courier status panel | [ ] | | Online/offline/on-delivery counts |
| 5.3 | Admin dashboard — Real-time alerts panel | [ ] | | Cash risk, failed delivery spikes |
| 5.4 | Admin dashboard — SSE integration | [ ] | | Live updates |
| 5.5 | Dispatch board — Drag-and-drop assignment | [ ] | | CDK Drag/Drop or `p-pickList` |
| 5.6 | Dispatch board — Unassigned shipments panel | [ ] | | Filterable by zone, risk, COD |
| 5.7 | Dispatch board — Active couriers panel | [ ] | | Capacity indicators |
| 5.8 | Courier management page | [ ] | | List, activate/deactivate, capacity |
| 5.9 | Merchant management page | [ ] | | List, approve, view details |
| 5.10 | Payout approval workflow | [ ] | | Table with approve/reject, bulk actions |
| 5.11 | Wallet management (admin view) | [ ] | | View merchant balances |
| 5.12 | Audit logs viewer | [ ] | | Filterable table |
| 5.13 | Reports generation | [ ] | | Export functionality |

**Phase 5 Branch:** Not created yet

---

## Phase 6: Polish & Scale

| # | Task | Status | Branch | Notes |
|---|------|--------|--------|-------|
| 6.1 | Arabic RTL polish across all apps | [ ] | | Logical CSS properties, `dir="rtl"` |
| 6.2 | Arabic-Indic numerals in Arabic mode | [ ] | | `Intl.NumberFormat` with `ar-EG` |
| 6.3 | Arabic pluralization (MessageFormat) | [ ] | | Complex plural rules |
| 6.4 | Leaflet map integration — Courier app | [ ] | | OpenStreetMap, Arabic labels |
| 6.5 | Leaflet map integration — Shipment detail | [ ] | | Address geocoding preview |
| 6.6 | Advanced analytics charts — Merchant | [ ] | | COD trend (line), return reasons (pie), zone performance (bar) |
| 6.7 | Advanced analytics charts — Admin | [ ] | | Operations KPIs, courier performance |
| 6.8 | E2E test suite — Merchant flow | [ ] | | Playwright |
| 6.9 | E2E test suite — Admin flow | [ ] | | Playwright |
| 6.10 | E2E test suite — Courier flow | [ ] | | Playwright |
| 6.11 | E2E test suite — Offline scenarios | [ ] | | Playwright + CDP |
| 6.12 | Performance audit — Lighthouse | [ ] | | FCP < 1.5s, TTI < 3s |
| 6.13 | Bundle analysis — Courier < 200KB, Admin < 300KB | [ ] | | `angular.json` budgets |
| 6.14 | Accessibility audit — WCAG 2.1 AA | [ ] | | ARIA labels, keyboard nav, color contrast |
| 6.15 | Documentation completion | [ ] | | API alignment, deployment guide |

**Phase 6 Branch:** Not created yet

---

## Quick Stats

| Phase | Completed | Total | Progress |
|-------|-----------|-------|----------|
| Phase 1: Foundation | 15/15 | 15 | 100% |
| Phase 2: Shared Infrastructure | 13/13 | 13 | 100% |
| Phase 3: Core Features | 16/16 | 16 | 100% |
| Phase 4: Courier PWA | 0/16 | 16 | 0% |
| Phase 5: Admin & Operations | 0/13 | 13 | 0% |
| Phase 6: Polish & Scale | 0/15 | 15 | 0% |
| **TOTAL** | **36/88** | **88** | **41%** |

---

## Active Branches

| Branch | Status | Base |
|--------|--------|------|
| `main` | Stable | — |
| `dev` | Integration | `main` |
| `feature/phase-1-foundation` | ✅ Merged to `dev` | `dev` |
| `feature/phase-2-shared-infrastructure` | ✅ Merged to `dev` | `dev` |
| `feature/phase-3-core-features` | ✅ Merged to `dev` | `dev` |
| `feature/phase-4-courier-pwa` | ⏳ In Progress | `dev` |
| `feature/phase-5-admin-operations` | ⏳ In Progress | `dev` |
| `feature/phase-6-polish-scale` | ⏳ In Progress | `dev` |

---

## Next Steps

1. ✅ **Complete Phase 3** — merged into `dev`

2. **Implement Phase 4** — Courier PWA on `feature/phase-4-courier-pwa`
   - Offline Dexie store, task list/detail, status updates, PWA manifest

3. **Implement Phase 5** — Admin & Operations on `feature/phase-5-admin-operations`
   - Admin dashboard, dispatch board, courier/merchant management

4. **Implement Phase 6** — Polish & Scale on `feature/phase-6-polish-scale`
   - RTL polish, maps, analytics charts, E2E tests, performance audit

---

*Last updated: 2026-05-05*
