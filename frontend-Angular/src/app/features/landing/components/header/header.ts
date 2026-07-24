import { Component, ElementRef, HostListener } from '@angular/core';
import { GreenRedirectButton } from '@app/shared/components/green-redirect-button/green-redirect-button';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [GreenRedirectButton, IconFinCoachComponent],
  templateUrl: './header.html',
})
export class Header {
  activeItem = 'Inicio';
  isMenuOpen = false;
  navItems = [
    { label: 'Inicio', link: '#' },
    { label: 'Beneficios', link: '#beneficios' },
    { label: 'Cómo funciona', link: '#como-funciona' }
  ];

  constructor(private elementRef: ElementRef) { }

  setActive(label: string) {
    this.activeItem = label;
    this.isMenuOpen = false;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.isMenuOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }
}