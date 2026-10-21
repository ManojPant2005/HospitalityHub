import { Room } from './room';

export interface Booking {
  id: number;
  roomId: number;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalAmount: number;
  room?: Room;
}

export interface CreateBookingRequest {
  roomId: number;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
}
