import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthTokenStorage } from '../services/auth-token-storage';

export type WorkspacePage = 'rooms' | 'bookings' | 'booking';

@Component({
  selector: 'app-workspace-shell',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './workspace-shell.html',
  styleUrl: './workspace-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceShellComponent {
  private readonly tokenStorage = inject(AuthTokenStorage);

  @Input({ required: true }) activePage!: WorkspacePage;
  @Output() readonly signOut = new EventEmitter<void>();

  readonly accountEmail = this.tokenStorage.userEmail;

  get pageLabel(): string {
    switch (this.activePage) {
      case 'rooms':
        return 'Rooms';
      case 'bookings':
        return 'Bookings';
      case 'booking':
        return 'New booking';
    }
  }

  get accountInitials(): string {
    const email = this.accountEmail();
    if (!email) {
      return 'HH';
    }

    const name = email.split('@')[0].split(/[._-]+/).filter(Boolean);
    return name
      .slice(0, 2)
      .map((part) => part[0].toLocaleUpperCase())
      .join('') || 'HH';
  }
}
