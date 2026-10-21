import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GlobalApiErrorService } from '../services/global-api-error';
import { GlobalLoadingService } from '../services/global-loading';

@Component({
  selector: 'app-global-http-status',
  template: `
    @if (loading.isLoading()) {
      <div class="loading-indicator" role="status" aria-label="Loading">
        <span></span>
        <span class="visually-hidden">Loading data...</span>
      </div>
      <div class="loading-status" aria-hidden="true">
        <span class="spinner"></span>
        <span>Loading your stay...</span>
      </div>
    }

    <section class="error-stack" aria-label="API error notifications" aria-live="assertive">
      @for (error of apiErrors.errors(); track error.id) {
        <div class="error-toast" role="alert">
          <span class="error-icon" aria-hidden="true">!</span>
          <p>{{ error.message }}</p>
          <button
            type="button"
            [attr.aria-label]="'Dismiss error: ' + error.message"
            (click)="apiErrors.dismiss(error.id)"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      }
    </section>
  `,
  styleUrl: './global-http-status.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalHttpStatusComponent {
  protected readonly loading = inject(GlobalLoadingService);
  protected readonly apiErrors = inject(GlobalApiErrorService);
}
