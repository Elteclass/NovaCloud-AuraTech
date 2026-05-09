import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // <-- 1. Importamos el módulo de rutas

@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule], // <-- 2. Lo agregamos aquí
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {}