import { Component, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import type { CreditRequest } from '../../core/models/credit-request.model';

@Component({
  selector: 'li[app-request-row]',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './request-row.component.html',
  host: { class: 'px-6 py-4 grid grid-cols-1 md:grid-cols-12 md:items-center gap-y-3 gap-x-4 hover:bg-muted/30 transition' },
})
export class RequestRowComponent {
  readonly request = input.required<CreditRequest>();
  readonly approve = output<number>();
  readonly reject = output<number>();
}
