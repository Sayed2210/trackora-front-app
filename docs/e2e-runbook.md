# E2E Automation Runbook

## Prerequisites

1. Node.js 20+
2. npm
3. Playwright browsers installed: `npm run playwright:install`
4. `.env.e2e` file with test credentials (copy from `.env.e2e.example`)

## Environment Setup

```bash
cp .env.e2e.example .env.e2e
# Edit .env.e2e with staging/test credentials
```

Required variables:
- `E2E_API_BASE_URL` - Backend API URL (staging/QA)
- `E2E_ADMIN_BASE_URL` / `E2E_MERCHANT_BASE_URL` / `E2E_COURIER_BASE_URL` / `E2E_OWNER_BASE_URL` - App URLs
- Role credentials: `E2E_<ROLE>_PHONE` and `E2E_<ROLE>_PASSWORD`

## Commands

| Command | Description |
|---|---|
| `npm run test:e2e` | Run all E2E tests across all apps |
| `npm run test:e2e:smoke` | Run smoke tests only (fast P0 journeys) |
| `npm run test:e2e:full` | Run full regression suite |
| `npm run test:e2e:ui` | Run tests with Playwright UI mode |
| `npm run test:e2e:debug` | Run tests in debug mode |
| `npm run playwright:install` | Install Playwright browsers |

### Per-App Execution

```bash
npx nx e2e admin-e2e
npx nx e2e merchant-e2e
npx nx e2e courier-e2e
npx nx e2e owner-e2e
```

### Tag-Based Filtering

```bash
npx nx e2e merchant-e2e -- --grep @smoke
npx nx e2e admin-e2e -- --grep @full
npx nx e2e merchant-e2e -- --grep "@smoke @merchant"
```

## Suite Tags

| Tag | Purpose |
|---|---|
| `@smoke` | Fast P0 journeys required before manual QA |
| `@full` | Broader regression for nightly/release |
| `@mocked` | Deterministic UI states via route interception |
| `@admin` / `@merchant` / `@courier` / `@owner` | Role ownership |
| `@public` | Public routes (no auth required) |
| `@i18n` | Localization and direction tests |

## Project Structure

```
tools/e2e/
  auth/          - Login, storage state, credentials helpers
  api/           - Typed API client for E2E setup
  config/        - Shared Playwright defaults, env loader
  data/          - Test data builders
  fixtures/      - Custom Playwright fixtures
  mocks/         - Route mock helpers
  assertions/    - Common assertion helpers

apps/<app>-e2e/src/
  smoke/         - Smoke test specs
  full/          - Full regression specs
```

## Adding data-testid

When adding test IDs to components:
1. Prefer semantic locators (`getByRole`, labels) first
2. Use `data-testid` only for repeated/non-semantic elements
3. Name by business meaning: `login-phone`, `shipment-list`, `tracking-status`
4. Never use CSS classes, DOM position, or translated text as sole locator

## Known Gaps and Blocked Items

| Item | Status | Reason |
|---|---|---|
| Merchant/courier role guards | Documented gap | No role-specific guards in app; any auth user can access |
| Backend seed/reset API | Blocked | No seed endpoint available; tests rely on existing staging data |
| Language switch route preservation | Blocked | Route/query param preservation not yet implemented |
| Owner i18n JSON files | Documented gap | Owner app has no translation files |
| Translation asset loading failures | Deferred | Belongs to component test layer |
| Flake rate tracking | Deferred | Requires CI run history baseline |

## Troubleshooting

### Tests skip with "No credentials"
Set the required `E2E_<ROLE>_PHONE` and `E2E_<ROLE>_PASSWORD` in `.env.e2e`.

### Web server timeout
Start the app manually before running tests:
```bash
npm run start:merchant
SKIP_WEB_SERVER=true npx nx e2e merchant-e2e
```

### Playwright browser not found
```bash
npm run playwright:install
```

### API base URL issues
Ensure `E2E_API_BASE_URL` points to a reachable staging backend. The shared `ApiClient` in the app currently hardcodes `http://trackora.techlabeg.com/v1`.
