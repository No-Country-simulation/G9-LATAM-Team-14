import { Component, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
})
export class Header {
  activeItem = 'Inicio';
  isMenuOpen = false;
  navItems = [
    { label: 'Inicio', link: '#' },
    { label: 'Beneficios', link: '#' },
    { label: 'Como funciona', link: '#' }
  ];

  constructor(private elementRef: ElementRef) {}
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