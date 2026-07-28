import { Component } from '@angular/core';
import { ScrollRevealDirective } from '@app/shared/directives/scroll-reveal.directive';
import { IconFinCoachComponent } from '@app/shared/icons/iconsFinCoach';
import { GreenRedirectButton } from '@app/shared/components/green-redirect-button/green-redirect-button';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [GreenRedirectButton, IconFinCoachComponent, ScrollRevealDirective],
  templateUrl: './main.html',
})
export class Main { }
