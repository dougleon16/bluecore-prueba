import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  RegisterResponse,
} from '../core/models/user.model';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  register(credentials: RegisterCredentials) {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, credentials);
  }

  login(credentials: LoginCredentials) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(({ access_token }) => {
        localStorage.setItem(TOKEN_KEY, access_token);
        this._token.set(access_token);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    void this.router.navigate(['/login']);
  }

  getProfile(): AuthUser | null {
    const token = this._token();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as {
        sub: number;
        email: string;
      };
      return { id: payload.sub, email: payload.email };
    } catch {
      return null;
    }
  }
}
