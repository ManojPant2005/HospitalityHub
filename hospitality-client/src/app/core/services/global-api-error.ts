import { Injectable, signal } from '@angular/core';

export interface GlobalApiError {
  id: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class GlobalApiErrorService {
  private nextId = 0;

  readonly errors = signal<GlobalApiError[]>([]);

  add(message: string): void {
    const error = { id: ++this.nextId, message };
    this.errors.update((errors) => [...errors, error].slice(-4));
  }

  dismiss(id: number): void {
    this.errors.update((errors) => errors.filter((error) => error.id !== id));
  }
}
