import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingList } from './booking-list';

describe('BookingList', () => {
  let component: BookingList;
  let fixture: ComponentFixture<BookingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
