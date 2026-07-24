import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  onLogout() {
  console.log('CLICK LOGOUT');

  this.authService.logout().subscribe({
    next: () => {
      console.log('LOGOUT OK');
      window.location.replace('/login');
    },
    error: (err) => {
      console.error('ERROR LOGOUT', err);
    }
  });
}
}