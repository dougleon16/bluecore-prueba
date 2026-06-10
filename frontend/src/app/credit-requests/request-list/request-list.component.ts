import { Component, OnInit, inject, signal } from '@angular/core';
import { CreditRequestsService } from '../credit-requests.service';
import { AuthService } from '../../auth/auth.service';
import { AppHeaderComponent } from '../../shared/app-header/app-header.component';
import { RequestStatsComponent } from '../request-stats/request-stats.component';
import { RequestTableComponent } from '../request-table/request-table.component';
import { CreateFormComponent } from '../create-form/create-form.component';
import type { CreditRequest, RequestStatus } from '../../core/models/credit-request.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [AppHeaderComponent, RequestStatsComponent, RequestTableComponent, CreateFormComponent],
  templateUrl: './request-list.component.html',
})
export class RequestListComponent implements OnInit {
  private readonly creditRequestsService = inject(CreditRequestsService);
  private readonly authService = inject(AuthService);

  readonly statusFilter = signal<RequestStatus | undefined>(undefined);
  readonly loading = signal(false);
  readonly requests = signal<CreditRequest[]>([]);
  readonly actionError = signal<string | null>(null);
  readonly showCreateForm = signal(false);

  readonly currentUser = this.authService.getProfile();

  ngOnInit(): void {
    this.loadRequests();
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
  }

  onFilterChange(status: RequestStatus | undefined): void {
    this.statusFilter.set(status);
    this.loadRequests();
  }

  onRequestCreated(request: CreditRequest): void {
    this.requests.update((list) => [request, ...list]);
    this.showCreateForm.set(false);
  }

  approve(id: number): void {
    this.actionError.set(null);
    this.creditRequestsService.updateStatus(id, { status: 'approved' }).subscribe({
      next: (updated) => this.replaceInList(updated),
      error: (err: { error?: { message?: string } }) => {
        this.actionError.set(err.error?.message ?? 'No se pudo aprobar la solicitud.');
      },
    });
  }

  confirmReject(id: number): void {
    const comment = window.prompt('Motivo de rechazo:');
    if (comment === null) return;
    this.actionError.set(null);
    this.creditRequestsService.updateStatus(id, { status: 'rejected', comment }).subscribe({
      next: (updated) => this.replaceInList(updated),
      error: (err: { error?: { message?: string } }) => {
        this.actionError.set(err.error?.message ?? 'No se pudo rechazar la solicitud.');
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private loadRequests(): void {
    this.loading.set(true);
    this.creditRequestsService.getAll(this.statusFilter()).subscribe({
      next: (list) => {
        this.requests.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private replaceInList(updated: CreditRequest): void {
    this.requests.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
  }
}
