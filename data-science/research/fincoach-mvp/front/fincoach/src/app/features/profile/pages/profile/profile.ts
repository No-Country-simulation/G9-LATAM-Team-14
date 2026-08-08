import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  FinancialProfile,
  FinancialProfileInput,
  IncomeModality,
  ProfileApi,
  SavingHabit,
} from '../../../../core/api/profile-api';
import { Footer } from '../../../../shared/layout/footer/footer';
import { Header } from '../../../../shared/layout/header/header';

const profileDependencies: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const income = Number(control.get('monthlyNetIncome')?.value);
  const debtRatio = control.get('debtRatioPercentage')?.value;
  const debtTypes = String(control.get('debtTypes')?.value ?? '').trim();
  const primaryModality = control.get('primaryIncomeModality')?.value;
  const hasAdditionalIncome = control.get('hasAdditionalIncome')?.value;
  const additionalActivity = String(
    control.get('additionalActivity')?.value ?? '',
  ).trim();
  const additionalModality = control.get('additionalIncomeModality')?.value;
  const errors: ValidationErrors = {};

  if (income > 0 && (debtRatio === null || debtRatio === '')) {
    errors['debtRatioRequired'] = true;
  }
  if (Number(debtRatio) > 0 && !debtTypes) {
    errors['debtTypesRequired'] = true;
  }
  if (income > 0 && primaryModality === 'sin_ingresos') {
    errors['incomeModalityInvalid'] = true;
  }
  if (income === 0 && hasAdditionalIncome) {
    errors['additionalIncomeWithoutIncome'] = true;
  }
  if (hasAdditionalIncome && !additionalActivity) {
    errors['additionalActivityRequired'] = true;
  }
  if (
    hasAdditionalIncome &&
    (!additionalModality || additionalModality === 'sin_ingresos')
  ) {
    errors['additionalModalityRequired'] = true;
  }

  return Object.keys(errors).length ? errors : null;
};

