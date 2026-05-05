import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse, ApiError } from '@trackora/shared/domain';

export class ApiClientError extends Error {
  constructor(
    public readonly apiError: ApiError,
    public readonly status: number
  ) {
    super(apiError.message);
    this.name = 'ApiClientError';
  }
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly baseUrl = '/api/v1';
  private readonly pendingRequests = new Map<string, AbortController>();

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.request<T>('POST', path, body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.request<T>('PATCH', path, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.request<T>('PUT', path, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.request<T>('DELETE', path);
  }

  private request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: HttpParams
  ): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    const requestKey = `${method}:${url}:${JSON.stringify(body)}`;

    // Cancel duplicate in-flight requests
    this.pendingRequests.get(requestKey)?.abort();
    const abortController = new AbortController();
    this.pendingRequests.set(requestKey, abortController);

    return this.http
      .request<ApiResponse<T>>(method, url, {
        body,
        params,
      })
      .pipe(
        map((res) => this.unwrap(res)),
        catchError((err: HttpErrorResponse) => {
          this.pendingRequests.delete(requestKey);
          return this.handleError(err);
        })
      );
  }

  private unwrap<T>(res: ApiResponse<T>): T {
    if (!res.success) {
      throw ApiClientError.fromResponse(res.error!);
    }
    return res.data;
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
