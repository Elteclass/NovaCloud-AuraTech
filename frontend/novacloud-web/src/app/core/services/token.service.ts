import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private AUTH_TOKEN_KEY = 'auratech_token';
  private COGNITO_ACCESS_KEY = 'auratech_access_token';
  private REFRESH_KEY = 'auratech_refresh';
  private ROLE_KEY = 'auratech_role';

  getAccessToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  getCognitoAccessToken(): string | null {
    return localStorage.getItem(this.COGNITO_ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  setTokens(resp: any) {
    if (!resp) return;
    // Backend returns both ID token and access token; API auth must use the ID token.
    const authToken = resp.idToken ?? resp.IdToken ?? resp.token ?? resp.Token;
    const accessToken = resp.accessToken ?? resp.AccessToken;
    const refresh = resp.refreshToken ?? resp.RefreshToken;
    const role = resp.role ?? resp.Role;
    if (authToken) localStorage.setItem(this.AUTH_TOKEN_KEY, authToken);
    if (accessToken) localStorage.setItem(this.COGNITO_ACCESS_KEY, accessToken);
    if (refresh) localStorage.setItem(this.REFRESH_KEY, refresh);
    if (role) localStorage.setItem(this.ROLE_KEY, role);
  }

  clear() {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.COGNITO_ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }
}
