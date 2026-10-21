import { Routes } from '@angular/router';
import { RoomListComponent } from './features/rooms/room-list/room-list';
import { BookingFormComponent } from './features/bookings/booking-form/booking-form';

export const routes: Routes = [
  { path: '', component: RoomListComponent },
  { path: 'book', component: BookingFormComponent }
];