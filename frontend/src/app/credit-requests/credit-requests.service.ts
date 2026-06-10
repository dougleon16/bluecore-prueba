import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  CreditRequest,
  CreateCreditRequestPayload,
  UpdateStatusPayload,
  RequestStatus,
} from '../core/models/credit-request.model';

@Injectable({ providedIn: 'root' })
export class CreditRequestsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/credit-requests`;

  getAll(status?: RequestStatus): Observable<CreditRequest[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<CreditRequest[]>(this.baseUrl, { params });
  }

  create(payload: CreateCreditRequestPayload): Observable<CreditRequest> {
    return this.http.post<CreditRequest>(this.baseUrl, payload);
  }

  updateStatus(id: number, payload: UpdateStatusPayload): Observable<CreditRequest> {
    return this.http.patch<CreditRequest>(`${this.baseUrl}/${id}/status`, payload);
  }
}
