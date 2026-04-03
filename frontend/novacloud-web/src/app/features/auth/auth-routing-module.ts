import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// 1. Usas el nombre exacto de la clase exportada
import { Login } from './pages/login/login';

const routes: Routes = [
  // 2. Lo asignas aquí
  { path: '', component: Login }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
