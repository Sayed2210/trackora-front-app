import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, retry, timer } from 'rxjs';

/**
 * Auth Interceptor - attaches Bearer token and handles 401
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('access_token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        sessionStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Base URL Interceptor - prepends /api/v1 to relative paths
 */
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    !req.url.startsWith('http') &&
    !req.url.startsWith('/v1') &&
    !req.url.startsWith('/assets/')
  ) {
    req = req.clone({ url: `/v1${req.url}` });
  }
  return next(req);
};

/**
 * Error Interceptor - maps API error envelope to typed ApiError
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 429) {
        console.warn('Rate limit exceeded');
      }
      if (error.status === 409) {
        console.warn('Conflict error');
      }
      return throwError(() => error);
    })
  );
};

/**
 * Retry Interceptor - exponential backoff for 5xx errors
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (error.status >= 500) {
          return timer(Math.pow(2, retryCount) * 100);
        }
        throw error;
      },
    })
  );
};
