import { Component, input, output, signal, computed } from '@angular/core';
import { RequestRowComponent } from '../request-row/request-row.component';
import type { CreditRequest, RequestStatus } from '../../core/models/credit-request.model';

type FilterValue = RequestStatus | '';

@Component({
  selector: 'app-request-table',
  standalone: true,
  imports: [RequestRowComponent],
  templateUrl: './request-table.component.html',
})
export class RequestTableComponent {
  readonly requests = input<CreditRequest[]>([]);
  readonly loading = input(false);

  readonly filterChange = output<RequestStatus | undefined>();
  readonly approve = output<number>();
  readonly reject = output<number>();

  readonly activeFilter = signal<FilterValue>('');
  readonly searchTerm = signal('');

  readonly displayedRequests = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.requests();
    if (!term) return list;
    return list.filter(
      (r) =>
        r.cedula.toLowerCase().includes(term) || String(r.id).includes(term),
    );
  });

  readonly FILTERS: { label: string; value: FilterValue }[] = [
    { label: 'Todas', value: '' },
    { label: 'Pendientes', value: 'pending' },
    { label: 'Aprobadas', value: 'approved' },
    { label: 'Rechazadas', value: 'rejected' },
  ];

  setFilter(value: FilterValue): void {
    this.activeFilter.set(value);
    this.filterChange.emit(value === '' ? undefined : value);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}
