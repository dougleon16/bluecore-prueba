import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'auth_token';

function makeJwt(payload: object): string {
  const b64 = (v: object) => btoa(JSON.stringify(v));
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.sig`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('token() should be null when localStorage is empty', () => {
    expect(service.token()).toBeNull();
  });

  it('isAuthenticated() should be false with no token', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('login() should POST and store the access_token', () => {
    const creds = { email: 'a@b.com', password: 'pass123' };
    const fakeToken = 'fake.jwt.token';

    service.login(creds).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(creds);
    req.flush({ access_token: fakeToken, statusCode: 200 });

    expect(localStorage.getItem(TOKEN_KEY)).toBe(fakeToken);
    expect(service.token()).toBe(fakeToken);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('register() should POST credentials', () => {
    const creds = { email: 'new@user.com', password: 'pass123' };
    service.register(creds).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(creds);
    req.flush({ statusCode: 201, id: 1, email: creds.email });
  });

  it('logout() should clear token and navigate to /login', () => {
    service['_token'].set('a-valid-token');
    localStorage.setItem(TOKEN_KEY, 'a-valid-token');

    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.logout();

    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('getProfile() should return null when no token', () => {
    expect(service.getProfile()).toBeNull();
  });

  it('getProfile() should decode JWT payload and return AuthUser', () => {
    const payload = { sub: 7, email: 'user@mail.com', iat: 0 };
    const fakeToken = makeJwt(payload);

    service.login({ email: payload.email, password: 'pass' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ access_token: fakeToken });

    const profile = service.getProfile();
    expect(profile).toEqual({ id: 7, email: 'user@mail.com' });
  });

  it('getProfile() should return null when token is malformed', () => {
    service['_token'].set('x.INVALID!!BASE64.x');
    expect(service.getProfile()).toBeNull();
  });

  it('isAuthenticated() should be true after login', () => {
    service.login({ email: 'a@b.com', password: 'p' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ access_token: 'tok' });
    expect(service.isAuthenticated()).toBe(true);
  });
});
