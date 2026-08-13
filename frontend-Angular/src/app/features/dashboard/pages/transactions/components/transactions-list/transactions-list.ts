import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type IconName } from '@shared/icons/iconsFinCoach';

interface TransactionListRow {
  raw: unknown;
  id: number;
  description: string;
  statusLabel: string;
  canClassifyWithIA: boolean;
  canReviewClassification: boolean;
  category: string;
  directionLabel: string;
  isEntrada: boolean;
  amountLabel: string;
  confidence: number | null;
  dateLabel: string;
  iconName: IconName;
  iconGlyph: string;
}

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-list.html',
})
export class TransactionsListComponent {
  @Input() isLoading = false;
  @Input() filteredCount = 0;
  @Input() rows: TransactionListRow[] = [];
  @Input() selectedCategoryFilter = 'Todas';
  @Input() selectedType = 'Todos';
  @Input() selectedValueOrder: 'desc' | 'asc' = 'desc';
  @Input() selectedDateOrder: 'desc' | 'asc' = 'desc';
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() pageNumbers: number[] = [];

  @Output() categoryFilterChange = new EventEmitter<string>();
  @Output() typeFilterChange = new EventEmitter<'Todos' | 'entrada' | 'salida'>();
  @Output() valueOrderChange = new EventEmitter<'desc' | 'asc'>();
  @Output() dateOrderChange = new EventEmitter<'desc' | 'asc'>();
  @Output() classify = new EventEmitter<unknown>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() goToPage = new EventEmitter<number>();

  iconPath(name: string): string {
    const paths: Record<string, string> = {
      chevron_left: 'm15 18-6-6 6-6',
      chevron_right: 'm9 18 6-6-6-6',
    };
    return paths[name] ?? '';
  }

  movementGlyph(row: TransactionListRow): string {
    const category = this.normalize(row.category);
    const description = this.normalize(row.description);

    if (category.includes('ALIMENT') || description.includes('SUPERMERC') || description.includes('MERCADO')) return '🍴';
    if (category.includes('TRANSP') || description.includes('TAXI') || description.includes('BUS')) return '🚌';
    if (category.includes('SALUD') || description.includes('CONSULTA') || description.includes('MEDIC')) return '💊';
    if (category.includes('ENTRETEN') || category.includes('OCIO')) return '🎮';
    if (category.includes('EDUC')) return '📚';
    if (category.includes('HOGAR')) return '🏠';
    if (category.includes('SERVIC')) return '💡';
    if (category.includes('COMPRA')) return '🛍️';
    if (category.includes('SALARIO')) return '💼';
    if (category.includes('FREELANCE')) return '💻';
    if (category.includes('BONO')) return '🎁';
    if (category.includes('VENTA')) return '🛒';
    if (category.includes('INVERSION')) return '📈';
    if (category.includes('INTERES')) return '🏦';
    if (category.includes('REGALO')) return '🎉';
    return '💰';
  }

  private normalize(value: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

}
