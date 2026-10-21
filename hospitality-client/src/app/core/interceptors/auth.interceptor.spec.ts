import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { API_BASE_URL } from '../config/api-base-url';
import { AuthTokenStorage } from '../services/auth-token-storage';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let accessToken: ReturnType<typeof signal<string | null>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: API_BASE_URL, useValue: 'https://api.example.test/api' },
        {
          provide: AuthTokenStorage,
          useValue: {
            accessToken: (accessToken = signal<string | null>(null)),
            hasValidToken: () => accessToken() !== null,
          },
        },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('adds the bearer token to requests sent to the configured API', () => {
    accessToken.set('test-access-token');
    http.get('https://api.example.test/api/rooms').subscribe();

    const request = httpTesting.expectOne('https://api.example.test/api/rooms');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-access-token');
    request.flush([]);
  });

  it('does not send the token to a different origin', () => {
    accessToken.set('test-access-token');
    http.get('https://other.example.test/api/rooms').subscribe();

    const request = httpTesting.expectOne('https://other.example.test/api/rooms');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });
});
