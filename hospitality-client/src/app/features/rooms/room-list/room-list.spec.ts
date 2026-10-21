import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Room } from '../../../core/models/room';
import { ApiService } from '../../../core/services/api';
import { RoomListComponent } from './room-list';

describe('RoomListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomListComponent],
      providers: [
        provideRouter([]),
        {
          provide: ApiService,
          useValue: {
            getRooms: () => of([]),
            createRoom: (room: Room) => of(room),
            deleteRoom: () => of(void 0),
          },
        },
      ],
    }).compileComponents();
  });

  it('should display the empty state when there are no rooms', async () => {
    const fixture = TestBed.createComponent(RoomListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Your rooms will appear here');
  });
});