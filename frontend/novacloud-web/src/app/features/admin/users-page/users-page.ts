import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/http/admin.service';
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

  private readonly adminService = inject(AdminService);

  // ─── Stats (remote) ───────────────────────────────────────────────────────
  readonly totalUsers    = this.adminService.totalUsers;
  readonly activeUsers   = this.adminService.activeUsers;
  readonly inactiveUsers = this.adminService.inactiveUsers;

  // ─── Pagination ───────────────────────────────────────────────────────────
  readonly currentPage = signal(1);
  readonly pagedUsers = computed(() => {
    const list = this.adminService.filteredUsers();
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.adminService.filteredUsers().length / PAGE_SIZE)));

  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

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
    if (data.adminPassword.length < ADMIN_PASSWORD_MIN_LENGTH || data.userPassword.length < ADMIN_PASSWORD_MIN_LENGTH) return;
    if (this.formModalMode() === 'create') {
      this.adminService.createUser({ email: data.email, name: data.name, role: data.role, password: data.userPassword }).subscribe({
        next: () => { this.currentPage.set(1); this.showFormModal.set(false); },
        error: () => alert('Error creating user')
      });
    } else if (this.formModalMode() === 'edit' && this.userToEdit()) {
      const id = (this.userToEdit() as any).id;
      this.adminService.updateUser(id, { email: data.email, name: data.name, role: data.role, status: data.status }).subscribe({
        next: () => { this.currentPage.set(1); this.showFormModal.set(false); },
        error: () => alert('Error updating user')
      });
    }

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
    const id = this.userToDelete()!.id;
    this.adminService.deleteUser(id).subscribe({ next: () => { this.currentPage.set(1); this.showDeleteModal.set(false); this.userToDelete.set(null); }, error: () => alert('Error deleting user') });
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  // ─── Data loading ────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.adminService.loadUsers();
    this.adminService.loadStats();
  }

  // ─── Pagination helpers ───────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  get rangeStart(): number {
    return Math.min((this.currentPage() - 1) * PAGE_SIZE + 1, this.adminService.filteredUsers().length);
  }
  get rangeEnd(): number {
    return Math.min(this.currentPage() * PAGE_SIZE, this.adminService.filteredUsers().length);
  }
}
