import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthHeaderComponent } from '../../shared/components/auth-header/auth-header';
import { AuthInputComponent } from '../../shared/components/auth-input/auth-input';
import { GoogleButtonComponent } from '../../shared/components/google-button/google-button';
import { IconFinCoachComponent } from '../../shared/icons/iconsFinCoach';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AuthHeaderComponent,
    AuthInputComponent,
    GoogleButtonComponent,
    IconFinCoachComponent
  ],
  templateUrl: './register.html',
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
}
