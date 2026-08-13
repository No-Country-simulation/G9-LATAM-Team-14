import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-transactions-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-header.html',
})
export class TransactionsHeaderComponent {
  @Input() totalItems = 0;
  @Input() searchTerm = '';
  @Input() dateRangeLabel = '';
  @Input() showDateRangePicker = false;
  @Input() tempStartDateFilter: string | null = null;
  @Input() tempEndDateFilter: string | null = null;

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() toggleDateRangePicker = new EventEmitter<void>();
  @Output() tempStartDateFilterChange = new EventEmitter<string | null>();
  @Output() tempEndDateFilterChange = new EventEmitter<string | null>();
  @Output() clearDateRange = new EventEmitter<void>();
  @Output() cancelDateRange = new EventEmitter<void>();
  @Output() applyDateRange = new EventEmitter<void>();
  @Output() exportTransactions = new EventEmitter<void>();

  iconPath(name: string): string {
    const paths: Record<string, string> = {
      search: 'm21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z',
      calendar_today: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
      download: 'M12 3v12m0 0 4-4m-4 4-4-4M4 20h16',
    };
    return paths[name] ?? '';
  }
}

