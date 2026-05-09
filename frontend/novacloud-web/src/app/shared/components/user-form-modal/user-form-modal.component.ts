import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, UserRole, UserStatus } from '../../../core/models/user.model';

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  adminPassword: string;
}

/** Mode: 'create' → "Crear usuario" | 'edit' → "Guardar cambios" */
export type UserFormMode = 'create' | 'edit';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form-modal.component.html',
})
export class UserFormModalComponent implements OnChanges {

  /** Show or hide the modal */
  @Input() visible = false;

  /** 'create' or 'edit' — drives title, subtitle and button text */
  @Input() mode: UserFormMode = 'create';

  /** Pre-fill fields when editing */
  @Input() user: User | null = null;

  /** Emits the form data when the user submits */
  @Output() save   = new EventEmitter<UserFormData>();
  @Output() cancel = new EventEmitter<void>();

  // ── Form state ─────────────────────────────────────────────────────────────
  name          = '';
  email         = '';
  role: UserRole   = 'Visualizador';
  status: UserStatus = 'Activo';
  adminPassword = '';
  showPassword  = signal(false);

  // ── Validation ─────────────────────────────────────────────────────────────
  touched = false;

  readonly roles: UserRole[]     = ['Administrador', 'Editor', 'Visualizador', 'Soporte'];
  readonly statuses: UserStatus[] = ['Activo', 'Inactivo', 'Suspendido'];

  // ── Derived UI ─────────────────────────────────────────────────────────────
  get title(): string {
    return this.mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario';
  }

  get subtitle(): string {
    return this.mode === 'create'
      ? 'Completa los datos para crear un nuevo usuario en NovaCloud'
      : 'Modifica la información del usuario en NovaCloud';
  }

  get submitLabel(): string {
    return this.mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios';
  }

  get submitIcon(): string {
    return this.mode === 'create' ? 'person_add' : 'check_circle';
  }

  get passwordTooShort(): boolean {
    return this.touched && this.adminPassword.length < 8;
  }

  get canSubmit(): boolean {
    return (
      this.name.trim().length > 0 &&
      this.email.trim().length > 0 &&
      this.adminPassword.length >= 8
    );
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      // Reset & prefill when modal opens
      this.touched       = false;
      this.adminPassword = '';
      this.showPassword.set(false);

      if (this.mode === 'edit' && this.user) {
        this.name   = this.user.name;
        this.email  = this.user.email;
        this.role   = this.user.role;
        this.status = this.user.status;
      } else {
        this.name   = '';
        this.email  = '';
        this.role   = 'Visualizador';
        this.status = 'Activo';
      }
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    this.touched = true;
    if (!this.canSubmit) return;

    this.save.emit({
      name: this.name.trim(),
      email: this.email.trim(),
      role: this.role,
      status: this.status,
      adminPassword: this.adminPassword,
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
