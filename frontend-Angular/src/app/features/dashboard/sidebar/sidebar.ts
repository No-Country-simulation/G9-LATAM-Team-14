import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { IconFinCoachComponent, IconName } from '@app/shared/icons/iconsFinCoach';
import { UiService } from '@core/services/ui.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconFinCoachComponent],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private authService = inject(AuthService);
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
      iconName: 'profile'
    },
    {
      label: 'Dashboard',
      route: '/dashboard',
      iconName: 'dashboard'
    },
    {
      label: 'Movimientos',
      route: '/dashboard/movements',
      iconName: 'movements'
    },
    {
      label: 'Transacciones',
      route: '/dashboard/transactions',
      iconName: 'transactions'
    },
    {
      label: 'Mis deudas',
      route: '/dashboard/debts',
      iconName: 'debts'
    },
    {
      label: 'Evolución',
      route: '/dashboard/evolution',
      iconName: 'evolution'
    },
    {
      label: 'Recomendaciones',
      route: '/dashboard/recommendations',
      iconName: 'recommendations'
    }
  ];
}

interface MenuItem {
  label: string;
  route: string;
  iconName: IconName;
}