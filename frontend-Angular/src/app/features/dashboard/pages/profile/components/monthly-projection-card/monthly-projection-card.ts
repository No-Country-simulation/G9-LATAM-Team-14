import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProbableActivity {
  name: string;
  percentage: string;
}

@Component({
  selector: 'app-monthly-projection-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-projection-card.html',
})
export class MonthlyProjectionCardComponent {
  income = input<number>(0);
  debtPayment = input<number>(0);
  averageExpense = input<number>(1683);

  // Clasificación del modelo de Inteligencia Artificial / Data Science
  confidencePercentage = signal<string>('95.06%');
  activityTitle = signal<string>('Ingeniería y desarrollo de software');
  activitySubtitle = signal<string>('Desarrolladores de software / Desarrolladoras de software');
  cuocCode = signal<string>('25120');

  mvpScope = signal<string>('Dentro del mvp');
  savingHabitAlert = signal<string>('Sin alerta auxiliar');

  modelJustification = signal<string>('Actividad reconocida dentro de las diez ocupaciones del MVP');

  otherProbableActivities = signal<ProbableActivity[]>([
    { name: 'Docencia y formación', percentage: '5.44%' },
    { name: 'Domicilios mensajería y reparto', percentage: '5.37%' }
  ]);

  recognizedHobbies = signal<string>('No declarado');
  ethicalCriterion = signal<string>('Los datos declarados se conservan sin inventar profesión, ingresos, hobbies ni responsabilidades.');

  savingsCapacity = computed(() => {
    const cap = this.income() - this.debtPayment() - this.averageExpense();
    return cap > 0 ? cap : 0;
  });
}
