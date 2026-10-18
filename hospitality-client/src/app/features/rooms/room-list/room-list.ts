import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api';
import { Room } from '../../../core/models/room';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-list.html'
})
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  
  // For quick create form
  newRoom: Room = { id: 0, roomNumber: '', type: 'Deluxe', pricePerNight: 0, isAvailable: true };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.loading = true;
    this.api.getRooms().subscribe({
      next: (data) => { this.rooms = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  addRoom() {
    this.api.createRoom(this.newRoom).subscribe(() => {
      this.loadRooms();
      this.newRoom = { id: 0, roomNumber: '', type: 'Deluxe', pricePerNight: 0, isAvailable: true };
    });
  }

  deleteRoom(id: number) {
    this.api.deleteRoom(id).subscribe(() => this.loadRooms());
  }
}