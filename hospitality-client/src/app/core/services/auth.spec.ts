import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api-base-url';
import { AuthTokenStorage } from './auth-token-storage';
import { AuthService } from './auth';

describe('AuthService', () => {
  let auth: AuthService;
  let httpTesting: HttpTestingController;
  let storedToken: string | null;
  let storedExpiry: string | null;

  beforeEach(() => {
    storedToken = null;
    storedExpiry = null;

    TestBed.configureTestingModule({
      providers: [
        { provide: API_BASE_URL, useValue: 'https://api.example.test/api' },
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthTokenStorage,
          useValue: {
            store: (token: string, expiry: string) => {
              storedToken = token;
              storedExpiry = expiry;
            },
          },
        },
      ],
    });

    auth = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('registers an account through the auth endpoint', () => {
    auth.register({ email: 'guest@example.com', password: 'strong-pass-123' }).subscribe();

    const request = httpTesting.expectOne('https://api.example.test/api/auth/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'guest@example.com',
      password: 'strong-pass-123',
    });
    request.flush({ id: 2, email: 'guest@example.com' });
  });

  it('stores the token returned by login', () => {
    const expiresAtUtc = new Date(Date.now() + 60_000).toISOString();
    auth.login({ email: 'guest@example.com', password: 'strong-pass-123' }).subscribe();

    const request = httpTesting.expectOne('https://api.example.test/api/auth/login');
    expect(request.request.method).toBe('POST');
    request.flush({
      accessToken: 'signed-access-token',
      expiresAtUtc,
      user: { id: 2, email: 'guest@example.com' },
    });

    expect(storedToken).toBe('signed-access-token');
    expect(storedExpiry).toBe(expiresAtUtc);
  });
});
