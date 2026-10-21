import {
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { loadingErrorInterceptor } from './loading-error.interceptor';
import { GlobalApiErrorService } from '../services/global-api-error';
import { GlobalLoadingService } from '../services/global-loading';
import { AuthTokenStorage } from '../services/auth-token-storage';
import { HttpClient } from '@angular/common/http';

describe('loadingErrorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let loading: GlobalLoadingService;
  let apiErrors: GlobalApiErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingErrorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthTokenStorage, useValue: { clear: vi.fn() } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    loading = TestBed.inject(GlobalLoadingService);
    apiErrors = TestBed.inject(GlobalApiErrorService);
  });

  afterEach(() => httpTesting.verify());

  it('tracks every active request until all requests finish', () => {
    http.get('/api/rooms').subscribe();
    http.get('/api/bookings').subscribe();

    expect(loading.isLoading()).toBe(true);

    httpTesting.expectOne('/api/rooms').flush([]);
    expect(loading.isLoading()).toBe(true);

    httpTesting.expectOne('/api/bookings').flush([]);
    expect(loading.isLoading()).toBe(false);
  });

  it('shows a global message and preserves the original HTTP error', () => {
    let receivedError: unknown;
    http.get('/api/bookings').subscribe({
      error: (error: unknown) => (receivedError = error),
    });

    httpTesting.expectOne('/api/bookings').flush(
      { title: 'The service is unavailable.' },
      { status: 503, statusText: 'Service Unavailable' },
    );

    expect(receivedError).toBeInstanceOf(HttpErrorResponse);
    expect(apiErrors.errors()).toEqual([
      { id: 1, message: 'The service is unavailable.' },
    ]);
    expect(loading.isLoading()).toBe(false);
  });
});
