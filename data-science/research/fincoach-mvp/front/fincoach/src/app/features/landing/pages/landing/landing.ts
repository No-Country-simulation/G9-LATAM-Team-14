import { Component } from '@angular/core';

import { LandingFooter } from '../../components/landing-footer/landing-footer';
import { LandingHeader } from '../../components/landing-header/landing-header';
import { LandingMain } from '../../components/landing-main/landing-main';

@Component({
  selector: 'app-landing',
  imports: [LandingHeader, LandingMain, LandingFooter],
  templateUrl: './landing.html',
})
export class Landing {}
