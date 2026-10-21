import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, defer, finalize, throwError } from 'rxjs';
import { GlobalApiErrorService } from '../services/global-api-error';
import { GlobalLoadingService } from '../services/global-loading';

export const loadingErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const loading = inject(GlobalLoadingService);
  const apiErrors = inject(GlobalApiErrorService);

  loading.requestStarted();

  return defer(() => next(request)).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        apiErrors.add(getHttpErrorMessage(error));
      }

      return throwError(() => error);
    }),
    finalize(() => loading.requestFinished()),
  );
};

function getHttpErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Could not connect to the API. Check that the backend is running and CORS is configured.';
  }

  if (typeof error.error === 'object' && error.error !== null) {
    const body = error.error as Record<string, unknown>;
    if (typeof body['detail'] === 'string') {
      return body['detail'];
    }
    if (typeof body['title'] === 'string') {
      return body['title'];
    }
  }

  return `The API request failed (HTTP ${error.status}). Please try again.`;
}
