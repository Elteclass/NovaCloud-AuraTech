import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/http/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    const token = this.tokenService.getAccessToken();
    if (token) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(authReq).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return this.handle401(authReq, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);
      const refreshToken = this.tokenService.getRefreshToken();
      if (!refreshToken) {
        this.tokenService.clear();
        this.router.navigate(['/login']);
        return throwError(() => new Error('No refresh token'));
      }

      return this.authService.refreshToken(refreshToken).pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          const authToken = res.idToken ?? res.IdToken ?? res.token ?? res.Token;
          if (authToken) {
            this.refreshSubject.next(authToken);
          }
          const cloned = request.clone({ setHeaders: { Authorization: `Bearer ${authToken}` } });
          return next.handle(cloned);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.tokenService.clear();
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap((token) => {
          const cloned = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          return next.handle(cloned as HttpRequest<any>);
        })
      );
    }
  }
}
