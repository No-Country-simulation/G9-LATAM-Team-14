import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthService } from '@app/core/auth/services/auth.service';
import { DebtService } from '@app/core/debts/services/debt.service';
import { Debt } from '@app/core/debts/models/debt.model';

type MovementDirection = 'entrada' | 'salida';
type ModalStep =
  | 'form'
  | 'classifying'
  | 'classification-error'
  | 'confirmation'
  | 'saving'
  | 'success';

interface CategoryPercentage {
  category: string;
  percentage: number;
}

interface ModelSuggestionCompat {
  category?: string;
  category_confidence_percentage?: number | null;
  alternative_categories?: CategoryPercentage[];
  purpose?: string | null;
  regularity?: string | null;
  model_requires_review?: boolean | null;
  regularity_confidence_percentage?: number | null;
  regularity_requires_review?: boolean | null;
  category_requires_review?: boolean | null;
}

interface FinancialTransaction {
  id: number;
  transactionDate?: string;
  transaction_date?: string;
  description: string;
  note?: string | null;
  amount: number;
  direction: MovementDirection | string;
  status?: string | null;
  modelCategory?: string | null;
  modelCategoryConfidencePercentage?: number | null;
  modelTopCategories?: CategoryPercentage[] | null;
  modelPurpose?: string | null;
  modelRegularity?: string | null;
  modelRegularityConfidencePercentage?: number | null;
  modelRequiresConfirmation?: boolean | null;
  currentCategories?: CategoryPercentage[] | null;
  currentPurpose?: string | null;
  currentRegularity?: string | null;
  model_suggestion?: ModelSuggestionCompat | null;
}

