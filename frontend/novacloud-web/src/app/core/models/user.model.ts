export type UserRole = 'Administrador' | 'Editor' | 'Visualizador' | 'Soporte';
export type UserStatus = 'Activo' | 'Inactivo' | 'Suspendido';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarInitials: string;
  avatarColor: string;   // Tailwind bg color class
  createdAt: string;     // ISO date string
  lastLogin: string;     // ISO date string
}
