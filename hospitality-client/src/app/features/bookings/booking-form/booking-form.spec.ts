import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { BookingForm } from './booking-form';

describe('BookingForm', () => {
  let component: BookingForm;
  let fixture: ComponentFixture<BookingForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingForm],
      providers: [
        {
          provide: ApiService,
          useValue: {
            getRooms: () => of([]),
            createBooking: () => of({}),
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
});
