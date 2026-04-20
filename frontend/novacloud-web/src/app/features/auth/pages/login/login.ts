import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
    
    // Se simula latencia de red de 1.5 segundos
    setTimeout(() => {
      this.isLoading = false;
      // Se navega al dashboard
      this.router.navigate(['/dashboard']); 
    }, 1500);
  }
}