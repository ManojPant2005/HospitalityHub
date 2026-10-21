import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.maxLength(128)]],
  });

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.loginForm.invalid || this.submitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = this.loginForm.getRawValue();
    this.submitting.set(true);
    this.auth
      .login({ email: credentials.email.trim(), password: credentials.password })
      .pipe(
        takeUntilDestroyed(),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl('/'),
        error: (error: unknown) => {
          console.error('Login failed.', error);
          this.errorMessage.set(getAuthErrorMessage(error, 'Sign-in failed. Please try again.'));
        },
      });
  }
}

function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return 'Could not connect to the API. Make sure the backend is running.';
  }
  if (error instanceof HttpErrorResponse && typeof error.error === 'object' && error.error !== null) {
    const body = error.error as Record<string, unknown>;
    if (typeof body['title'] === 'string') {
      return body['title'];
    }
    if (typeof body['detail'] === 'string') {
      return body['detail'];
    }
  }
  return fallback;
}
