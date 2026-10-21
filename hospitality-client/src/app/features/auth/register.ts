import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly registerForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
  });

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    if (this.registerForm.invalid || this.submitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const details = this.registerForm.getRawValue();
    this.submitting.set(true);
    this.auth
      .register({ email: details.email.trim(), password: details.password })
      .pipe(
        takeUntilDestroyed(),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: (user) => {
          this.registerForm.reset();
          this.successMessage.set(`Account created for ${user.email}. You can now sign in.`);
        },
        error: (error: unknown) => {
          console.error('Registration failed.', error);
          this.errorMessage.set(getAuthErrorMessage(error));
        },
      });
  }
}

function getAuthErrorMessage(error: unknown): string {
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
  return 'Could not create the account. Please check your details and try again.';
}
