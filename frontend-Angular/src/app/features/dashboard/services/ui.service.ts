import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  isSidebarOpen = signal<boolean>(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update(state => !state);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}