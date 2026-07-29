import { Component, input } from '@angular/core';

@Component({
  selector: 'app-green-redirect-button',
  imports: [],
  template: `
  <a [href]="link()" class=" bg-[#5A7259] text-white px-4 py-2 {{ customClass() }}">
    {{ text() }}
  </a>`,
})
export class GreenRedirectButton {
  link = input.required<string>()
  text = input<string>('')
  customClass = input<string>('')
}