interface ConfirmTransactionRequest {
  category: string;
  purpose: string;
  regularity: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transactions.html',
})
export class Transactions {
  private readonly http = inject(HttpClient);
  private readonly debtService = inject(DebtService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/transactions`;
  private readonly pageSize = 7;

  private readonly currencyFormatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 2,
  });

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly transactions = signal<FinancialTransaction[]>([]);

  readonly searchTerm = signal('');
  readonly selectedType = signal<'Todos' | MovementDirection>('Todos');
  readonly selectedCategoryFilter = signal('Todas');
  readonly selectedValueOrder = signal<'desc' | 'asc'>('desc');
  readonly selectedDateOrder = signal<'desc' | 'asc'>('desc');
  readonly showDateRangePicker = signal(false);
  readonly startDateFilter = signal<string | null>(null);
  readonly endDateFilter = signal<string | null>(null);
  readonly tempStartDateFilter = signal<string | null>(null);
  readonly tempEndDateFilter = signal<string | null>(null);
  readonly selectedMonth = signal(this.currentMonthKey());
  readonly currentPage = signal(1);

  readonly showNewMovementModal = signal(false);
  readonly modalStep = signal<ModalStep>('form');
  readonly modalError = signal('');
  readonly createdTransaction = signal<FinancialTransaction | null>(null);
  readonly classification = signal<FinancialTransaction | null>(null);
  readonly confirmation = signal<FinancialTransaction | null>(null);
  readonly selectedCategory = signal('');
  readonly selectedPurpose = signal('');
  readonly selectedRegularity = signal('');
  readonly selectedDebtId = signal<number | null>(null);
  readonly debts = signal<Debt[]>([]);
  readonly isLoadingDebts = signal(false);

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
    direction: new FormControl<MovementDirection>('salida', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly totalItems = computed(() => this.monthFilteredTransactions().length);

  readonly availableCategories = computed(() => {
    const categories = new Set<string>();
    for (const item of this.monthFilteredTransactions()) {
      categories.add(this.category(item));
    }
    return [...categories].filter(Boolean).sort((a, b) => a.localeCompare(b));
  });

  readonly monthFilteredTransactions = computed(() => {
    return this.transactions();
  });

  readonly filteredTransactions = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const type = this.selectedType();
    const selectedCategory = this.selectedCategoryFilter();
    const valueOrder = this.selectedValueOrder();
    const dateOrder = this.selectedDateOrder();

    const filtered = this.monthFilteredTransactions().filter((item) => {
      const itemType = this.normalizedDirection(item.direction);
      const itemCategory = this.category(item);
      const matchesType = type === 'Todos' || itemType === type;
      const matchesCategory = selectedCategory === 'Todas' || itemCategory === selectedCategory;
      const matchesSearch = !search
        || item.description.toLowerCase().includes(search)
        || itemCategory.toLowerCase().includes(search);
      const txDate = this.transactionDate(item);
      const start = this.startDateFilter();
      const end = this.endDateFilter();
      const matchesStart = !start || txDate >= start;
      const matchesEnd = !end || txDate <= end;

      return matchesType && matchesCategory && matchesSearch && matchesStart && matchesEnd;
    });

    return [...filtered].sort((first, second) => {
      const amountDiff = Number(first.amount || 0) - Number(second.amount || 0);
      if (amountDiff !== 0) {
        return valueOrder === 'desc' ? -amountDiff : amountDiff;
      }

      const firstDate = this.transactionDate(first);
      const secondDate = this.transactionDate(second);
      const dateDiff = secondDate.localeCompare(firstDate);
      return dateOrder === 'desc' ? dateDiff : -dateDiff;
    });
  });

  readonly totalPages = computed(() => {
    const pages = Math.ceil(this.filteredTransactions().length / this.pageSize);
    return pages > 0 ? pages : 1;
  });

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  readonly paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredTransactions().slice(start, start + this.pageSize);
  });

  readonly classificationOptions = computed<CategoryPercentage[]>(() => {
    const tx = this.classification();
    if (!tx) return [];

    const options: CategoryPercentage[] = [];
    const category = this.modelCategory(tx);
    if (category) {
      options.push({
        category,
        percentage: Number(this.modelConfidence(tx) ?? 0),
      });
    }
    for (const option of this.modelTopCategories(tx)) {
      options.push(option);
    }

    return options.filter(
      (option, index) => options.findIndex((entry) => entry.category === option.category) === index,
    );
  });

  constructor() {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http
      .get<FinancialTransaction[]>(this.apiUrl, { withCredentials: true })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (transactions) => {
          const sorted = [...(transactions ?? [])].sort((a, b) =>
            this.transactionDate(b).localeCompare(this.transactionDate(a)),
          );
          this.transactions.set(sorted);
          this.clampCurrentPage();
        },
        error: (error: HttpErrorResponse) => {
          this.transactions.set([]);
          if (error.status === 401) {
            this.router.navigate(['/login']);
            return;
          }
          this.errorMessage.set(this.modalErrorMessage(error));
        },
      });
  }

  openNewMovement(): void {
    this.resetModal();
    this.showNewMovementModal.set(true);
  }

  closeNewMovement(): void {
    if (!this.canCloseModal()) return;
    this.showNewMovementModal.set(false);
  }

  canCloseModal(): boolean {
    return this.modalStep() === 'form'
      || this.modalStep() === 'success'
      || this.modalStep() === 'confirmation'
      || this.modalStep() === 'classification-error';
  }

  registerMovement(): void {
    this.transactionForm.markAllAsTouched();
    if (this.transactionForm.invalid || this.modalStep() !== 'form') return;

    const value = this.transactionForm.getRawValue();
    this.modalStep.set('classifying');
    this.modalError.set('');

    this.http
      .post<FinancialTransaction>(
        this.apiUrl,
        {
          transactionDate: value.transactionDate,
          description: value.description.trim(),
          note: value.note.trim() || undefined,
          amount: Number(value.amount),
          direction: value.direction,
        },
        { withCredentials: true },
      )
      .subscribe({
        next: (response) => {
          this.createdTransaction.set(response);
          this.classifyMovement(response.id);
        },
        error: (error: HttpErrorResponse) => {
          this.modalStep.set('form');
          this.modalError.set(this.modalErrorMessage(error));
        },
      });
  }

  classifyFromTable(transaction: FinancialTransaction): void {
    const status = this.normalizedStatus(transaction.status);
    if (status !== 'pending_classification' && status !== 'awaiting_confirmation') return;

    this.showNewMovementModal.set(true);
    this.successMessage.set('');
    this.modalError.set('');
    this.createdTransaction.set(transaction);

    if (status === 'pending_classification') {
      this.classifyMovement(transaction.id);
      return;
    }

    this.classification.set(transaction);
    this.selectedCategory.set(this.suggestedCategory(transaction) || this.category(transaction));
    this.selectedPurpose.set(this.suggestedPurpose(transaction) || 'consumo_personal');
    this.selectedRegularity.set(this.suggestedRegularity(transaction) || 'variable');
    this.modalStep.set('confirmation');
    if (this.isDebtCategory(this.selectedCategory())) {
      this.loadDebts();
    }
  }

  retryClassification(): void {
    const txId = this.createdTransaction()?.id;
    if (!txId) return;
    this.classifyMovement(txId);
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
    this.selectedDebtId.set(null);
    if (this.isDebtCategory(category)) {
      this.loadDebts();
    }
  }

  selectDebt(value: string): void {
    this.selectedDebtId.set(value ? Number(value) : null);
  }

  selectRegularity(regularity: string): void {
    this.selectedRegularity.set(regularity);
  }

  setPurpose(value: string): void {
    this.selectedPurpose.set(value);
  }

  canClassifyWithIA(transaction: FinancialTransaction): boolean {
    return this.normalizedStatus(transaction.status) === 'pending_classification';
  }

  canReviewClassification(transaction: FinancialTransaction): boolean {
    return this.normalizedStatus(transaction.status) === 'awaiting_confirmation';
  }

  regularityConfidence(transaction: FinancialTransaction): number | null {
    if (transaction.modelRegularityConfidencePercentage != null) {
      return Number(transaction.modelRegularityConfidencePercentage);
    }
    const value = transaction.model_suggestion?.regularity_confidence_percentage;
    return value == null ? null : Number(value);
  }

  requiresReview(transaction: FinancialTransaction): boolean | null {
    if (transaction.modelRequiresConfirmation != null) {
      return Boolean(transaction.modelRequiresConfirmation);
    }
    if (transaction.model_suggestion?.model_requires_review != null) {
      return Boolean(transaction.model_suggestion.model_requires_review);
    }
    return null;
  }

  suggestedCategory(transaction: FinancialTransaction): string | null {
    return transaction.modelCategory
      ?? transaction.model_suggestion?.category
      ?? null;
  }

  suggestedPurpose(transaction: FinancialTransaction): string | null {
    return transaction.modelPurpose
      ?? transaction.model_suggestion?.purpose
      ?? null;
  }

  suggestedRegularity(transaction: FinancialTransaction): string | null {
    const value =
      transaction.modelRegularity
      ?? transaction.model_suggestion?.regularity
      ?? null;
    return value ? value.toLowerCase() : null;
  }

  confirmClassification(): void {
    const tx = this.classification();
    const category = this.selectedCategory().trim();
    const purpose = this.selectedPurpose().trim();
    const regularity = this.selectedRegularity().trim();

    if (!tx || !category || !purpose || !regularity) {
      this.modalError.set('Selecciona categoría, propósito y regularidad para confirmar.');
      return;
    }

    this.modalStep.set('saving');
    this.modalError.set('');

    const payload: ConfirmTransactionRequest = {
      category,
      purpose,
      regularity,
    };

    this.http
      .post<FinancialTransaction>(`${this.apiUrl}/${tx.id}/confirm`, payload, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.confirmation.set(response);
          this.successMessage.set('Clasificación confirmada correctamente.');
          this.showNewMovementModal.set(false);
          this.modalStep.set('success');
          this.resetModal();
          this.loadTransactions();
        },
        error: (error: HttpErrorResponse) => {
          this.modalStep.set('confirmation');
          this.modalError.set(this.modalErrorMessage(error));
        },
      });
  }

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  setTypeFilter(value: 'Todos' | MovementDirection): void {
    this.selectedType.set(value);
    this.currentPage.set(1);
  }

  setCategoryFilter(value: string): void {
    this.selectedCategoryFilter.set(value);
    this.currentPage.set(1);
  }

  setValueOrder(value: 'desc' | 'asc'): void {
    this.selectedValueOrder.set(value);
    this.currentPage.set(1);
  }

  setDateOrder(value: 'desc' | 'asc'): void {
    this.selectedDateOrder.set(value);
    this.currentPage.set(1);
  }

  toggleDateRangePicker(): void {
    const opening = !this.showDateRangePicker();
    this.showDateRangePicker.set(opening);
    if (opening) {
      this.tempStartDateFilter.set(this.startDateFilter());
      this.tempEndDateFilter.set(this.endDateFilter());
    }
  }

  applyDateRange(): void {
    const start = this.tempStartDateFilter();
    const end = this.tempEndDateFilter();

    if (start && end && start > end) {
      this.startDateFilter.set(end);
      this.endDateFilter.set(start);
    } else {
      this.startDateFilter.set(start);
      this.endDateFilter.set(end);
    }

    this.currentPage.set(1);
    this.showDateRangePicker.set(false);
  }

  cancelDateRange(): void {
    this.tempStartDateFilter.set(this.startDateFilter());
    this.tempEndDateFilter.set(this.endDateFilter());
    this.showDateRangePicker.set(false);
  }

  clearDateRange(): void {
    this.tempStartDateFilter.set(null);
    this.tempEndDateFilter.set(null);
  }

  dateRangeLabel(): string {
    const start = this.startDateFilter();
    const end = this.endDateFilter();
    if (!start && !end) return this.monthRangeLabel();
    if (start && end) {
      return `${this.shortDateFromIso(start)} - ${this.shortDateFromIso(end)}`;
    }
    if (start) return `${this.shortDateFromIso(start)} - ...`;
    return `... - ${this.shortDateFromIso(end!)}`;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  category(transaction: FinancialTransaction): string {
    const currentCategory = transaction.currentCategories?.[0]?.category;
    if (currentCategory) return currentCategory;
    const modelCategory = this.modelCategory(transaction);
    return modelCategory || 'Sin clasificar';
  }

  categoryTotal(targetCategory: string): number {
    return this.monthFilteredTransactions()
      .filter((item) => this.stitchCategory(item) === targetCategory && this.normalizedDirection(item.direction) === 'salida')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }

  categoryProgress(targetCategory: string): number {
    const categories = ['Alimentación', 'Transporte', 'Servicios', 'Ocio'];
    const totals = categories.map((category) => this.categoryTotal(category));
    const max = Math.max(...totals, 1);
    const value = this.categoryTotal(targetCategory);
    return value > 0 ? Math.max(10, Math.round((value / max) * 100)) : 0;
  }

  transactionIcon(transaction: FinancialTransaction): string {
    const type = this.normalizedDirection(transaction.direction);
    if (type === 'entrada') return 'payments';
    const category = this.category(transaction).toLowerCase();
    if (category.includes('aliment')) return 'shopping_cart';
    if (category.includes('transport')) return 'directions_car';
    if (category.includes('servic')) return 'bolt';
    if (category.includes('ocio')) return 'sports_esports';
    if (category.includes('salud')) return 'medical_services';
    return 'payments';
  }

  formatAmount(transaction: FinancialTransaction): string {
    const value = this.currencyFormatter.format(Number(transaction.amount || 0));
    return this.normalizedDirection(transaction.direction) === 'entrada' ? `+ ${value}` : `− ${value}`;
  }

  formatCurrency(value: number): string {
    return this.currencyFormatter.format(Number(value || 0));
  }

  formatDate(value: string): string {
    if (!value) return '—';
    const parts = value.split('-').map((part) => Number(part));
    if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return value;
    return this.dateFormatter(new Date(parts[0], parts[1] - 1, parts[2]));
  }

  readableValue(value: string | null | undefined): string {
    if (!value) return '—';
    const readable = value.split('_').join(' ');
    return readable.charAt(0).toUpperCase() + readable.slice(1);
  }

  confidence(transaction: FinancialTransaction): number | null {
    const value = this.modelConfidence(transaction);
    return value == null ? null : Math.max(0, Math.min(100, Math.round(value)));
  }

  statusLabel(transaction: FinancialTransaction): string {
    const status = this.normalizedStatus(transaction.status);
    if (status === 'pending_classification') return 'Pendiente de clasificación';
    if (status === 'awaiting_confirmation') return 'Requiere confirmación IA';
    return 'Confirmada';
  }

  exportTransactions(): void {
    const data = this.filteredTransactions();
    if (!data.length) return;

    const rows = data.map((transaction) =>
      [
        transaction.description,
        this.category(transaction),
        this.normalizedDirection(transaction.direction) === 'entrada' ? 'Ingreso' : 'Gasto',
        this.formatAmount(transaction),
        this.confidence(transaction) == null ? '—' : `${this.confidence(transaction)}%`,
        this.formatDate(this.transactionDate(transaction)),
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','),
    );
    const csv = ['Descripcion,Categoria,Tipo,Valor,Confianza,Fecha', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `transacciones-${this.selectedMonth()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  monthRangeLabel(): string {
    const [year, month] = this.selectedMonth().split('-').map((part) => Number(part));
    if (!year || !month) return '—';
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    return `${this.shortDate(firstDay)} - ${this.shortDate(lastDay)}`;
  }

  iconPath(name: string): string {
    const paths: Record<string, string> = {
      add: 'M12 5v14M5 12h14',
      download: 'M12 3v12m0 0 4-4m-4 4-4-4M4 20h16',
      calendar_today: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
      chevron_left: 'm15 18-6-6 6-6',
      chevron_right: 'm9 18 6-6-6-6',
      search: 'm21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z',
      close: 'M18 6 6 18M6 6l12 12',
      warning: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4m0 4h.01',
      check_circle: 'M9 12l2 2 4-4M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
      restaurant: 'M4 3v7a4 4 0 0 0 4 4v7M8 3v11M12 3v11M16 3h1a3 3 0 0 1 3 3v15',
      directions_car: 'M5 11h14l-1.5-4.5A3 3 0 0 0 14.65 4h-5.3a3 3 0 0 0-2.85 2.5L5 11Zm0 0v5h2m12-5v5h-2M7 16a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
      bolt: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
      sports_esports: 'M5 8h14a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-2l-3 3-3-3H5a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3Zm3 4h2m4 0h2',
      shopping_cart: 'M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H7M10 20a1 1 0 1 0 0 .01M17 20a1 1 0 1 0 0 .01',
      payments: 'M3 7h18v10H3V7Zm2 2v6h14V9H5Zm8 1h4v2h-4v-2Z',
      medical_services: 'M12 21a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1-11v2H9v2h2v2h2v-2h2v-2h-2v-2h-2Z',
    };
    return paths[name] ?? paths['payments'];
  }

  private classifyMovement(transactionId: number): void {
    this.modalStep.set('classifying');
    this.modalError.set('');

    this.http
      .post<FinancialTransaction>(`${this.apiUrl}/${transactionId}/classify`, null, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.classification.set(response);
          this.selectedCategory.set(this.suggestedCategory(response) || this.category(response));
          this.selectedPurpose.set(this.suggestedPurpose(response) || 'consumo_personal');
          this.selectedRegularity.set(this.suggestedRegularity(response) || 'variable');
          this.modalStep.set('confirmation');
          if (this.isDebtCategory(this.selectedCategory())) {
            this.loadDebts();
          }
          this.loadTransactions();
        },
        error: (error: HttpErrorResponse) => {
          this.modalStep.set('classification-error');
          this.modalError.set(this.modalErrorMessage(error));
        },
      });
  }

