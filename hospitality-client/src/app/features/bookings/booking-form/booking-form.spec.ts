import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Booking, CreateBookingRequest } from '../../../core/models/booking';
import { Room } from '../../../core/models/room';
import { ApiService } from '../../../core/services/api';
import { AuthService } from '../../../core/services/auth';
import { BookingForm } from './booking-form';

describe('BookingForm', () => {
  let component: BookingForm;
  let fixture: ComponentFixture<BookingForm>;
  let createBooking: ReturnType<typeof vi.fn>;

  const room: Room = {
    id: 1,
    roomNumber: '204',
    type: 'Deluxe',
    pricePerNight: 120,
    isAvailable: true,
  };

  beforeEach(async () => {
    createBooking = vi.fn((request: CreateBookingRequest) =>
      of<Booking>({
        ...request,
        id: 7,
        status: 'Confirmed',
        totalAmount: 120,
        room,
      }),
    );
    await TestBed.configureTestingModule({
      imports: [BookingForm],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: () => undefined } },
        {
          provide: ApiService,
          useValue: {
            getRooms: () => of([room]),
            createBooking,
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation errors when submitted without required details', () => {
    component.onSubmit();

    expect(component.bookingForm.invalid).toBe(true);
    expect(component.submitted()).toBe(true);
    expect(createBooking).not.toHaveBeenCalled();
  });

  it('should save a valid reservation and show the confirmation', () => {
    component.bookingForm.setValue({
      roomId: '1',
      guestName: 'Alex Morgan',
      guestEmail: 'alex@example.com',
      checkIn: dateFromToday(1),
      checkOut: dateFromToday(2),
    });

    component.onSubmit();

    expect(createBooking).toHaveBeenCalledWith({
      roomId: 1,
      guestName: 'Alex Morgan',
      guestEmail: 'alex@example.com',
      checkIn: dateFromToday(1),
      checkOut: dateFromToday(2),
    });
    expect(component.successMessage()).toBe('Booking #7 is confirmed and saved.');
    expect(component.bookingForm.controls.guestName.value).toBe('');
  });
});

function dateFromToday(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
