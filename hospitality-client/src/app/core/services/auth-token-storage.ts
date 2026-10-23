import { Injectable, signal } from '@angular/core';

const ACCESS_TOKEN_KEY = 'hospitality_access_token';
const TOKEN_EXPIRY_KEY = 'hospitality_access_token_expiry';
const USER_EMAIL_KEY = 'hospitality_user_email';

@Injectable({ providedIn: 'root' })
export class AuthTokenStorage {
  readonly accessToken = signal(this.read(ACCESS_TOKEN_KEY));
  readonly userEmail = signal(this.read(USER_EMAIL_KEY));

  hasValidToken(): boolean {
    const token = this.accessToken();
    if (!token) {
      return false;
    }

    const expiresAt = this.read(TOKEN_EXPIRY_KEY);
    const expirationTimestamp = expiresAt ? Date.parse(expiresAt) : Number.NaN;
    if (!Number.isFinite(expirationTimestamp) || expirationTimestamp <= Date.now()) {
      this.clear();
      return false;
    }
    return true;
  }

  store(accessToken: string, expiresAtUtc: string, userEmail: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAtUtc);
    localStorage.setItem(USER_EMAIL_KEY, userEmail);
    this.accessToken.set(accessToken);
    this.userEmail.set(userEmail);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    this.accessToken.set(null);
    this.userEmail.set(null);
  }

  private read(key: string): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  }
}
