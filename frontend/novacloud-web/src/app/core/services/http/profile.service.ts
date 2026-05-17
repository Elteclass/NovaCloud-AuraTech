import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProfileResponse {
  email: string;
  name: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly base = '/api/profile';

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.base);
  }
}
