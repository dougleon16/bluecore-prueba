import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the login heading', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Inicia sesión');
  });

  it('form should be invalid when empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('email field should be invalid with non-email value', () => {
    component.form.get('email')!.setValue('notanemail');
    expect(component.form.get('email')!.invalid).toBe(true);
    expect(component.form.get('email')!.hasError('email')).toBe(true);
  });

  it('password field should be invalid with less than 6 characters', () => {
    component.form.get('password')!.setValue('abc');
    expect(component.form.get('password')!.hasError('minlength')).toBe(true);
  });

  it('form should be valid with correct email and password', () => {
    component.form.get('email')!.setValue('user@test.com');
    component.form.get('password')!.setValue('password123');
    expect(component.form.valid).toBe(true);
  });

  it('submit() should mark all fields as touched when form is invalid', () => {
    component.submit();
    expect(component.form.get('email')!.touched).toBe(true);
    expect(component.form.get('password')!.touched).toBe(true);
  });

  it('submit() should call authService.login with credentials', () => {
    const loginSpy = vi
      .spyOn(authService, 'login')
      .mockReturnValue(of({ access_token: 'tok', status: 'ok' }));
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.form.get('email')!.setValue('user@test.com');
    component.form.get('password')!.setValue('password123');
    component.submit();

    expect(loginSpy).toHaveBeenCalledWith({ email: 'user@test.com', password: 'password123' });
  });

  it('submit() should navigate to /solicitudes on success', () => {
    vi.spyOn(authService, 'login').mockReturnValue(of({ access_token: 'tok', status: 'ok' }));
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.form.get('email')!.setValue('user@test.com');
    component.form.get('password')!.setValue('password123');
    component.submit();

    expect(navigateSpy).toHaveBeenCalledWith(['/solicitudes']);
  });

  it('submit() should set errorMessage on API error', () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      throwError(() => ({ error: { message: 'Correo o contraseña incorrectos' } })),
    );

    component.form.get('email')!.setValue('user@test.com');
    component.form.get('password')!.setValue('password123');
    component.submit();

    expect(component.errorMessage()).toBe('Correo o contraseña incorrectos');
  });

  it('submit() should use fallback error message when API message is absent', () => {
    vi.spyOn(authService, 'login').mockReturnValue(throwError(() => ({})));

    component.form.get('email')!.setValue('user@test.com');
    component.form.get('password')!.setValue('password123');
    component.submit();

    expect(component.errorMessage()).toBe('Credenciales incorrectas. Intenta de nuevo.');
  });

  it('loading() should be false after synchronous response', () => {
    vi.spyOn(authService, 'login').mockReturnValue(of({ access_token: 'tok', status: 'ok' }));
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.form.get('email')!.setValue('a@b.com');
    component.form.get('password')!.setValue('pass123');
    component.submit();

    expect(component.loading()).toBe(false);
  });

  it('errorMessage() should be cleared when form value changes', () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      throwError(() => ({ error: { message: 'Error' } })),
    );

    component.form.get('email')!.setValue('a@b.com');
    component.form.get('password')!.setValue('pass123');
    component.submit();

    expect(component.errorMessage()).toBeTruthy();

    component.form.get('email')!.setValue('new@b.com');
    expect(component.errorMessage()).toBeNull();
  });

  it('should show email validation error in DOM when touched and invalid', () => {
    component.form.get('email')!.setValue('bad');
    component.form.get('email')!.markAsTouched();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('correo válido');
  });

  it('should show password validation error in DOM when touched and too short', () => {
    component.form.get('password')!.setValue('abc');
    component.form.get('password')!.markAsTouched();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('6 caracteres');
  });
});
