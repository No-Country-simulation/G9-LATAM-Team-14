import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private authService = inject(AuthService);
  private router = inject(Router);
  uiService = inject(UiService);

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        window.location.replace('/login');
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
      }
    });
  }

  menuItems: MenuItem[] = [
    {
      label: 'Mi perfil',
      route: '/dashboard/profile',
      iconSvg: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
    },
    {
      label: 'Dashboard',
      route: '/dashboard',
      iconSvg: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>'
    },
    {
      label: 'Movimientos',
      route: '/dashboard/movements',
      iconSvg: '<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>'
    },
    {
      label: 'Transacciones',
      route: '/dashboard/transactions',
      iconSvg: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v12"/>'
    },
    {
      label: 'Mis deudas',
      route: '/dashboard/debts',
      iconSvg: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>'
    },
    {
      label: 'Evolución',
      route: '/dashboard/evolution',
      iconSvg: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>'
    },
    {
      label: 'Recomendaciones',
      route: '/dashboard/recommendations',
      iconSvg: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>'
    }
  ];
}

interface MenuItem {
  label: string;
  route: string;
  iconSvg: string;
}