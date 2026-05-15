# Trackora Frontend — Deployment & API Alignment Guide

## Project Structure

This is an Nx monorepo with three Angular applications:

- `apps/admin` — Admin & Operations dashboard
- `apps/merchant` — Merchant portal
- `apps/courier` — Courier PWA

## Prerequisites

- Node.js 20+
- npm 10+

## Installation

```bash
npm install --legacy-peer-deps
```

## Development

Serve all apps:

```bash
npx nx run-many -t serve -p admin merchant courier
```

Or serve individually:

```bash
npx nx serve admin
npx nx serve merchant
npx nx serve courier
```

## Build

Production builds:

```bash
npx nx run-many -t build -p admin merchant courier -c production
```

## Bundle Budgets

| App     | Budget |
|---------|--------|
| Courier | < 200KB |
| Admin   | < 300KB |
| Merchant| < 500KB |

## Testing

### Unit Tests

```bash
npx nx run-many -t test
```

### E2E Tests

```bash
npx nx e2e admin-e2e
npx nx e2e merchant-e2e
npx nx e2e courier-e2e
```

### Offline E2E Tests

```bash
npx nx e2e courier-e2e --grep "Offline"
```

### Lighthouse / Performance Audit

```bash
npx lhci autorun
```

## Environment Configuration

Create environment files per app:

- `apps/admin/src/environments/environment.ts`
- `apps/merchant/src/environments/environment.ts`
- `apps/courier/src/environments/environment.ts`

Required variables:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://api.trackora.example.com/v1',
  sseEndpoint: 'https://api.trackora.example.com/v1/sse',
  defaultLanguage: 'ar',
  features: {
    realtimeAlerts: true,
    offlineMode: true,
    analytics: true,
  },
};
```

## API Alignment

### Authentication
- POST `/auth/login` — Email/password login
- POST `/auth/refresh` — Token refresh
- GET `/auth/me` — Current user

### Shipments
- GET `/shipments` — List (supports pagination, filters)
- GET `/shipments/:id` — Detail
- POST `/shipments` — Create
- PATCH `/shipments/:id/status` — Update status
- POST `/shipments/bulk-upload` — Bulk upload

### Courier Tasks
- GET `/courier/tasks` — Assigned tasks
- POST `/courier/tasks/:id/status` — Update with OTP, photo, signature, GPS
- POST `/courier/sync` — Batch sync offline updates

### Wallet
- GET `/merchants/:id/wallet` — Current merchant wallet
- GET `/merchants/:id/wallet/transactions` — Transaction history
- POST `/payouts` — Request payout

### Admin
- GET `/admin/dashboard` — KPI data
- GET `/admin/couriers` — Courier list
- GET `/admin/merchants` — Merchant list
- GET `/payouts` — Payout requests
- PATCH `/payouts/:id/approve` — Approve payout
- PATCH `/payouts/:id/reject` — Reject payout
- GET `/admin/audit-logs` — Audit logs

## PWA (Courier App)

The courier app is a Progressive Web App with:

- Service Worker (`apps/courier/public/sw.js`)
- Web App Manifest (`apps/courier/public/manifest.webmanifest`)
- Offline Dexie database for task caching
- Background sync for status updates

## Accessibility

- WCAG 2.1 AA compliance
- Focus-visible styles
- Reduced motion support
- RTL support for Arabic
- Arabic-Indic numerals pipe
- Arabic pluralization pipe

## Internationalization

Default language: Arabic (`ar`)

Supported languages: Arabic (`ar`), English (`en`)

Translation files: `assets/i18n/ar.json`, `assets/i18n/en.json`

## Performance Targets

- First Contentful Paint (FCP) < 1.5s
- Time to Interactive (TTI) < 3s
- Cumulative Layout Shift (CLS) < 0.1

## Deployment Checklist

- [ ] Update `environment.ts` with production API URLs
- [ ] Verify bundle budgets pass
- [ ] Run full E2E test suite
- [ ] Run Lighthouse CI audit
- [ ] Verify PWA manifest and icons
- [ ] Test offline scenarios on courier app
- [ ] Verify RTL layout in Arabic mode
- [ ] Check accessibility with axe-core or Lighthouse

## License

Proprietary — Trackora Logistics Platform
