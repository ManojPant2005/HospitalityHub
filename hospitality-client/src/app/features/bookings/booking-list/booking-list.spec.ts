import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api';

import { BookingList } from './booking-list';

describe('BookingList', () => {
  let component: BookingList;
  let fixture: ComponentFixture<BookingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingList],
      providers: [
        provideRouter([]),
        {
          provide: ApiService,
          useValue: { getBookings: () => of([]) },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an empty state when no reservations exist', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No bookings yet');
  });
});
