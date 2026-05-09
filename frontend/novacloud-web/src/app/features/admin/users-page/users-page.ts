import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { UserAvatarComponent } from '../../../shared/components/user-avatar/user-avatar.component';
import { UserStatusBadgeComponent } from '../../../shared/components/user-status-badge/user-status-badge.component';
import { UserRoleBadgeComponent } from '../../../shared/components/user-role-badge/user-role-badge.component';
import { UserFormModalComponent, UserFormData, UserFormMode } from '../../../shared/components/user-form-modal/user-form-modal.component';
import { User } from '../../../core/models/user.model';

const PAGE_SIZE = 8;
/** Mock admin password validation: must be ≥ 8 chars (no real backend yet) */
const ADMIN_PASSWORD_MIN_LENGTH = 8;

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserAvatarComponent,
    UserStatusBadgeComponent,
    UserRoleBadgeComponent,
    UserFormModalComponent,
  ],
  templateUrl: './users-page.html',
})
export class UsersPage {

  private readonly userService = inject(UserService);

  // ─── Stats ────────────────────────────────────────────────────────────────
  readonly totalUsers    = this.userService.totalUsers;
  readonly activeUsers   = this.userService.activeUsers;
  readonly inactiveUsers = this.userService.inactiveUsers;

  // ─── Pagination ───────────────────────────────────────────────────────────
  readonly currentPage = signal(1);

  readonly pagedUsers = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.userService.filteredUsers().slice(start, start + PAGE_SIZE);
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.userService.filteredUsers().length / PAGE_SIZE))
  );

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  // ─── User Form Modal (create / edit) ──────────────────────────────────────
  showFormModal  = signal(false);
  formModalMode  = signal<UserFormMode>('create');
  userToEdit     = signal<User | null>(null);

  openCreateModal(): void {
    this.userToEdit.set(null);
    this.formModalMode.set('create');
    this.showFormModal.set(true);
  }

  openEditModal(user: User): void {
    this.userToEdit.set(user);
    this.formModalMode.set('edit');
    this.showFormModal.set(true);
  }

  onFormSave(data: UserFormData): void {
    // Mock auth: password must be ≥ 8 chars (already enforced in the component)
    if (data.adminPassword.length < ADMIN_PASSWORD_MIN_LENGTH) return;

    if (this.formModalMode() === 'create') {
      const initials = data.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

      this.userService.addUser({
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        avatarInitials: initials,
        avatarColor: 'blue',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: '—',
      });
      this.currentPage.set(1);
    } else if (this.formModalMode() === 'edit' && this.userToEdit()) {
      this.userService.updateUser({
        ...this.userToEdit()!,
        name:   data.name,
        email:  data.email,
        role:   data.role,
        status: data.status,
      });
    }

    this.showFormModal.set(false);
    this.userToEdit.set(null);
  }

  onFormCancel(): void {
    this.showFormModal.set(false);
    this.userToEdit.set(null);
  }

  // ─── Delete Modal ─────────────────────────────────────────────────────────
  showDeleteModal   = signal(false);
  userToDelete      = signal<User | null>(null);
  deletePassword    = '';
  deleteTouched     = false;
  deleteShowPass    = signal(false);

  get deletePasswordError(): boolean {
    return this.deleteTouched && this.deletePassword.length < ADMIN_PASSWORD_MIN_LENGTH;
  }

  get canDelete(): boolean {
    return this.deletePassword.length >= ADMIN_PASSWORD_MIN_LENGTH;
  }

  confirmDelete(user: User): void {
    this.userToDelete.set(user);
    this.deletePassword = '';
    this.deleteTouched  = false;
    this.deleteShowPass.set(false);
    this.showDeleteModal.set(true);
  }

  executeDelete(): void {
    this.deleteTouched = true;
    if (!this.canDelete) return;
    this.userService.deleteUser(this.userToDelete()!.id);
    this.currentPage.set(1);
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  // ─── Pagination helpers ───────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  get rangeStart(): number {
    return Math.min((this.currentPage() - 1) * PAGE_SIZE + 1, this.userService.filteredUsers().length);
  }
  get rangeEnd(): number {
    return Math.min(this.currentPage() * PAGE_SIZE, this.userService.filteredUsers().length);
  }
}
