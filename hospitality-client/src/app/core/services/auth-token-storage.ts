import { Injectable, signal } from '@angular/core';

const ACCESS_TOKEN_KEY = 'hospitality_access_token';
const TOKEN_EXPIRY_KEY = 'hospitality_access_token_expiry';

@Injectable({ providedIn: 'root' })
export class AuthTokenStorage {
  readonly accessToken = signal(this.read(ACCESS_TOKEN_KEY));

  hasValidToken(): boolean {
    const token = this.accessToken();
    if (!token) {
      return false;
    }

    const expiresAt = this.read(TOKEN_EXPIRY_KEY);
    if (!expiresAt || Date.parse(expiresAt) <= Date.now()) {
      this.clear();
      return false;
    }
    return true;
  }

  store(accessToken: string, expiresAtUtc: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAtUtc);
    this.accessToken.set(accessToken);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    this.accessToken.set(null);
  }

  private read(key: string): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  }
}
