import { Component, input } from '@angular/core';

@Component({
  selector: 'app-green-redirect-button',
  imports: [],
  templateUrl: './green-redirect-button.html',
})
export class GreenRedirectButton {
  link = input.required<string>()
  text = input<string>('')
  customClass = input<string>('')
}
