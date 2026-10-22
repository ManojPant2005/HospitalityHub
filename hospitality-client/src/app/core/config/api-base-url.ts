import { isDevMode, InjectionToken } from '@angular/core';

declare global {
  interface Window {
    hospitalityConfig?: {
      apiBaseUrl?: string;
    };
  }
}

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () =>
    isDevMode()
      ? 'https://localhost:7208/api'
      : (window.hospitalityConfig?.apiBaseUrl ?? 'https://hospitalityhub-api.onrender.com/api'),
});
