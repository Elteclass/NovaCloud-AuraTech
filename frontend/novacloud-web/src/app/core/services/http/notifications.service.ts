import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationCountResponse {
  count: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly base = '/api/notifications';

  constructor(private readonly http: HttpClient) {}

  getCount(): Observable<NotificationCountResponse> {
    return this.http.get<NotificationCountResponse>(`${this.base}/count`);
  }
}
