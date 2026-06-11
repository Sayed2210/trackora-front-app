import * as fs from 'fs';
import * as path from 'path';

interface E2EEnv {
  BASE_URL: string;
  API_BASE_URL: string;
  ADMIN_BASE_URL: string;
  MERCHANT_BASE_URL: string;
  COURIER_BASE_URL: string;
  OWNER_BASE_URL: string;
  ADMIN_PHONE: string;
  ADMIN_PASSWORD: string;
  MERCHANT_PHONE: string;
  MERCHANT_PASSWORD: string;
  COURIER_PHONE: string;
  COURIER_PASSWORD: string;
  OWNER_PHONE: string;
  OWNER_PASSWORD: string;
  OWNER_LIMITED_PHONE: string;
  OWNER_LIMITED_PASSWORD: string;
}

function loadEnvFile(filePath: string): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return vars;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();
    vars[key] = value;
  }
  return vars;
}

export function loadE2EEnv(): E2EEnv {
  const root = path.resolve(__dirname, '../../..');
  const envFile = path.join(root, '.env.e2e');
  const fileVars = loadEnvFile(envFile);

  const get = (key: string, fallback = ''): string =>
    process.env[key] || fileVars[key] || fallback;

  return {
    BASE_URL: get('E2E_BASE_URL', 'http://localhost:4200'),
    API_BASE_URL: get('E2E_API_BASE_URL', 'http://trackora.techlabeg.com/v1'),
    ADMIN_BASE_URL: get('E2E_ADMIN_BASE_URL', 'http://localhost:4203'),
    MERCHANT_BASE_URL: get('E2E_MERCHANT_BASE_URL', 'http://localhost:4201'),
    COURIER_BASE_URL: get('E2E_COURIER_BASE_URL', 'http://localhost:4202'),
    OWNER_BASE_URL: get('E2E_OWNER_BASE_URL', 'http://localhost:4204'),
    ADMIN_PHONE: get('E2E_ADMIN_PHONE'),
    ADMIN_PASSWORD: get('E2E_ADMIN_PASSWORD'),
    MERCHANT_PHONE: get('E2E_MERCHANT_PHONE'),
    MERCHANT_PASSWORD: get('E2E_MERCHANT_PASSWORD'),
    COURIER_PHONE: get('E2E_COURIER_PHONE'),
    COURIER_PASSWORD: get('E2E_COURIER_PASSWORD'),
    OWNER_PHONE: get('E2E_OWNER_PHONE'),
    OWNER_PASSWORD: get('E2E_OWNER_PASSWORD'),
    OWNER_LIMITED_PHONE: get('E2E_OWNER_LIMITED_PHONE'),
    OWNER_LIMITED_PASSWORD: get('E2E_OWNER_LIMITED_PASSWORD'),
  };
}

export type { E2EEnv };
