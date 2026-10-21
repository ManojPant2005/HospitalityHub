import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalHttpStatusComponent } from './core/components/global-http-status';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalHttpStatusComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('hospitality-client');
}
