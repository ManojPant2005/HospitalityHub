import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api-base-url';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models/auth';
import { AuthTokenStorage } from './auth-token-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly tokenStorage = inject(AuthTokenStorage);

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiBaseUrl}/auth/register`, request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, request)
      .pipe(
        tap((response) =>
          this.tokenStorage.store(response.accessToken, response.expiresAtUtc, response.user.email),
        ),
      );
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.hasValidToken();
  }

  logout(): void {
    this.tokenStorage.clear();
  }
}
