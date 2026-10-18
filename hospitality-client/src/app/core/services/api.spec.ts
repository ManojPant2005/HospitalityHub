import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, Booking } from '../models/room';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'https://localhost:7094/api'; // YOUR API URL

  constructor(private http: HttpClient) {}

  // Rooms
  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.baseUrl}/rooms`);
  }
  getRoom(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.baseUrl}/rooms/${id}`);
  }
  createRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(`${this.baseUrl}/rooms`, room);
  }
  deleteRoom(id: number) {
    return this.http.delete(`${this.baseUrl}/rooms/${id}`);
  }

  // Bookings
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings`);
  }
  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings`, booking);
  }
}