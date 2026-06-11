import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CreateFormComponent } from './create-form.component';
import { CreditRequestsService } from '../credit-requests.service';
import type { CreditRequest } from '../../core/models/credit-request.model';

const mockCreated: CreditRequest = {
  id: 1,
  cedula: '8-123-456',
  amount: 5000,
  termMonths: 12,
  status: 'pending',
  comment: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('CreateFormComponent', () => {
  let fixture: ComponentFixture<CreateFormComponent>;
  let component: CreateFormComponent;
  let service: CreditRequestsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateFormComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(CreditRequestsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('cedula should fail required validation when empty', () => {
    expect(component.form.get('cedula')!.hasError('required')).toBe(true);
  });

  it('cedula should fail pattern for invalid format', () => {
    component.form.get('cedula')!.setValue('invalid-cedula');
    expect(component.form.get('cedula')!.hasError('pattern')).toBe(true);
  });

  it('cedula should pass validation for 8-123-456', () => {
    component.form.get('cedula')!.setValue('8-123-456');
    expect(component.form.get('cedula')!.valid).toBe(true);
  });

  it('cedula should pass validation for PE-5-687 (uppercase)', () => {
    component.form.get('cedula')!.setValue('PE-5-687');
    expect(component.form.get('cedula')!.valid).toBe(true);
  });

  it('cedula should pass validation for pe-5-687 (lowercase)', () => {
    component.form.get('cedula')!.setValue('pe-5-687');
    expect(component.form.get('cedula')!.valid).toBe(true);
  });

  it('cedula should pass validation for E-8-123456', () => {
    component.form.get('cedula')!.setValue('E-8-123456');
    expect(component.form.get('cedula')!.valid).toBe(true);
  });

  it('cedula should pass validation for N-1234-5678', () => {
    component.form.get('cedula')!.setValue('N-1234-5678');
    expect(component.form.get('cedula')!.valid).toBe(true);
  });

  it('amount should fail min validation below 500', () => {
    component.form.get('amount')!.setValue(100);
    expect(component.form.get('amount')!.hasError('min')).toBe(true);
  });

  it('amount should fail max validation above 50000', () => {
    component.form.get('amount')!.setValue(60000);
    expect(component.form.get('amount')!.hasError('max')).toBe(true);
  });

  it('amount should be valid at 5000', () => {
    component.form.get('amount')!.setValue(5000);
    expect(component.form.get('amount')!.valid).toBe(true);
  });

  it('termMonths should fail min validation below 6', () => {
    component.form.get('termMonths')!.setValue(3);
    expect(component.form.get('termMonths')!.hasError('min')).toBe(true);
  });

  it('termMonths should fail max validation above 60', () => {
    component.form.get('termMonths')!.setValue(72);
    expect(component.form.get('termMonths')!.hasError('max')).toBe(true);
  });

  it('termMonths should fail integer validation for decimal values', () => {
    component.form.get('termMonths')!.setValue(12.5);
    expect(component.form.get('termMonths')!.hasError('integer')).toBe(true);
  });

  it('termMonths should be valid at 12', () => {
    component.form.get('termMonths')!.setValue(12);
    expect(component.form.get('termMonths')!.valid).toBe(true);
  });

  it('submit() should mark all fields touched when invalid', () => {
    component.submit();
    expect(component.form.get('cedula')!.touched).toBe(true);
    expect(component.form.get('amount')!.touched).toBe(true);
    expect(component.form.get('termMonths')!.touched).toBe(true);
  });

  it('submit() should call service.create with valid data', () => {
    const createSpy = vi.spyOn(service, 'create').mockReturnValue(of(mockCreated));

    component.form.get('cedula')!.setValue('8-123-456');
    component.form.get('amount')!.setValue(5000);
    component.form.get('termMonths')!.setValue(12);
    component.submit();

    expect(createSpy).toHaveBeenCalledWith({ cedula: '8-123-456', amount: 5000, termMonths: 12 });
  });

  it('submit() should emit created and reset form on success', () => {
    vi.spyOn(service, 'create').mockReturnValue(of(mockCreated));
    let emitted: CreditRequest | undefined;
    component.created.subscribe((r) => (emitted = r));

    component.form.get('cedula')!.setValue('8-123-456');
    component.form.get('amount')!.setValue(5000);
    component.form.get('termMonths')!.setValue(12);
    component.submit();

    expect(emitted).toEqual(mockCreated);
    expect(component.form.get('cedula')!.value).toBeFalsy();
  });

  it('submit() should set errorMessage on API failure', () => {
    vi.spyOn(service, 'create').mockReturnValue(
      throwError(() => ({ error: { message: 'Error del servidor' } })),
    );

    component.form.get('cedula')!.setValue('8-123-456');
    component.form.get('amount')!.setValue(5000);
    component.form.get('termMonths')!.setValue(12);
    component.submit();

    expect(component.errorMessage()).toBe('Error del servidor');
  });

  it('submit() should use fallback message when API message is absent', () => {
    vi.spyOn(service, 'create').mockReturnValue(throwError(() => ({})));

    component.form.get('cedula')!.setValue('8-123-456');
    component.form.get('amount')!.setValue(5000);
    component.form.get('termMonths')!.setValue(12);
    component.submit();

    expect(component.errorMessage()).toBe('Error al crear la solicitud.');
  });

  it('errorMessage() should clear when form value changes', () => {
    vi.spyOn(service, 'create').mockReturnValue(throwError(() => ({ error: { message: 'Fail' } })));

    component.form.get('cedula')!.setValue('8-123-456');
    component.form.get('amount')!.setValue(5000);
    component.form.get('termMonths')!.setValue(12);
    component.submit();

    expect(component.errorMessage()).toBeTruthy();

    component.form.get('cedula')!.setValue('7-654-321');
    expect(component.errorMessage()).toBeNull();
  });
});
