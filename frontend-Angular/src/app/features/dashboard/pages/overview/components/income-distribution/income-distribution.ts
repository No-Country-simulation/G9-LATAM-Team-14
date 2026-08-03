import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-income-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-distribution.html',
})
export class IncomeDistribution {

  fixedExpenses = 21;
  available = 64;

  variables = [
    {
      name: 'Alimentación',
      amount: 'S/ 400'
    },
    {
      name: 'Transporte',
      amount: 'S/ 260'
    },
    {
      name: 'Ocio',
      amount: 'S/ 100'
    }
  ];

}