  private loadDebts(): void {
    if (this.isLoadingDebts()) return;
    this.isLoadingDebts.set(true);
    const userId = this.authService.currentUser()?.id || 1;
    this.debtService
      .getDebts('ACTIVE', userId)
      .pipe(finalize(() => this.isLoadingDebts.set(false)))
      .subscribe({
        next: (debts) => this.debts.set(debts ?? []),
        error: () => this.modalError.set('No fue posible consultar deudas activas.'),
      });
  }

  private resetModal(): void {
    this.modalStep.set('form');
    this.modalError.set('');
    this.createdTransaction.set(null);
    this.classification.set(null);
    this.confirmation.set(null);
    this.selectedCategory.set('');
    this.selectedPurpose.set('');
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

  private clampCurrentPage(): void {
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }
  }

  private modelCategory(transaction: FinancialTransaction | null): string | null {
    if (!transaction) return null;
    return transaction.modelCategory
      ?? transaction.model_suggestion?.category
      ?? null;
  }

  private modelConfidence(transaction: FinancialTransaction | null): number | null {
    if (!transaction) return null;
    if (transaction.modelCategoryConfidencePercentage != null) {
      return Number(transaction.modelCategoryConfidencePercentage);
    }
    return transaction.model_suggestion?.category_confidence_percentage ?? null;
  }

