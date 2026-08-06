import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import {
  TransactionCategory,
  TransactionClassifyResponse,
  TransactionConfirmResponse,
  TransactionCreateResponse,
  FinancialTransaction,
  TransactionApi,
  TransactionRegularity,
} from '../../../../core/api/transaction-api';
import {
  DebtApi,
  DebtCreateResponse,
  DebtListItem,
  DebtType,
} from '../../../../core/api/debt-api';
import { Footer } from '../../../../shared/layout/footer/footer';
import { Header } from '../../../../shared/layout/header/header';

@Component({
  selector: 'app-transactions',
  imports: [Footer, Header, ReactiveFormsModule, RouterLink],
  templateUrl: './transactions.html',
})
export class Transactions {
  private readonly transactionApi = inject(TransactionApi);
  private readonly debtApi = inject(DebtApi);
  private readonly router = inject(Router);
  private readonly currencyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
  private readonly dateFormatter = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  private readonly timeFormatter = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly showNewMovementModal = signal(false);
  readonly showNewDebtModal = signal(false);
  readonly debtModalStep = signal<'form' | 'saving' | 'success'>('form');
  readonly debtModalError = signal('');
  readonly createdDebt = signal<DebtCreateResponse | null>(null);
  readonly modalStep = signal<
    'form' | 'classifying' | 'classification-error' | 'confirmation' | 'saving' | 'success'
  >('form');
  readonly modalError = signal('');
  readonly createdTransaction = signal<TransactionCreateResponse | null>(null);
  readonly classification = signal<TransactionClassifyResponse | null>(null);
  readonly confirmation = signal<TransactionConfirmResponse | null>(null);
  readonly selectedCategory = signal('');
  readonly selectedRegularity = signal<TransactionRegularity | ''>('');
  readonly selectedDebtId = signal<number | null>(null);
  readonly debts = signal<DebtListItem[]>([]);
  readonly isLoadingDebts = signal(false);
  readonly transactions = signal<FinancialTransaction[]>([]);
  readonly monthlyTransactions = signal<FinancialTransaction[]>([]);
  readonly totalItems = signal(0);
  readonly registeredDebtCount = signal(0);
  readonly transactionForm = new FormGroup({
    transactionDate: new FormControl(this.today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(250)],
    }),
    note: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(300)],
    }),
    amount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    direction: new FormControl<'entrada' | 'salida'>('salida', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  readonly debtForm = new FormGroup({
    debtType: new FormControl<DebtType>('credit_card', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    originalAmount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    termMonths: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.max(600),
      ],
    }),
    startDate: new FormControl(this.today(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  readonly classificationOptions = computed<TransactionCategory[]>(() => {
    const suggestion = this.classification()?.model_suggestion;
    if (!suggestion) {
      return [];
    }

    const options = [
      {
        category: suggestion.category,
        percentage: suggestion.category_confidence_percentage,
      },
      ...suggestion.alternative_categories,
    ];

    return options.filter(
      (option, index) =>
        options.findIndex((item) => item.category === option.category) === index,
    );
  });
  readonly incomeTotal = computed(() =>
    this.monthlyTransactions()
      .filter((transaction) => transaction.direction === 'entrada')
      .reduce((total, transaction) => total + transaction.amount, 0),
  );
  readonly expenseTotal = computed(() =>
    this.monthlyTransactions()
      .filter((transaction) => transaction.direction === 'salida')
      .reduce((total, transaction) => total + transaction.amount, 0),
  );

  constructor() {
    this.loadTransactions();
    this.loadRegisteredDebtCount();
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      latest: this.transactionApi.getLatest(10),
      currentMonth: this.transactionApi.getByMonth(this.currentMonth()),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ latest, currentMonth }) => {
          this.transactions.set(latest.transactions);
          this.monthlyTransactions.set(currentMonth.transactions);
          this.totalItems.set(latest.pagination.total_items);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.router.navigate(['/login']);
            return;
          }

          this.errorMessage.set(
            'No fue posible consultar tus movimientos.',
          );
        },
      });
  }

  openNewMovement(): void {
    this.resetModal();
    this.showNewMovementModal.set(true);
  }

  openNewDebt(): void {
    this.debtModalStep.set('form');
    this.debtModalError.set('');
    this.createdDebt.set(null);
    this.debtForm.reset({
      debtType: 'credit_card',
      originalAmount: null,
      termMonths: null,
      startDate: this.today(),
    });
    this.showNewDebtModal.set(true);
  }

  closeNewDebt(): void {
    if (this.debtModalStep() === 'saving') {
      return;
    }

    this.showNewDebtModal.set(false);
  }

  registerDebt(): void {
    this.debtForm.markAllAsTouched();
    if (this.debtForm.invalid || this.debtModalStep() !== 'form') {
      return;
    }

    const value = this.debtForm.getRawValue();
    this.debtModalStep.set('saving');
    this.debtModalError.set('');
    this.debtApi
      .create({
        debt_type: value.debtType,
        original_amount: Number(value.originalAmount),
        term_months: Number(value.termMonths),
        start_date: value.startDate,
      })
      .subscribe({
        next: (response) => {
          this.createdDebt.set(response);
          this.debts.set([]);
          this.loadRegisteredDebtCount();
          this.debtModalStep.set('success');
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.router.navigate(['/login']);
            return;
          }

          this.debtModalStep.set('form');
          this.debtModalError.set(this.debtErrorMessage(error));
        },
      });
  }

  closeNewMovement(): void {
    if (!this.canCloseModal()) {
      return;
    }

    this.showNewMovementModal.set(false);
  }

  canCloseModal(): boolean {
    return this.modalStep() === 'form' || this.modalStep() === 'success';
  }

  registerMovement(): void {
    this.transactionForm.markAllAsTouched();
    if (this.transactionForm.invalid || this.modalStep() !== 'form') {
      return;
    }

    const value = this.transactionForm.getRawValue();
    this.modalError.set('');
    this.modalStep.set('classifying');

    this.transactionApi
      .create({
        transaction_date: value.transactionDate,
        description: value.description.trim(),
        note: value.note.trim(),
        amount: Number(value.amount),
        direction: value.direction,
      })
      .subscribe({
        next: (response) => {
          this.createdTransaction.set(response);
          this.classifyMovement(response.transaction.id);
        },
        error: (error: HttpErrorResponse) => {
          this.modalStep.set('form');
          this.modalError.set(this.modalErrorMessage(error));
        },
      });
  }

  retryClassification(): void {
    const transactionId = this.createdTransaction()?.transaction.id;
    if (transactionId) {
      this.classifyMovement(transactionId);
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
    this.selectedDebtId.set(null);

    if (category === 'Deuda y financiación') {
      this.loadDebts();
    }
  }

  selectDebt(value: string): void {
    this.selectedDebtId.set(value ? Number(value) : null);
  }

  selectRegularity(regularity: TransactionRegularity): void {
    this.selectedRegularity.set(regularity);
  }

  confirmClassification(): void {
    const classification = this.classification();
    const category = this.selectedCategory();
    const regularity = this.selectedRegularity();
    if (!classification || !category || !regularity) {
      this.modalError.set('Selecciona la categoría y la regularidad para confirmar.');
      return;
    }

    if (category === 'Deuda y financiación' && !this.selectedDebtId()) {
      this.modalError.set('Selecciona la deuda a la que corresponde este pago.');
      return;
    }

    this.modalStep.set('saving');
    this.modalError.set('');
    this.transactionApi
      .confirm(classification.transaction_id, {
        selected_categories: [{ category, percentage: 100 }],
        selected_purpose: classification.model_suggestion.purpose,
        selected_regularity: regularity,
        ...(this.selectedDebtId()
          ? { selected_debt_id: this.selectedDebtId()! }
          : {}),
      })
      .subscribe({
        next: (response) => {
          this.confirmation.set(response);
          this.modalStep.set('success');
          this.loadTransactions();
        },
        error: (error: HttpErrorResponse) => {
          this.modalStep.set('confirmation');
          this.modalError.set(this.modalErrorMessage(error));
        },
      });
  }

  category(transaction: FinancialTransaction): string {
    const finalCategories = transaction.final_classification?.categories ?? [];
    if (finalCategories.length) {
      return finalCategories.map((item) => item.category).join(' · ');
    }

    return transaction.model_suggestion?.category ?? 'Sin clasificar';
  }

  formatAmount(transaction: FinancialTransaction): string {
    const value = this.currencyFormatter.format(transaction.amount);
    return transaction.direction === 'entrada' ? `+ ${value}` : `− ${value}`;
  }

  formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  formatDate(value: string): string {
    const parts = value.split('-').map((part) => Number(part));
    const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
    return this.dateFormatter.format(localDate);
  }

  formatTime(value: string): string {
    return this.timeFormatter.format(new Date(value));
  }

  readableValue(value: string): string {
    const readable = value.split('_').join(' ');
    return readable.charAt(0).toUpperCase() + readable.slice(1);
  }

  debtTypeLabel(type: DebtType): string {
    const labels: Record<DebtType, string> = {
      housing: 'Crédito de vivienda',
      educational: 'Crédito educativo',
      credit_card: 'Tarjeta de crédito',
      vehicle: 'Crédito de vehículo',
      personal: 'Crédito personal',
    };
    return labels[type];
  }

  private classifyMovement(transactionId: number): void {
    this.modalStep.set('classifying');
    this.modalError.set('');
    this.transactionApi.classify(transactionId).subscribe({
      next: (response) => {
        this.classification.set(response);
        this.selectedCategory.set(response.model_suggestion.category);
        this.selectedRegularity.set(response.model_suggestion.regularity);
        if (response.model_suggestion.category === 'Deuda y financiación') {
          this.loadDebts();
        }
        this.modalStep.set('confirmation');
      },
      error: (error: HttpErrorResponse) => {
        this.modalStep.set('classification-error');
        this.modalError.set(this.modalErrorMessage(error));
      },
    });
  }

  private resetModal(): void {
    this.modalStep.set('form');
    this.modalError.set('');
    this.createdTransaction.set(null);
    this.classification.set(null);
    this.confirmation.set(null);
    this.selectedCategory.set('');
    this.selectedRegularity.set('');
    this.selectedDebtId.set(null);
    this.debts.set([]);
    this.transactionForm.reset({
      transactionDate: this.today(),
      description: '',
      note: '',
      amount: null,
      direction: 'salida',
    });
  }

  private today(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private currentMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private loadDebts(): void {
    if (this.debts().length || this.isLoadingDebts()) {
      return;
    }

    this.isLoadingDebts.set(true);
    this.debtApi
      .getAll()
      .pipe(finalize(() => this.isLoadingDebts.set(false)))
      .subscribe({
        next: ({ debts }) => {
          this.debts.set(debts.filter((debt) => debt.status === 'active'));
        },
        error: () => {
          this.modalError.set('No fue posible consultar tus deudas activas.');
        },
      });
  }

  private loadRegisteredDebtCount(): void {
    this.debtApi.getAll().subscribe({
      next: ({ debts }) => this.registeredDebtCount.set(debts.length),
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  private modalErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No fue posible conectar con el servidor.';
    }
    if (typeof error.error?.detail === 'string') {
      return error.error.detail;
    }

    const response = error.error;
    if (response && typeof response === 'object') {
      const messages = Object.values(response as Record<string, unknown>).flatMap(
        (value) => (Array.isArray(value) ? value : [value]),
      );
      const firstMessage = messages.find((value) => typeof value === 'string');
      if (typeof firstMessage === 'string') {
        return firstMessage;
      }
    }

    return 'No fue posible completar el movimiento.';
  }

  private debtErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No fue posible conectar con el servidor.';
    }
    if (typeof error.error?.detail === 'string') {
      return error.error.detail;
    }

    const response = error.error;
    if (response && typeof response === 'object') {
      const messages = Object.values(response as Record<string, unknown>).flatMap(
        (value) => (Array.isArray(value) ? value : [value]),
      );
      const firstMessage = messages.find((value) => typeof value === 'string');
      if (typeof firstMessage === 'string') {
        return firstMessage;
      }
    }

    return 'No fue posible registrar el crédito.';
  }
}
