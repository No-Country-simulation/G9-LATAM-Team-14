import { Component } from '@angular/core';

import { Logo } from '../../../../shared/components/logo/logo';

@Component({
  selector: 'app-landing-footer',
  imports: [Logo],
  templateUrl: './landing-footer.html',
})
export class LandingFooter {
  protected readonly currentYear = new Date().getFullYear();
}
