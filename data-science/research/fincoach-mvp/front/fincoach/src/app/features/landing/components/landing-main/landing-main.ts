import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ScrollReveal } from '../../../../shared/directives/scroll-reveal';

@Component({
  selector: 'app-landing-main',
  imports: [RouterLink, ScrollReveal],
  templateUrl: './landing-main.html',
})
export class LandingMain {}
