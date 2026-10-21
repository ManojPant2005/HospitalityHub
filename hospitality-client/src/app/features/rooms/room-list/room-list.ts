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
import { finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { Room } from '../../../core/models/room';

@Component({
  selector: 'app-room-list',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './room-list.html',
  styleUrl: './room-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomListComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly rooms = signal<Room[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingRoomId = signal<number | null>(null);
  readonly loadError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly availableCount = computed(() => this.rooms().filter((room) => room.isAvailable).length);
  readonly unavailableCount = computed(() => this.rooms().length - this.availableCount());

  readonly roomForm = this.formBuilder.nonNullable.group({
    roomNumber: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(20)]],
    type: ['Deluxe', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(40)]],
    pricePerNight: [120, [Validators.required, Validators.min(0.01)]],
    isAvailable: [true],
  });

  ngOnInit() {
    this.loadRooms();
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
        },
        error: (error: unknown) => {
          console.error('Failed to delete room.', error);
          this.actionError.set(this.getErrorMessage(error));
        },
      });
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
