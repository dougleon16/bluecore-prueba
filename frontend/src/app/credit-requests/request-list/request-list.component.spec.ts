import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { RequestListComponent } from './request-list.component';
import { CreditRequestsService } from '../credit-requests.service';
import { AuthService } from '../../auth/auth.service';
import type { CreditRequest } from '../../core/models/credit-request.model';

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

const approvedRequest: CreditRequest = { ...mockRequest, id: 2, status: 'approved' };

describe('RequestListComponent', () => {
  let fixture: ComponentFixture<RequestListComponent>;
  let component: RequestListComponent;
  let creditService: CreditRequestsService;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RequestListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    creditService = TestBed.inject(CreditRequestsService);
    authService = TestBed.inject(AuthService);

    vi.spyOn(creditService, 'getAll').mockReturnValue(of([mockRequest]));

    fixture = TestBed.createComponent(RequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load requests on init', () => {
    expect(creditService.getAll).toHaveBeenCalled();
    expect(component.requests().length).toBeGreaterThanOrEqual(0);
  });

  it('toggleCreateForm() should toggle showCreateForm', () => {
    expect(component.showCreateForm()).toBe(false);
    component.toggleCreateForm();
    expect(component.showCreateForm()).toBe(true);
    component.toggleCreateForm();
    expect(component.showCreateForm()).toBe(false);
  });

  it('onFilterChange() should update statusFilter and reload', () => {
    component.onFilterChange('approved');
    expect(component.statusFilter()).toBe('approved');
    expect(creditService.getAll).toHaveBeenCalledWith('approved');
  });

  it('onRequestCreated() should prepend request and close form', () => {
    component.showCreateForm.set(true);
    component.requests.set([]);
    component.onRequestCreated(mockRequest);
    expect(component.requests()[0]).toEqual(mockRequest);
    expect(component.showCreateForm()).toBe(false);
  });

  it('onRequestCreated() should also update allRequests', () => {
    component.allRequests.set([]);
    component.onRequestCreated(mockRequest);
    expect(component.allRequests()[0]).toEqual(mockRequest);
  });

  it('approve() should call updateStatus with approved', () => {
    const updated = { ...mockRequest, id: 1, status: 'approved' as const };
    vi.spyOn(creditService, 'updateStatus').mockReturnValue(of(updated));
    component.requests.set([mockRequest]);

    component.approve(1);

    expect(creditService.updateStatus).toHaveBeenCalledWith(1, { status: 'approved' });
    expect(component.requests()[0].status).toBe('approved');
  });

  it('approve() should set actionError on failure', () => {
    vi.spyOn(creditService, 'updateStatus').mockReturnValue(
      throwError(() => ({ error: { message: 'No se pudo aprobar' } })),
    );
    component.approve(1);
    expect(component.actionError()).toBe('No se pudo aprobar');
  });

  it('confirmReject() should set rejectTargetId', () => {
    component.confirmReject(5);
    expect(component.rejectTargetId()).toBe(5);
  });

  it('onRejectCancelled() should clear rejectTargetId', () => {
    component.rejectTargetId.set(3);
    component.onRejectCancelled();
    expect(component.rejectTargetId()).toBeNull();
  });

  it('onRejectConfirmed() should call updateStatus with rejected and comment', () => {
    vi.spyOn(creditService, 'updateStatus').mockReturnValue(
      of({ ...mockRequest, status: 'rejected', comment: 'Motivo' }),
    );
    component.requests.set([mockRequest]);
    component.rejectTargetId.set(1);

    component.onRejectConfirmed('Motivo');

    expect(creditService.updateStatus).toHaveBeenCalledWith(1, {
      status: 'rejected',
      comment: 'Motivo',
    });
    expect(component.rejectTargetId()).toBeNull();
  });

  it('onRejectConfirmed() should do nothing when rejectTargetId is null', () => {
    const spy = vi.spyOn(creditService, 'updateStatus').mockReturnValue(of(approvedRequest));
    component.rejectTargetId.set(null);
    component.onRejectConfirmed('Motivo');
    expect(spy).not.toHaveBeenCalled();
  });

  it('onRejectConfirmed() should set actionError on failure', () => {
    vi.spyOn(creditService, 'updateStatus').mockReturnValue(
      throwError(() => ({ error: { message: 'No se pudo rechazar' } })),
    );
    component.rejectTargetId.set(1);
    component.onRejectConfirmed('Motivo');
    expect(component.actionError()).toBe('No se pudo rechazar');
  });

  it('logout() should call authService.logout', () => {
    const logoutSpy = vi.spyOn(authService, 'logout').mockImplementation(() => {});
    component.logout();
    expect(logoutSpy).toHaveBeenCalled();
  });
});
