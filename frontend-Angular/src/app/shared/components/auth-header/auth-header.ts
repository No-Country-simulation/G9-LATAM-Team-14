import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-header',
  standalone: true,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  template: `
    <div class="flex flex-col items-center mb-6 md:mb-8 text-center w-full max-w-[90%] sm:max-w-sm mx-auto">
        <div class="flex gap-2 items-center justify-center">
            <img src="images/logo.webp" alt="Fincoach Logo" class="w-8 h-8 object-contain">
            <span class="text-base sm:text-lg font-semibold text-[#5A7259]">Fincoach</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-medium text-[#214523] mt-3">{{ title() }}</h2>
        @if (subtitle()) {
            <p class="text-xs sm:text-sm text-gray-600 mt-1 px-4">{{ subtitle() }}</p>
        }
    </div>
  `
})
export class AuthHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
}
