import { APIRequestContext, request } from '@playwright/test';
import { loadE2EEnv } from '../config/env-loader';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiClientOptions {
  baseURL?: string;
  accessToken?: string;
}

export class E2EApiClient {
  private context: APIRequestContext | null = null;
  private readonly baseURL: string;
  private accessToken: string | undefined;

  constructor(options: ApiClientOptions = {}) {
    const env = loadE2EEnv();
    this.baseURL = options.baseURL || env.API_BASE_URL;
    this.accessToken = options.accessToken;
  }

  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: this.accessToken
        ? { Authorization: `Bearer ${this.accessToken}` }
        : undefined,
    });
  }

  setToken(token: string): void {
    this.accessToken = token;
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    this.ensureInit();
    const response = await this.context!.get(path, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, data: unknown): Promise<ApiResponse<T>> {
    this.ensureInit();
    const response = await this.context!.post(path, {
      data,
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, data: unknown): Promise<ApiResponse<T>> {
    this.ensureInit();
    const response = await this.context!.patch(path, {
      data,
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    this.ensureInit();
    const response = await this.context!.delete(path, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  private ensureInit(): void {
    if (!this.context) {
      throw new Error('ApiClient not initialized. Call init() first.');
    }
  }

  private async handleResponse<T>(response: {
    ok(): boolean;
    status(): number;
    statusText(): string;
    json(): Promise<unknown>;
  }): Promise<ApiResponse<T>> {
    const body = (await response.json()) as ApiResponse<T>;
    if (!response.ok()) {
      throw new Error(
        `API ${response.status()}: ${body.message || response.statusText()}`
      );
    }
    return body;
  }
}
