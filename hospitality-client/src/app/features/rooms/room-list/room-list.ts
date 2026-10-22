import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { Room } from '../../../core/models/room';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-room-list',
  imports: [CommonModule, MatCardModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './room-list.html',
  styleUrl: './room-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly rooms = signal<Room[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 6;
  readonly saving = signal(false);
  readonly deletingRoomId = signal<number | null>(null);
  readonly loadError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly availableCount = computed(() => this.rooms().filter((room) => room.isAvailable).length);
  readonly unavailableCount = computed(() => this.rooms().length - this.availableCount());
  readonly filteredRooms = computed(() => {
    const search = this.searchTerm().trim().toLocaleLowerCase();
    if (!search) {
      return this.rooms();
    }

    return this.rooms().filter(
      (room) =>
        room.roomNumber.toLocaleLowerCase().includes(search) ||
        room.type.toLocaleLowerCase().includes(search),
    );
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredRooms().length / this.pageSize)));
  readonly visibleRooms = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredRooms().slice(start, start + this.pageSize);
  });
  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  readonly roomForm = this.formBuilder.nonNullable.group({
    roomNumber: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(20)]],
    type: ['Deluxe', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(40)]],
    pricePerNight: [120, [Validators.required, Validators.min(0.01)]],
    isAvailable: [true],
  });

  ngOnInit() {
    this.loadRooms();
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  loadRooms() {
    this.loading.set(true);
    this.loadError.set(null);
    this.api
      .getRooms()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (rooms) => this.rooms.set(rooms),
        error: (error: unknown) => {
          console.error('Failed to load rooms.', error);
          this.loadError.set(this.getErrorMessage(error));
        },
      });
  }

  addRoom() {
    if (this.roomForm.invalid || this.saving()) {
      this.roomForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.actionError.set(null);
    this.successMessage.set(null);
    const roomFormValue = this.roomForm.getRawValue();
    this.api
      .createRoom({
        ...roomFormValue,
        roomNumber: roomFormValue.roomNumber.trim(),
        type: roomFormValue.type.trim(),
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (room) => {
          this.rooms.update((rooms) => [...rooms, room]);
          this.currentPage.set(this.totalPages());
          this.successMessage.set(`Room ${room.roomNumber} has been added.`);
          this.roomForm.reset({
            roomNumber: '',
            type: 'Deluxe',
            pricePerNight: 120,
            isAvailable: true,
          });
        },
        error: (error: unknown) => {
          console.error('Failed to save room.', error);
          this.actionError.set(this.getErrorMessage(error));
        },
      });
  }

  deleteRoom(id: number) {
    if (this.deletingRoomId() !== null) {
      return;
    }

    this.deletingRoomId.set(id);
    this.actionError.set(null);
    this.successMessage.set(null);
    this.api
      .deleteRoom(id)
      .pipe(finalize(() => this.deletingRoomId.set(null)))
      .subscribe({
        next: () => {
          this.rooms.update((rooms) => rooms.filter((room) => room.id !== id));
          this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
        },
        error: (error: unknown) => {
          console.error('Failed to delete room.', error);
          this.actionError.set(this.getErrorMessage(error));
        },
      });
  }

  onSearchInput(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    this.setSearchTerm(event.target.value);
  }

  setSearchTerm(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.setSearchTerm('');
  }

  goToPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'An unexpected error occurred. Please try again.';
    }

    if (error.status === 0) {
      return 'Could not reach the API. Make sure the .NET service is running and its HTTPS certificate is trusted.';
    }

    const payload: unknown = error.error;
    let detail: string | undefined;
    if (typeof payload === 'string') {
      detail = payload;
    } else if (typeof payload === 'object' && payload !== null) {
      const body = payload as Record<string, unknown>;
      if (typeof body['detail'] === 'string') {
        detail = body['detail'];
      } else if (typeof body['title'] === 'string') {
        detail = body['title'];
      }
    }

    return detail
      ? `The API returned ${error.status}: ${detail}`
      : `The API returned ${error.status}. Please try again.`;
  }
}