@Component({
  selector: 'app-profile',
  imports: [DatePipe, Footer, Header, ReactiveFormsModule],
  templateUrl: './profile.html',
})
export class Profile {
  private readonly profileApi = inject(ProfileApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly profileForm = new FormGroup(
    {
      monthlyNetIncome: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0)],
      }),
      savingHabit: new FormControl<SavingHabit>('media', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      debtRatioPercentage: new FormControl<number | null>(null, {
        validators: [Validators.min(0), Validators.max(100)],
      }),
      debtTypes: new FormControl('', { nonNullable: true }),
      primaryActivity: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(250)],
      }),
      primaryIncomeModality: new FormControl<IncomeModality | ''>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      hasAdditionalIncome: new FormControl(false, { nonNullable: true }),
      additionalActivity: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(250)],
      }),
      additionalIncomeModality: new FormControl<IncomeModality | ''>('', {
        nonNullable: true,
      }),
      nextGoal: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(300)],
      }),
      hobbies: new FormControl('', { nonNullable: true }),
      financialResponsibility: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(300)],
      }),
    },
    { validators: profileDependencies },
  );

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly profileExists = signal(false);
  readonly profile = signal<FinancialProfile | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isDetailView = this.route.snapshot.data['profileMode'] === 'detail';

  constructor() {
    this.profileForm.controls.monthlyNetIncome.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((income) => {
        if (income === 0) {
          this.profileForm.controls.primaryIncomeModality.setValue(
            'sin_ingresos',
          );
          this.profileForm.controls.hasAdditionalIncome.setValue(false);
          this.profileForm.controls.debtRatioPercentage.setValue(0);
        } else if (
          income !== null &&
          this.profileForm.controls.primaryIncomeModality.value ===
            'sin_ingresos'
        ) {
          this.profileForm.controls.primaryIncomeModality.setValue('');
        }
      });

    this.profileForm.controls.hasAdditionalIncome.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((hasAdditionalIncome) => {
        if (!hasAdditionalIncome) {
          this.profileForm.controls.additionalActivity.setValue('');
          this.profileForm.controls.additionalIncomeModality.setValue('');
        }
      });

    this.loadProfile();
  }

  submit(): void {
    this.profileForm.markAllAsTouched();

    if (this.profileForm.invalid || this.isSaving()) {
      return;
    }

    const data = this.buildRequest();
    const isUpdate = this.isDetailView && this.profileExists();
    const request = isUpdate
      ? this.profileApi.update(data)
      : this.profileApi.create(data);

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSaving.set(true);

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: ({ profile }) => {
        this.profileExists.set(true);
        this.profile.set(profile);
        this.applyProfile(profile);
        if (isUpdate) {
          this.successMessage.set(
            'Tu perfil financiero fue actualizado correctamente.',
          );
        } else {
          this.router.navigate(['/me']);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  readableValue(value: string): string {
    if (!value) {
      return 'No declarado';
    }

    const readable = value.split('_').join(' ');
    return readable.charAt(0).toUpperCase() + readable.slice(1);
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.profileApi
      .getMine()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ profile }) => {
          if (!this.isDetailView) {
            this.router.navigate(['/me']);
            return;
          }

          this.profileExists.set(true);
          this.profile.set(profile);
          this.applyProfile(profile);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            if (this.isDetailView) {
              this.router.navigate(['/profile']);
              return;
            }
            this.profileExists.set(false);
            return;
          }
          if (error.status === 401) {
            this.router.navigate(['/login']);
            return;
          }

          this.errorMessage.set(
            'No fue posible consultar tu perfil financiero.',
          );
        },
      });
  }

  private buildRequest(): FinancialProfileInput {
    const value = this.profileForm.getRawValue();
    const income = Number(value.monthlyNetIncome);
    const hasAdditionalIncome = value.hasAdditionalIncome && income > 0;

    return {
      monthly_net_income: income,
      saving_habit: value.savingHabit,
      debt_ratio_percentage:
        value.debtRatioPercentage === null
          ? null
          : Number(value.debtRatioPercentage),
      debt_types: this.toList(value.debtTypes),
      primary_activity: value.primaryActivity.trim(),
      primary_income_modality:
        income === 0
          ? 'sin_ingresos'
          : (value.primaryIncomeModality as IncomeModality),
      has_additional_income: hasAdditionalIncome,
      additional_activity: hasAdditionalIncome
        ? value.additionalActivity.trim()
        : '',
      additional_income_modality: hasAdditionalIncome
        ? (value.additionalIncomeModality as IncomeModality)
        : '',
      next_goal: value.nextGoal.trim(),
      hobbies: this.toList(value.hobbies),
      financial_responsibility: value.financialResponsibility.trim(),
    };
  }

  private toList(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private applyProfile(profile: FinancialProfile): void {
    const declared = profile.declared_data;
    this.profileForm.patchValue({
      monthlyNetIncome: declared.monthly_net_income,
      savingHabit: declared.saving_habit,
      debtRatioPercentage: declared.debt_ratio_percentage,
      debtTypes: declared.debt_types.join(', '),
      primaryActivity: declared.primary_activity,
      primaryIncomeModality: declared.primary_income_modality,
      hasAdditionalIncome: declared.additional_income !== null,
      additionalActivity: declared.additional_income?.activity ?? '',
      additionalIncomeModality: declared.additional_income?.modality ?? '',
      nextGoal: declared.next_goal,
      hobbies: declared.hobbies.join(', '),
      financialResponsibility: declared.financial_responsibility,
    });
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.router.navigate(['/login']);
      return;
    }
    if (error.status === 409) {
      this.router.navigate(['/me']);
      return;
    }
    if (error.status === 503) {
      this.errorMessage.set(
        'El modelo de clasificación no está disponible en este momento.',
      );
      return;
    }
    if (error.status === 400) {
      this.errorMessage.set(this.validationMessage(error.error));
      return;
    }

    this.errorMessage.set(
      'No fue posible guardar tu perfil. Inténtalo nuevamente.',
    );
  }

  private validationMessage(response: unknown): string {
    if (!response || typeof response !== 'object') {
      return 'Revisa los datos declarados e inténtalo nuevamente.';
    }

    const messages = Object.values(response as Record<string, unknown>).flatMap(
      (value) => (Array.isArray(value) ? value : [value]),
    );
    const firstMessage = messages.find((value) => typeof value === 'string');

    return typeof firstMessage === 'string'
      ? firstMessage
      : 'Revisa los datos declarados e inténtalo nuevamente.';
  }
}
