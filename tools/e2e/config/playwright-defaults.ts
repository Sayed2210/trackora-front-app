import { PlaywrightTestConfig, devices } from '@playwright/test';

export interface E2EAppConfig {
  appName: string;
  baseURL: string;
  servePort: number;
  serveCommand?: string;
}

export function createE2EConfig(app: E2EAppConfig): PlaywrightTestConfig {
  const isCI = !!process.env['CI'];
  const baseURL = process.env['BASE_URL'] || app.baseURL;

  return {
    testDir: './src',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    reporter: isCI
      ? [['html', { open: 'never' }], ['junit', { outputFile: `../../test-results/${app.appName}-junit.xml` }]]
      : [['html', { open: 'never' }]],
    timeout: 30_000,
    expect: {
      timeout: 5_000,
    },
    use: {
      baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
      actionTimeout: 10_000,
      navigationTimeout: 15_000,
    },
    webServer: process.env['SKIP_WEB_SERVER']
      ? undefined
      : {
          command: app.serveCommand || `npx nx run ${app.appName}:serve --port=${app.servePort}`,
          url: baseURL,
          reuseExistingServer: !isCI,
          cwd: '../../',
          timeout: 120_000,
        },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
  };
}
