import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CreditRequestsService } from './credit-requests.service';
import { environment } from '../../environments/environment';
import type { CreditRequest } from '../core/models/credit-request.model';

const BASE_URL = `${environment.apiUrl}/credit-requests`;

const mockRequest: CreditRequest = {
  id: 1,
  cedula: '8-123-456',
  amount: 5000,
  termMonths: 12,
  status: 'pending',
  comment: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('CreditRequestsService', () => {
  let service: CreditRequestsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CreditRequestsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() without status should GET without query params', () => {
    service.getAll().subscribe((list) => {
      expect(list).toEqual([mockRequest]);
    });

    const req = httpMock.expectOne((r) => r.url === BASE_URL && !r.params.has('status'));
    expect(req.request.method).toBe('GET');
    req.flush([mockRequest]);
  });

  it('getAll() with status should GET with status query param', () => {
    service.getAll('pending').subscribe();

    const req = httpMock.expectOne((r) => r.url === BASE_URL && r.params.get('status') === 'pending');
    expect(req.request.method).toBe('GET');
    req.flush([mockRequest]);
  });

  it('getAll() with approved status should include status=approved', () => {
    service.getAll('approved').subscribe();

    const req = httpMock.expectOne((r) => r.params.get('status') === 'approved');
    req.flush([]);
  });

  it('create() should POST the payload', () => {
    const payload = { cedula: '8-123-456', amount: 5000, termMonths: 12 };
    service.create(payload).subscribe((result) => {
      expect(result).toEqual(mockRequest);
    });

    const req = httpMock.expectOne(BASE_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockRequest);
  });

  it('updateStatus() should PATCH the correct endpoint', () => {
    const payload = { status: 'approved' as const };
    service.updateStatus(1, payload).subscribe((result) => {
      expect(result.status).toBe('approved');
    });

    const req = httpMock.expectOne(`${BASE_URL}/1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...mockRequest, status: 'approved' });
  });

  it('updateStatus() with rejected and comment should send comment', () => {
    const payload = { status: 'rejected' as const, comment: 'Motivo de rechazo' };
    service.updateStatus(2, payload).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/2/status`);
    expect(req.request.body).toEqual(payload);
    req.flush({ ...mockRequest, id: 2, status: 'rejected', comment: 'Motivo de rechazo' });
  });
});
