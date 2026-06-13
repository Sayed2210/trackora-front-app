import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { ApiResponse, ApiError } from '@trackora/shared/domain';

export class ApiClientError extends Error {
  constructor(
    public readonly apiError: ApiError | undefined,
    public readonly status: number
  ) {
    super(apiError?.message ?? 'Unknown API error');
    this.name = 'ApiClientError';
  }
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);

  // Pilot QA API base URL. Absolute URLs are ignored by baseUrlInterceptor.
  private readonly baseUrl = 'https://trackora.techlabeg.com/v1';

  get<T>(path: string, params?: any): Observable<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  post<T>(path: string, body: unknown, params?: any): Observable<T> {
    return this.request<T>('POST', path, body, params);
  }


  patch<T>(path: string, body: unknown, params?: any): Observable<T> {
    return this.request<T>('PATCH', path, body, params);
  }

  put<T>(path: string, body: unknown, params?: any): Observable<T> {
    return this.request<T>('PUT', path, body, params);
  }

  delete<T>(path: string, params?: any): Observable<T> {
    return this.request<T>('DELETE', path, undefined, params);
  }

  private request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: any
  ): Observable<T> {
    const url = `${this.baseUrl}${path}`;

    return this.http
      .request<ApiResponse<T>>(method, url, {
        body,
        params,
      })
      .pipe(
        map((res) => this.unwrap(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err))
      );
  }

  private unwrap<T>(res: ApiResponse<T>): T {
    // Backend returns raw data directly, not wrapped in { success, data }
    if (res && typeof res === 'object' && 'success' in res) {
      if (!res.success) {
        throw new ApiClientError(res.error, 0);
      }
      return res.data;
    }
    return res as unknown as T;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.error && typeof error.error === 'object' && 'code' in error.error) {
      const apiError = error.error as ApiError;
      return throwError(() => new ApiClientError(apiError, error.status));
    }
    return throwError(() => new ApiClientError(
      { code: 'UNKNOWN_ERROR', message: error.message },
      error.status
    ));
  }

  static fromResponse(error: ApiError): ApiClientError {
    return new ApiClientError(error, 0);
  }
}
