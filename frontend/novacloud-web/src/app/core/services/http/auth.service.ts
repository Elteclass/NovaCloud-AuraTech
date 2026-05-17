import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { TokenService } from '../token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = '/api/auth';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<any> {
    // Send property names to match backend DTO (`Email`, `Password`)
    return this.http.post<any>(`${this.base}/login`, { Email: email, Password: password }).pipe(
      tap(res => this.tokenService.setTokens(res))
    );
  }

  refreshToken(refreshToken: string): Observable<any> {
    // Backend DTO expects `RefreshToken` property
    return this.http.post<any>(`${this.base}/refresh`, { RefreshToken: refreshToken }).pipe(
      tap(res => this.tokenService.setTokens(res))
    );
  }

  logout(): Observable<void> {
    const accessToken = this.tokenService.getCognitoAccessToken();
    // Backend expects `AccessToken`
    return this.http.post<void>(`${this.base}/logout`, { AccessToken: accessToken }).pipe(
      tap(() => {
        this.tokenService.clear();
        this.router.navigate(['/login']);
      })
    );
  }

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.base}/me`);
  }
}