  private modelTopCategories(transaction: FinancialTransaction | null): CategoryPercentage[] {
    if (!transaction) return [];
    if (transaction.modelTopCategories?.length) return transaction.modelTopCategories;
    return transaction.model_suggestion?.alternative_categories ?? [];
  }

  private modelPurpose(transaction: FinancialTransaction | null): string | null {
    if (!transaction) return null;
    return transaction.currentPurpose ?? transaction.modelPurpose ?? transaction.model_suggestion?.purpose ?? null;
  }

  private modelRegularity(transaction: FinancialTransaction | null): string | null {
    if (!transaction) return null;
    const value =
      transaction.currentRegularity
      ?? transaction.modelRegularity
      ?? transaction.model_suggestion?.regularity
      ?? null;
    return value ? value.toLowerCase() : null;
  }

  private normalizedDirection(direction: string): MovementDirection {
    return direction?.toLowerCase() === 'entrada' ? 'entrada' : 'salida';
  }

  private normalizedStatus(status?: unknown): string {
    if (status == null) return '';

    let raw = '';
    if (typeof status === 'object') {
      const record = status as Record<string, unknown>;
      if (typeof record['value'] === 'string') {
        raw = record['value'];
      } else if (typeof record['name'] === 'string') {
        raw = record['name'];
      } else {
        raw = String(status);
      }
    } else {
      raw = String(status);
    }

    const normalized = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (normalized.includes('pending') && normalized.includes('classification')) {
      return 'pending_classification';
    }
    if (normalized.includes('awaiting') && normalized.includes('confirmation')) {
      return 'awaiting_confirmation';
    }
    if (normalized.includes('confirm')) {
      return 'confirmed';
    }
    return normalized;
  }

