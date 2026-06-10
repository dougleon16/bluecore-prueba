import { Component, computed, input } from '@angular/core';
import type { CreditRequest } from '../../core/models/credit-request.model';

@Component({
  selector: 'app-request-stats',
  standalone: true,
  templateUrl: './request-stats.component.html',
})
export class RequestStatsComponent {
  readonly requests = input<CreditRequest[]>([]);

  readonly pendingCount = computed(
    () => this.requests().filter((r) => r.status === 'pending').length,
  );
  readonly approvedCount = computed(
    () => this.requests().filter((r) => r.status === 'approved').length,
  );
  readonly rejectedCount = computed(
    () => this.requests().filter((r) => r.status === 'rejected').length,
  );
}
