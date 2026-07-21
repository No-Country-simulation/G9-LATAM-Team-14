import { Component } from '@angular/core';
import { Header } from './components/header/header';

@Component({
  selector: 'app-landing',
  imports: [Header],
  templateUrl: './landing.html',
})
export class Landing {}