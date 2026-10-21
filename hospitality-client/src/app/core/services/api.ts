import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, CreateBookingRequest } from '../models/booking';
import { Room } from '../models/room';
import { API_BASE_URL } from '../config/api-base-url';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = inject(API_BASE_URL);

  constructor(private http: HttpClient) {}

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.baseUrl}/rooms`);
  }
  getRoom(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.baseUrl}/rooms/${id}`);
  }
  createRoom(room: Omit<Room, 'id'>): Observable<Room> {
    return this.http.post<Room>(`${this.baseUrl}/rooms`, room);
  }
  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rooms/${id}`);
  }
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings`);
  }
  createBooking(booking: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings`, booking);
  }
}
