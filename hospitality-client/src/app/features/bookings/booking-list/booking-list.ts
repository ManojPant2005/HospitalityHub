import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Booking } from '../../../core/models/booking';
import { ApiService } from '../../../core/services/api';

@Component({
  selector: 'app-booking-list',
  imports: [CurrencyPipe, DatePipe, RouterLink, RouterLinkActive],
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingList implements OnInit {
  private readonly api = inject(ApiService);

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly confirmedCount = computed(
    () => this.bookings().filter((booking) => booking.status.toLowerCase() === 'confirmed').length,
  );
  readonly totalRevenue = computed(
    () =>
      this.bookings()
        .filter((booking) => booking.status.toLowerCase() !== 'cancelled')
        .reduce((total, booking) => total + booking.totalAmount, 0),
  );

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.getBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load bookings.', error);
        this.loadError.set(this.getErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Something went wrong while loading bookings. Please try again.';
    }
    if (error.status === 0) {
      return 'Could not connect to the booking service. Start the API and try again.';
    }
    if (error.status === 404) {
      return 'The booking endpoint was not found. Restart the HospitalityHub API and try again.';
    }
    return `Bookings could not be loaded (HTTP ${error.status}). Please try again.`;
  }
}
