import { defineConfig } from '@playwright/test';
import { createE2EConfig } from '../../tools/e2e/config/playwright-defaults';

export default defineConfig(
  createE2EConfig({
    appName: 'courier',
    baseURL: process.env['E2E_COURIER_BASE_URL'] || 'http://localhost:4202',
    servePort: 4202,
  })
);
