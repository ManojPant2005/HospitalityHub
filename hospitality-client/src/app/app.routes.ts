import { Routes } from '@angular/router';
import { RoomListComponent } from './features/rooms/room-list/room-list';
import { BookingFormComponent } from './features/bookings/booking-form/booking-form';
import { BookingList } from './features/bookings/booking-list/booking-list';

export const routes: Routes = [
  { path: '', component: RoomListComponent },
  { path: 'book', component: BookingFormComponent },
  { path: 'bookings', component: BookingList },
];