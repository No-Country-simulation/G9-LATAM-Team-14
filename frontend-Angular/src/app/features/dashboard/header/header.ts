import { Component, inject } from '@angular/core';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
})
export class Header {
  uiService = inject(UiService);
}