  private isDebtCategory(category: string): boolean {
    const value = category.toLowerCase();
    return value.includes('deuda') || value.includes('financi');
  }

  private monthKeyFromDate(value: string): string | null {
    if (!value || value.length < 7) return null;
    return value.slice(0, 7);
  }

  private transactionDate(transaction: FinancialTransaction): string {
    return transaction.transactionDate || transaction.transaction_date || '';
  }

  private stitchCategory(transaction: FinancialTransaction): string {
    const category = this.category(transaction).toLowerCase();
    if (category.includes('aliment')) return 'Alimentación';
    if (category.includes('transport')) return 'Transporte';
    if (category.includes('servic')) return 'Servicios';
    if (category.includes('ocio')) return 'Ocio';
    return '';
  }

  private shortDate(date: Date): string {
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(date);
  }

  private shortDateFromIso(value: string): string {
    const [year, month, day] = value.split('-').map((part) => Number(part));
    if (!year || !month || !day) return value;
    return this.shortDate(new Date(year, month - 1, day));
  }

  private dateFormatter(date: Date): string {
    return this.dateFormatterIntl().format(date);
  }

  private dateFormatterIntl(): Intl.DateTimeFormat {
    return this.dateFormatterRef;
  }

  private readonly dateFormatterRef = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
  });

  private currentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private today(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }

  private modalErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Tu sesión expiró. Inicia sesión nuevamente.';
    }
    if (error.status === 400) {
      return 'Hay datos inválidos. Revisa los campos.';
    }
    if (error.status === 404) {
      return 'No se encontró la transacción solicitada.';
    }
    if (error.status === 409) {
      return 'La transacción no puede confirmarse en su estado actual.';
    }
    if (error.status === 503) {
      return 'El servicio de clasificación no está disponible por ahora.';
    }
    if (error.status === 0) {
      return 'No fue posible conectar con el servidor.';
    }
    if (typeof error.error?.detail === 'string') {
      return error.error.detail;
    }
    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }
    return 'No fue posible completar la operación.';
  }
}
