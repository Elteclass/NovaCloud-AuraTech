import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { User, UserRole, UserStatus } from '../../models/user.model';

interface CreateUserRequest {
  email: string;
  name: string;
  role: string;
  password: string;
}

interface UpdateUserRequest {
  email: string;
  name: string;
  role: string;
  status: string;
}

interface BackendUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = '/api/admin/users';

  private _users = signal<User[]>([]);
  readonly users = this._users.asReadonly();

  private _search = signal<string>('');
  readonly searchQuery = this._search.asReadonly();

  readonly filteredUsers = computed(() => {
    const q = this._search().toLowerCase().trim();
    if (!q) return this._users();
    return this._users().filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q) );
  });

  // stats
  readonly totalUsers = signal(0);
  readonly activeUsers = signal(0);
  readonly inactiveUsers = signal(0);

  constructor(private http: HttpClient) {}

  listUsers(): Observable<User[]> {
    return this.http.get<BackendUserResponse[]>(this.base).pipe(
      map(users => (users || []).map(user => this.mapBackendUser(user))),
      tap(users => this._users.set(users))
    );
  }

  loadUsers(): void {
    this.listUsers().subscribe({
      next: (users) => {
        const list = users || [];
        this._users.set(list);
        this.updateStatsFromUsers(list);
      },
      error: () => {
        this._users.set([]);
        this.totalUsers.set(0);
        this.activeUsers.set(0);
        this.inactiveUsers.set(0);
      }
    });
  }

  createUser(data: CreateUserRequest): Observable<any> {
    return this.http.post<any>(this.base, {
      Email: data.email,
      Name: data.name,
      Role: this.toBackendRole(data.role),
      Password: data.password,
    }).pipe(
      tap(() => { this.loadUsers(); this.loadStats(); })
    );
  }

  updateUser(id: string, data: UpdateUserRequest): Observable<any> {
    return this.http.put<any>(`${this.base}/${id}`, {
      Email: data.email,
      Name: data.name,
      Role: this.toBackendRole(data.role),
      Status: this.toBackendStatus(data.status),
    }).pipe(
      tap(() => { this.loadUsers(); this.loadStats(); })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => { this.loadUsers(); this.loadStats(); })
    );
  }

  getStats(): Observable<any> {
    return this.http.get<any>('/api/admin/users/stats');
  }

  loadStats(): void {
    this.getStats().subscribe({
      next: (s) => {
        this.totalUsers.set(s.totalUsers || 0);
        this.activeUsers.set(s.activeUsers || 0);
        this.inactiveUsers.set(s.inactiveUsers || 0);
      },
      error: () => this.updateStatsFromUsers(this._users())
    });
  }

  setSearchQuery(q: string) { this._search.set(q); }

  private updateStatsFromUsers(users: User[]): void {
    const list = users || [];
    this.totalUsers.set(list.length);
    this.activeUsers.set(list.filter(user => user.status === 'Activo').length);
    this.inactiveUsers.set(list.filter(user => user.status !== 'Activo').length);
  }

  private mapBackendUser(user: BackendUserResponse): User {
    const role = this.toUiRole(user.role);
    const status = this.toUiStatus(user.status);
    const initials = this.getInitials(user.name || user.email);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      status,
      avatarInitials: initials,
      avatarColor: this.getAvatarColor(role),
      createdAt: user.createdAt,
      lastLogin: user.createdAt,
    };
  }

  private toBackendRole(role: string): string {
    if (role === 'Administrador') return 'admin';
    return role;
  }

  private toUiRole(role: string): UserRole {
    if (role === 'admin') return 'Administrador';
    if (role === 'Editor' || role === 'Visualizador' || role === 'Soporte') return role;
    return 'Visualizador';
  }

  private toBackendStatus(status: string): string {
    if (status === 'Activo') return 'active';
    if (status === 'Inactivo') return 'inactive';
    if (status === 'Suspendido') return 'inactive';
    return status;
  }

  private toUiStatus(status: string): UserStatus {
    if (status === 'active') return 'Activo';
    if (status === 'inactive') return 'Inactivo';
    if (status === 'suspended') return 'Suspendido';
    return 'Activo';
  }

  private getInitials(value: string): string {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  private getAvatarColor(role: UserRole): string {
    switch (role) {
      case 'Administrador': return 'orange';
      case 'Editor': return 'blue';
      case 'Soporte': return 'purple';
      default: return 'slate';
    }
  }
}
