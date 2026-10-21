import { Routes } from '@angular/router';
import { RoomListComponent } from './features/rooms/room-list/room-list';
import { BookingFormComponent } from './features/bookings/booking-form/booking-form';
import { BookingList } from './features/bookings/booking-list/booking-list';
import { LoginComponent } from './features/auth/login';
import { RegisterComponent } from './features/auth/register';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: RoomListComponent, canActivate: [authGuard] },
  { path: 'book', component: BookingFormComponent, canActivate: [authGuard] },
  { path: 'bookings', component: BookingList, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];