import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Room } from '../../../core/models/room';
import { ApiService } from '../../../core/services/api';
import { AuthService } from '../../../core/services/auth';
import { RoomListComponent } from './room-list';

describe('RoomListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomListComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: () => undefined } },
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

  it('should page through six rooms and filter by number or type', () => {
    const fixture = TestBed.createComponent(RoomListComponent);
    const component = fixture.componentInstance;
    component.rooms.set(
      Array.from({ length: 13 }, (_, index) => ({
        id: index + 1,
        roomNumber: `${200 + index}`,
        type: index >= 9 ? 'Suite' : 'Deluxe',
        pricePerNight: 120,
        isAvailable: true,
      })),
    );

    expect(component.visibleRooms()).toHaveLength(6);
    expect(component.totalPages()).toBe(3);

    component.goToPage(3);
    expect(component.visibleRooms()).toHaveLength(1);

    component.setSearchTerm('suite');
    expect(component.currentPage()).toBe(1);
    expect(component.filteredRooms()).toHaveLength(4);
    expect(component.visibleRooms().every((room) => room.type === 'Suite')).toBe(true);
  });
});