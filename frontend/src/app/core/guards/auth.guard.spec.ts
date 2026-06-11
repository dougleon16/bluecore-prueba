import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../../auth/auth.service';

describe('authGuard', () => {
  let router: Router;
  let authService: AuthService;

  function runGuard(): unknown {
    return TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('should return true when user is authenticated', () => {
    authService['_token'].set('valid-token');
    const result = runGuard();
    expect(result).toBe(true);
  });

  it('should return a UrlTree to /login when not authenticated', () => {
    authService['_token'].set(null);
    const result = runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });

  it('should redirect to /login when token is null', () => {
    const result = runGuard();
    expect(result).not.toBe(true);
    const tree = result as UrlTree;
    expect(tree.toString()).toContain('login');
  });
});
