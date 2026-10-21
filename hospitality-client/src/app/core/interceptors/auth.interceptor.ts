import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../config/api-base-url';
import { AuthTokenStorage } from '../services/auth-token-storage';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const accessToken = inject(AuthTokenStorage).accessToken();
  const apiBaseUrl = inject(API_BASE_URL);

  if (!accessToken || !isApiRequest(request.url, apiBaseUrl)) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    }),
  );
};

function isApiRequest(requestUrl: string, apiBaseUrl: string): boolean {
  const base = new URL(apiBaseUrl);
  const request = new URL(requestUrl, base);
  const apiPath = base.pathname.replace(/\/$/, '');
  return request.origin === base.origin &&
    (request.pathname === apiPath || request.pathname.startsWith(`${apiPath}/`));
}
