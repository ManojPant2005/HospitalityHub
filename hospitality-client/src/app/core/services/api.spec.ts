import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CreateBookingRequest } from '../models/booking';
import { ApiService } from './api';

describe('ApiService', () => {
  let service: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('should request the room list from the API', () => {
    service.getRooms().subscribe((rooms) => expect(rooms).toEqual([]));

    const request = httpTestingController.expectOne('https://localhost:7208/api/rooms');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should post a reservation to the API', () => {
    const booking: CreateBookingRequest = {
      roomId: 4,
      guestName: 'Alex Morgan',
      guestEmail: 'alex@example.com',
      checkIn: '2026-10-22',
      checkOut: '2026-10-24',
    };

    service.createBooking(booking).subscribe((created) => expect(created.id).toBe(12));

    const request = httpTestingController.expectOne('https://localhost:7208/api/bookings');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(booking);
    request.flush({ ...booking, id: 12, status: 'Confirmed', totalAmount: 240 });
  });
});