import { Component, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFinCoachComponent, IconName } from '../../icons/iconsFinCoach';

@Component({
  selector: 'app-auth-input',
  standalone: true,
  imports: [FormsModule, IconFinCoachComponent],
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
        <div class="flex justify-between items-center">
            <label [for]="id()" class="text-xs sm:text-sm font-medium text-[#214523]">{{ label() }}</label>
            @if (linkText()) {
                <a [href]="linkUrl()" class="text-[11px] sm:text-xs text-gray-500 hover:underline">{{ linkText() }}</a>
            }
        </div>
        <div class="relative flex items-center w-full">
            <span class="absolute left-4 text-gray-400 flex items-center pointer-events-none">
                <app-icon-fin-coach [name]="icon()" class="w-[18px] h-[18px]" />
            </span>
            <input
                [id]="id()"
                [name]="id()"
                [type]="isPassword() ? (showPassword() ? 'text' : 'password') : type()"
                [(ngModel)]="value"
                [placeholder]="placeholder()"
                [required]="required()"
                class="w-full pl-11 pr-11 py-2.5 sm:py-3 bg-[#FAFDED] border border-[#E1E6C2] rounded-xl text-sm focus:outline-none focus:border-[#5A7259] text-gray-700 placeholder-gray-300 shadow-sm appearance-none" />
            
            @if (isPassword()) {
                <button type="button" (click)="togglePasswordVisibility()"
                    class="absolute right-4 text-gray-400 hover:text-[#5A7259] focus:outline-none flex items-center p-1 cursor-pointer">
                    @if (showPassword()) {
                        <app-icon-fin-coach name="eye-off" class="w-[18px] h-[18px]" />
                    } @else {
                        <app-icon-fin-coach name="eye" class="w-[18px] h-[18px]" />
                    }
                </button>
            }
        </div>
    </div>
  `
})
export class AuthInputComponent {
  id = input.required<string>();
  label = input.required<string>();
  type = input<string>('text');
  placeholder = input<string>('');
  icon = input<IconName>('mail');
  value = model<string>('');
  linkText = input<string>('');
  linkUrl = input<string>('#');
  required = input<boolean>(false);
  isPassword = input<boolean>(false);

  showPassword = signal(false);

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }
}
