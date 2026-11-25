import { HttpContextToken, HttpErrorResponse, type HttpInterceptorFn, type HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import type { Content, ToastOptions } from 'toastcraft';
import { ToastService } from './toast.service';

/**
 * Set on a request to skip the error toast for it:
 * `this.http.get(url, { context: new HttpContext().set(SKIP_ERROR_TOAST, true) })`
 */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export interface HttpErrorToastConfig {
  /**
   * Build the toast for a failed request. Return `null` to show nothing.
   * Defaults to a readable message per status (offline, 401, 403, 404, 5xx…).
   */
  message?: (error: HttpErrorResponse, request: HttpRequest<unknown>) => Content | ToastOptions | null;
  /** Return true to skip the toast for this error (e.g. a 404 your component already handles). */
  skip?: (error: HttpErrorResponse, request: HttpRequest<unknown>) => boolean;
  /** Extra options for every error toast, e.g. `{ design: 'brutalist', duration: 8000 }`. */
  options?: ToastOptions;
  /**
   * Show at most one toast per status code at a time, so ten parallel requests failing while
   * offline produce one toast instead of ten. Default: true.
   */
  dedupe?: boolean;
}

/** A readable default toast for common HTTP failures. */
export function defaultHttpErrorMessage(error: HttpErrorResponse): ToastOptions {
  const serverMessage =
    typeof error.error === 'string' && error.error.length < 200
      ? error.error
      : typeof error.error?.message === 'string'
        ? error.error.message
        : undefined;
  const s = error.status;
  if (s === 0) return { title: "Can't reach the server", description: 'Check your connection and try again.' };
  if (s === 401) return { title: 'Session expired', description: 'Sign in again to continue.' };
  if (s === 403) return { title: "You don't have access", description: serverMessage ?? 'Ask an admin for permission.' };
  if (s === 404) return { title: 'Not found', description: serverMessage ?? 'The requested item no longer exists.' };
  if (s === 408 || s === 504) return { title: 'Request timed out', description: 'Try again in a moment.' };
  if (s === 429) return { title: 'Too many requests', description: 'Wait a moment, then try again.' };
  if (s >= 500) return { title: 'Server error', description: serverMessage ?? 'Try again in a moment.' };
  return { title: 'Request failed', description: serverMessage ?? `The server responded with ${s}.` };
}

/**
 * Show an error toast whenever an HttpClient request fails. The error is still re-thrown,
 * so your own error handling keeps working.
 *
 * ```ts
 * provideHttpClient(withInterceptors([toastcraftHttpErrors()]))
 * ```
 */
export function toastcraftHttpErrors(config: HttpErrorToastConfig = {}): HttpInterceptorFn {
  return (req, next) => {
    const toast = inject(ToastService);
    return next(req).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && !req.context.get(SKIP_ERROR_TOAST) && !config.skip?.(error, req)) {
          const message = config.message ? config.message(error, req) : defaultHttpErrorMessage(error);
          if (message !== null) {
            const base = typeof message === 'object' && !(message instanceof Node) ? message : { title: message };
            const id = config.dedupe === false ? undefined : `toastcraft-http-${error.status}`;
            toast.error({ ...config.options, ...base, ...(id ? { id } : {}) });
          }
        }
        return throwError(() => error);
      }),
    );
  };
}
