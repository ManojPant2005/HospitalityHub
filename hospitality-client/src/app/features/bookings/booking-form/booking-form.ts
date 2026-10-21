import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../../core/services/api';
import { Room } from '../../../core/models/room';
import { AuthService } from '../../../core/services/auth';

function bookingDateValidator(control: AbstractControl): ValidationErrors | null {
  const checkIn = control.get('checkIn')?.value;
  const checkOut = control.get('checkOut')?.value;
  if (typeof checkIn !== 'string' || typeof checkOut !== 'string' || !checkIn || !checkOut) {
    return null;
  }

  const today = localDateString(new Date());
  if (checkIn < today) {
    return { checkInInPast: true };
  }
  if (checkOut <= checkIn) {
    return { checkOutBeforeCheckIn: true };
  }
  return null;
}

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const [inYear, inMonth, inDay] = checkIn.split('-').map(Number);
  const [outYear, outMonth, outDay] = checkOut.split('-').map(Number);
  const start = Date.UTC(inYear, inMonth - 1, inDay);
  const end = Date.UTC(outYear, outMonth - 1, outDay);
  return (end - start) / 86_400_000;
}

@Component({
  selector: 'app-booking-form',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './booking-form.html',
  styleUrl: './booking-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly today = localDateString(new Date());
  readonly rooms = signal<Room[]>([]);
  readonly loadingRooms = signal(true);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly totalNights = signal(0);
  readonly totalAmount = signal(0);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly roomLoadError = signal<string | null>(null);
  readonly bookingForm = this.formBuilder.nonNullable.group(
    {
      roomId: ['', Validators.required],
      guestName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      guestEmail: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
    },
    { validators: bookingDateValidator },
  );

  ngOnInit(): void {
    this.bookingForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateTotal());

    this.api
      .getRooms()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rooms) => {
          this.rooms.set(rooms.filter((room) => room.isAvailable));
          this.updateTotal();
          this.loadingRooms.set(false);
        },
        error: (error: unknown) => {
          console.error('Failed to load rooms for booking.', error);
          this.roomLoadError.set(this.getErrorMessage(error));
          this.loadingRooms.set(false);
        },
      });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  hasError(controlName: 'roomId' | 'guestName' | 'guestEmail' | 'checkIn' | 'checkOut'): boolean {
    const control = this.bookingForm.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (this.bookingForm.invalid || this.saving()) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const values = this.bookingForm.getRawValue();
    const roomId = Number(values.roomId);
    if (!this.rooms().some((room) => room.id === roomId)) {
      this.errorMessage.set('That room is no longer available. Please choose another room.');
      return;
    }

    this.saving.set(true);
    this.api
      .createBooking({
        roomId,
        guestName: values.guestName.trim(),
        guestEmail: values.guestEmail.trim(),
        checkIn: values.checkIn,
        checkOut: values.checkOut,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (booking) => {
          this.successMessage.set(`Booking #${booking.id} is confirmed and saved.`);
          this.bookingForm.reset();
          this.submitted.set(false);
          this.updateTotal();
          this.saving.set(false);
        },
        error: (error: unknown) => {
          console.error('Failed to save booking.', error);
          this.errorMessage.set(this.getErrorMessage(error));
          this.saving.set(false);
        },
      });
  }

  private updateTotal(): void {
    const { roomId, checkIn, checkOut } = this.bookingForm.getRawValue();
    const nights =
      checkIn && checkOut && !this.bookingForm.hasError('checkOutBeforeCheckIn')
        ? nightsBetween(checkIn, checkOut)
        : 0;
    const room = this.rooms().find((item) => item.id === Number(roomId));

    this.totalNights.set(nights > 0 ? nights : 0);
    this.totalAmount.set(room && nights > 0 ? room.pricePerNight * nights : 0);
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Something went wrong. Please try again.';
    }
    if (error.status === 0) {
      return 'Could not connect to the booking service. Start the API and try again.';
    }
    if (error.status === 404) {
      return 'The booking endpoint was not found. Restart the HospitalityHub API and try again.';
    }

    const payload: unknown = error.error;
    if (typeof payload === 'object' && payload !== null) {
      const body = payload as Record<string, unknown>;
      if (typeof body['detail'] === 'string') {
        return body['detail'];
      }
      if (typeof body['title'] === 'string') {
        return body['title'];
      }
    }
    return `The booking could not be saved (HTTP ${error.status}). Please review your details and try again.`;
  }
}

export { BookingFormComponent as BookingForm };
