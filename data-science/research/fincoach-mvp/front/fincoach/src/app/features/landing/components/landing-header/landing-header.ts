import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Logo } from '../../../../shared/components/logo/logo';

@Component({
  selector: 'app-landing-header',
  imports: [RouterLink, Logo],
  templateUrl: './landing-header.html',
})
export class LandingHeader {
  protected readonly menuOpen = signal(false);

  protected readonly navigation = [
    { label: 'Inicio', link: '#inicio' },
    { label: 'Beneficios', link: '#beneficios' },
    { label: 'Cómo funciona', link: '#como-funciona' },
  ];

  protected toggleMenu(): void {
    this.menuOpen.update((current) => !current);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
