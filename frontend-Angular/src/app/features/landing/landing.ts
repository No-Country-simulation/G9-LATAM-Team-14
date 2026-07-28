import { Component } from '@angular/core';
import { Header, Main, Footer } from './components';
@Component({
  selector: 'app-landing',
  imports: [Header, Main, Footer],
  template: `
  <app-header></app-header>
  <app-main></app-main>
  <app-footer></app-footer>
  `,
})
export class Landing { }