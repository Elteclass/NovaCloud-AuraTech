import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // 1. Agrega ReactiveFormsModule aquí
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private router: Router) {
    // Se define el modelo de datos y sus reglas
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@auratech\\.com$') // Regex exclusivo corporativo
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8)
      ]]
    });
  }

  // Atajo para acceder a los controles desde el HTML más fácil
  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    
    setTimeout(() => {
    this.isLoading = false;
    const email = this.loginForm.value.email;
    
    // Guardamos el token de sesión
    localStorage.setItem('auratech_token', 'mock-jwt-token-12345');
    
    // Lógica para diferenciar Admin de Usuario

    if (email === 'admin@auratech.com') {
      localStorage.setItem('auratech_role', 'admin'); // Guardamos el rol
      this.router.navigate(['/admin/dashboard']);    // Redirigimos a la zona admin
    } else {
      localStorage.setItem('auratech_role', 'user');
      this.router.navigate(['/dashboard']);          // Redirigimos a la zona usuario
    }
    }, 1500);
  }

}