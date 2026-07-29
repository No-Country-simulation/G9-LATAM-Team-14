import { Component, input } from '@angular/core';
import { IconFinCoachComponent } from '../../icons/iconsFinCoach';

@Component({
  selector: 'app-google-button',
  standalone: true,
  imports: [IconFinCoachComponent],
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  template: `
    <button type="button"
        class="w-full bg-[#ECF2CB] text-gray-700 border border-[#D5DCAC] py-2.5 sm:py-3 px-4 rounded-xl font-medium shadow-sm hover:bg-[#E2E9BA] transition-colors flex items-center justify-center gap-3 text-sm sm:text-base cursor-pointer">
        <app-icon-fin-coach name="google" class="w-4 h-4 flex-shrink-0" />
        <span>{{ text() }}</span>
    </button>
  `
})
export class GoogleButtonComponent {
  text = input<string>('Continuar con Google');
}
