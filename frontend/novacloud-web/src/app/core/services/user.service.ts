import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole, UserStatus } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  // ─── Mock Data ────────────────────────────────────────────────────────────
  private readonly MOCK_USERS: User[] = [
    { id: 'USR-001', name: 'Ana Pérez',      email: 'ana.perez@auratech.com',      role: 'Administrador', status: 'Activo',    avatarInitials: 'AP', avatarColor: 'orange', createdAt: '2024-01-15', lastLogin: '2026-05-09' },
    { id: 'USR-002', name: 'Carlos Ruiz',    email: 'carlos.ruiz@auratech.com',    role: 'Editor',        status: 'Inactivo',  avatarInitials: 'CR', avatarColor: 'blue',   createdAt: '2024-02-20', lastLogin: '2026-04-30' },
    { id: 'USR-003', name: 'Elena Gómez',    email: 'elena.gomez@auratech.com',    role: 'Visualizador',  status: 'Activo',    avatarInitials: 'EG', avatarColor: 'green',  createdAt: '2024-03-05', lastLogin: '2026-05-08' },
    { id: 'USR-004', name: 'Marcos Soler',   email: 'marcos.soler@auratech.com',   role: 'Administrador', status: 'Activo',    avatarInitials: 'MS', avatarColor: 'purple', createdAt: '2024-03-18', lastLogin: '2026-05-09' },
    { id: 'USR-005', name: 'Laura Vidal',    email: 'laura.vidal@auratech.com',    role: 'Editor',        status: 'Activo',    avatarInitials: 'LV', avatarColor: 'pink',   createdAt: '2024-04-01', lastLogin: '2026-05-07' },
    { id: 'USR-006', name: 'Javier Torres',  email: 'javier.torres@auratech.com',  role: 'Soporte',       status: 'Suspendido',avatarInitials: 'JT', avatarColor: 'red',    createdAt: '2024-04-12', lastLogin: '2026-03-15' },
    { id: 'USR-007', name: 'María Castillo', email: 'maria.castillo@auratech.com', role: 'Visualizador',  status: 'Activo',    avatarInitials: 'MC', avatarColor: 'teal',   createdAt: '2024-05-03', lastLogin: '2026-05-09' },
    { id: 'USR-008', name: 'Roberto Núñez',  email: 'roberto.nunez@auratech.com',  role: 'Editor',        status: 'Activo',    avatarInitials: 'RN', avatarColor: 'indigo', createdAt: '2024-05-20', lastLogin: '2026-05-06' },
    { id: 'USR-009', name: 'Sofía Méndez',   email: 'sofia.mendez@auratech.com',   role: 'Soporte',       status: 'Activo',    avatarInitials: 'SM', avatarColor: 'yellow', createdAt: '2024-06-08', lastLogin: '2026-05-05' },
    { id: 'USR-010', name: 'Diego Herrera',  email: 'diego.herrera@auratech.com',  role: 'Visualizador',  status: 'Inactivo',  avatarInitials: 'DH', avatarColor: 'gray',   createdAt: '2024-06-25', lastLogin: '2026-04-10' },
    { id: 'USR-011', name: 'Camila Reyes',   email: 'camila.reyes@auratech.com',   role: 'Editor',        status: 'Activo',    avatarInitials: 'CR', avatarColor: 'cyan',   createdAt: '2024-07-14', lastLogin: '2026-05-08' },
    { id: 'USR-012', name: 'Andrés Pizarro', email: 'andres.pizarro@auratech.com', role: 'Administrador', status: 'Activo',    avatarInitials: 'AP', avatarColor: 'orange', createdAt: '2024-08-01', lastLogin: '2026-05-09' },
  ];

  // ─── State Signals ─────────────────────────────────────────────────────────
  private _users = signal<User[]>(this.MOCK_USERS);
  private _searchQuery = signal<string>('');

  // ─── Derived/Computed ─────────────────────────────────────────────────────
  readonly filteredUsers = computed(() => {
    const q = this._searchQuery().toLowerCase().trim();
    if (!q) return this._users();
    return this._users().filter(u =>
      u.name.toLowerCase().includes(q)  ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)  ||
      u.status.toLowerCase().includes(q)
    );
  });

  readonly totalUsers  = computed(() => this._users().length);
  readonly activeUsers = computed(() => this._users().filter(u => u.status === 'Activo').length);
  readonly inactiveUsers = computed(() => this._users().filter(u => u.status !== 'Activo').length);
  readonly searchQuery = this._searchQuery.asReadonly();

  // ─── Actions ───────────────────────────────────────────────────────────────
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  deleteUser(id: string): void {
    this._users.update(users => users.filter(u => u.id !== id));
  }

  addUser(user: Omit<User, 'id'>): void {
    const newId = `USR-${String(this._users().length + 1).padStart(3, '0')}`;
    this._users.update(users => [...users, { ...user, id: newId }]);
  }

  updateUser(updated: User): void {
    this._users.update(users => users.map(u => u.id === updated.id ? updated : u));
  }
}
