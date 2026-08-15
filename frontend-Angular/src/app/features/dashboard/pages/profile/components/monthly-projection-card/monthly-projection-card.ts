import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/auth/services/auth.service';
import { ProfileService, UserProfileResponse } from '@core/profile/services/profile.service';

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
export class MonthlyProjectionCardComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  income = input<number>(0);
  debtPayment = input<number>(0);
  averageExpense = input<number>(1683);

  confidencePercentage = signal<string>('');
  activityTitle = signal<string>('');
  activitySubtitle = signal<string>('');
  cuocCode = signal<string>('');

  mvpScope = signal<string>('');
  savingHabitAlert = signal<string>('');

  modelJustification = signal<string>('');

  otherProbableActivities = signal<ProbableActivity[]>([]);
  recognizedHobbiesList = signal<string[]>([]);
  ethicalCriterion = signal<string>('Los datos declarados se conservan éticamente sin inventar profesión, ingresos, hobbies ni responsabilidades.');

  savingsCapacity = computed(() => {
    const inc = Number(this.income()) || 0;
    const debt = Number(this.debtPayment()) || 0;
    const exp = Number(this.averageExpense()) || 0;
    const cap = inc - debt - exp;
    return cap > 0 ? cap : 0;
  });

  ngOnInit(): void {
    this.profileService.getProfile().subscribe(profile => {
      if (!profile) return;
      if (profile.actividadPrincipal && profile.actividadPrincipal !== 'no_disponible') {
        this.activityTitle.set(profile.actividadPrincipal);
      }
      if (profile.ocupacionCuoc && profile.ocupacionCuoc !== 'no_disponible') {
        this.activitySubtitle.set(profile.ocupacionCuoc);
      }

      this.confidencePercentage.set(profile.confianzaIaPct ? `${Math.round(profile.confianzaIaPct)}%` : '');
      this.savingHabitAlert.set(profile.frecuenciaAhorro || '');
      if (profile.hobbies) this.recognizedHobbiesList.set(profile.hobbies);
      if (profile.resultadoIaJson) this.parseJsonResult(profile.resultadoIaJson);
    });
  }

  private parseJsonResult(jsonStr: string): void {
    try {
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      const c = parsed.classification || parsed;
      this.mvpScope.set(c.estado_alcance_mvp === 'dentro_del_mvp' ? 'Dentro del MVP' : 'Fuera del alcance MVP');

      const declared = c.actividad_declarada || c.actividad_principal;
      if (declared && declared !== 'no_disponible') {
        this.activityTitle.set(declared);
      }

      if (c.ocupacion_cuoc && c.ocupacion_cuoc !== 'no_disponible') {
        this.activitySubtitle.set(c.ocupacion_cuoc);
      }

      if (c.codigo_cuoc && c.codigo_cuoc !== 'no_disponible') this.cuocCode.set(c.codigo_cuoc);
      if (c.confianza_actividad_pct) this.confidencePercentage.set(`${Math.round(c.confianza_actividad_pct)}%`);

      this.modelJustification.set(`Clasificación realizada con el modelo de IA. La actividad '${declared || this.activityTitle()}' fue clasificada con éxito bajo el estándar CUOC.`);

      const hobbies = [...(c.hobbies_intereses || []), ...(c.hobbies_fuera_mvp || [])].filter((h: string) => h && h !== 'no_declarado');
      if (hobbies.length > 0) this.recognizedHobbiesList.set(hobbies);

      if (c.top_3_actividades && Array.isArray(c.top_3_actividades)) {
        this.otherProbableActivities.set(c.top_3_actividades.map((a: any) => ({
          name: (a.activity || '').replace(/_/g, ' '),
          percentage: `${a.percentage || 0}%`
        })));
      }
    } catch (e) { }
  }
}
