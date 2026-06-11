import { defineConfig } from '@playwright/test';
import { createE2EConfig } from '../../tools/e2e/config/playwright-defaults';

export default defineConfig(
  createE2EConfig({
    appName: 'owner',
    baseURL: process.env['E2E_OWNER_BASE_URL'] || 'http://localhost:4204',
    servePort: 4204,
  })
);
