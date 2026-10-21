import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api';
import { Room } from '../../../core/models/room';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div style="padding:20px; max-width:600px; margin:auto; font-family:sans-serif">
      <h2>New Booking</h2>
      <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" style="display:flex; flex-direction:column; gap:12px; border:1px solid #ddd; padding:20px; border-radius:8px">
        
        <label>Select Room</label>
        <select formControlName="roomId">
          <option value="">-- Select Room --</option>
          @for (r of rooms; track r.id) {
          <option [value]="r.id">
            {{r.roomNumber}} - {{r.type}} - \${{r.pricePerNight}}/night
          </option>
          }
        </select>

        <input formControlName="guestName" placeholder="Guest Name *" />
        <input formControlName="guestEmail" placeholder="Guest Email *" type="email" />

        <label>Check In</label>
        <input type="date" formControlName="checkIn" (change)="calculateTotal()" />

        <label>Check Out</label>
        <input type="date" formControlName="checkOut" (change)="calculateTotal()" />

        @if (totalAmount > 0) {
        <div style="background:#e8f5e9; padding:10px; border-radius:5px">
          <strong>Total Amount: \${{totalAmount}}</strong> for {{totalNights}} night(s)
        </div>
        }

        <button type="submit" [disabled]="bookingForm.invalid" style="padding:10px; background:#1976d2; color:white; border:none; border-radius:5px; cursor:pointer">
          Confirm Booking
        </button>
      </form>

      @if (successMsg) {
      <p style="color:green; margin-top:15px">{{successMsg}}</p>
      }
    </div>
  `
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  rooms: Room[] = [];
  totalAmount = 0;
  totalNights = 0;
  successMsg = '';

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit() {
    this.bookingForm = this.fb.group({
      roomId: ['', Validators.required],
      guestName: ['', Validators.required],
      guestEmail: ['', [Validators.required, Validators.email]],
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required]
    });

    this.api.getRooms().subscribe(r => this.rooms = r.filter(x => x.isAvailable));
  }

  calculateTotal() {
    const form = this.bookingForm.value;
    if (!form.checkIn || !form.checkOut || !form.roomId) return;

    const checkIn = new Date(form.checkIn);
    const checkOut = new Date(form.checkOut);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      this.totalAmount = 0;
      return;
    }

    this.totalNights = diffDays;
    const selectedRoom = this.rooms.find(r => r.id == form.roomId);
    if (selectedRoom) {
      this.totalAmount = this.totalNights * selectedRoom.pricePerNight;
    }
  }

  onSubmit() {
    if (this.bookingForm.invalid) return;

    const bookingPayload = {
      ...this.bookingForm.value,
      roomId: Number(this.bookingForm.value.roomId),
      totalAmount: this.totalAmount,
      status: 'Confirmed'
    };

    this.api.createBooking(bookingPayload).subscribe({
      next: () => {
        this.successMsg = 'Booking Confirmed! Check Swagger /api/bookings';
        this.bookingForm.reset();
        this.totalAmount = 0;
      },
      error: (err) => console.error(err)
    });
  }
}

export { BookingFormComponent as BookingForm };