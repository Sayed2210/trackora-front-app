import { defineConfig } from '@playwright/test';
import { createE2EConfig } from '../../tools/e2e/config/playwright-defaults';

export default defineConfig(
  createE2EConfig({
    appName: 'admin',
    baseURL: process.env['E2E_ADMIN_BASE_URL'] || 'http://localhost:4203',
    servePort: 4203,
  })
);
