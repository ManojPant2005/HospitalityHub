import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalLoadingService {
  private readonly activeRequestCount = signal(0);

  readonly isLoading = computed(() => this.activeRequestCount() > 0);

  requestStarted(): void {
    this.activeRequestCount.update((count) => count + 1);
  }

  requestFinished(): void {
    this.activeRequestCount.update((count) => Math.max(0, count - 1));
  }
}
