import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financial-status-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-status-card.html',
})
export class FinancialStatusCard {

  status = 'EN OBSERVACIÓN';

  title = 'Tu perfil financiero este mes';

  description =
    'Tus gastos de transporte subieron un 18% este mes. Tu nivel de endeudamiento se mantiene manejable.';

  confidence = 82;

  detailButtonText = 'Ver detalle →';

}
