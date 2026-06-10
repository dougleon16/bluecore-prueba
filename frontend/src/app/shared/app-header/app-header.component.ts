import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  readonly email = input<string | null>(null);
  readonly isDemoMode = input(true);
  readonly logoutClick = output<void>();
}
