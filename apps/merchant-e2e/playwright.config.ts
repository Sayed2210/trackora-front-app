import { defineConfig } from '@playwright/test';
import { createE2EConfig } from '../../tools/e2e/config/playwright-defaults';

export default defineConfig(
  createE2EConfig({
    appName: 'merchant',
    baseURL: process.env['E2E_MERCHANT_BASE_URL'] || 'http://localhost:4201',
    servePort: 4201,
  })
);
